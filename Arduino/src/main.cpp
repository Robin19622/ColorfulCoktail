#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *tankStatusCharacteristic = NULL;
BLECharacteristic *redCharacteristic = NULL;
BLECharacteristic *greenCharacteristic = NULL;
BLECharacteristic *blueCharacteristic = NULL;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define TANK_STATUS_UUID "1dcef519-43ec-4267-8d4a-3b02ca61765d"
#define RED_UUID "8a7f1168-48af-4ef4-9bae-a8d15f08cefe"
#define GREEN_UUID "77b9c657-94d5-4f72-bfd4-53758dffa508"
#define BLUE_UUID "0dcef519-43ec-4267-8d4a-3b02ca61765d"

bool deviceConnected = false;
int redValue = 0;
int greenValue = 0;
int blueValue = 0;

class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer *pServer) {
      deviceConnected = true;
      Serial.println("Connected");
    };

    void onDisconnect(BLEServer *pServer) {
      deviceConnected = false;
      Serial.println("Disconnected");
      pServer->startAdvertising(); // Restart advertising
      Serial.println("Advertising restarted");
    }
};

class RecipeCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        static int redTemp = -1;
        static int greenTemp = -1;
        static int blueTemp = -1;
        
        std::string value = pCharacteristic->getValue();

        if (pCharacteristic == redCharacteristic) {
            redTemp = atoi(value.c_str());
        } else if (pCharacteristic == greenCharacteristic) {
            greenTemp = atoi(value.c_str());
        } else if (pCharacteristic == blueCharacteristic) {
            blueTemp = atoi(value.c_str());
        }

        // Check if all values are updated
        if (redTemp != -1 && greenTemp != -1 && blueTemp != -1) {
            // All values are updated, set the actual values
            redValue = redTemp;
            greenValue = greenTemp;
            blueValue = blueTemp;
            
            // Send the RGB values to the Arduino Uno with markers
            String rgbData = "<RGB>" + String(redValue) + "," + String(greenValue) + "," + String(blueValue) + "\n";
            Serial.print(rgbData);
            Serial.flush(); // Ensure the serial buffer is clear
            
            // Add a short delay to ensure the Arduino processes the data
            delay(50); // Adjust the delay as needed
            
            // Reset temp values to indicate they need updating again
            redTemp = -1;
            greenTemp = -1;
            blueTemp = -1;
        }
    }
};




void sendTankStatus(int tank1Status, int tank2Status, int tank3Status) {
    char buffer[10];
    sprintf(buffer, "%02X%02X%02X", tank1Status, tank2Status, tank3Status);
    tankStatusCharacteristic->setValue(buffer);
    tankStatusCharacteristic->notify();

    // Print the concatenated message being sent
    //Serial.print("Sending Tank Statuses: ");
    //Serial.println(buffer);
}

void setup() {
    Serial.begin(115200);
    BLEDevice::init("ColorControl");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    BLEService *pService = pServer->createService(SERVICE_UUID);

    tankStatusCharacteristic = pService->createCharacteristic(
                                TANK_STATUS_UUID,
                                BLECharacteristic::PROPERTY_READ |
                                BLECharacteristic::PROPERTY_NOTIFY);
    tankStatusCharacteristic->addDescriptor(new BLE2902());

    redCharacteristic = pService->createCharacteristic(
                                RED_UUID,
                                BLECharacteristic::PROPERTY_WRITE);
    redCharacteristic->setCallbacks(new RecipeCallbacks());

    greenCharacteristic = pService->createCharacteristic(
                                GREEN_UUID,
                                BLECharacteristic::PROPERTY_WRITE);
    greenCharacteristic->setCallbacks(new RecipeCallbacks());

    blueCharacteristic = pService->createCharacteristic(
                                BLUE_UUID,
                                BLECharacteristic::PROPERTY_WRITE);
    blueCharacteristic->setCallbacks(new RecipeCallbacks());

    pService->start();
    pServer->getAdvertising()->start();
    Serial.println("Waiting for client connection...");
}

void loop() {
    if (deviceConnected) {
        // Handle receiving tank statuses from Arduino Uno
        if (Serial.available()) {
            String data = Serial.readStringUntil('\n'); // Read until newline
            // Serial.print("Received data: ");
            // Serial.println(data);

            if (data.startsWith("<TANK>")) {
                data = data.substring(6); // Remove the marker
                int commaIndex1 = data.indexOf(',');
                int commaIndex2 = data.indexOf(',', commaIndex1 + 1);
                if (commaIndex1 > 0 && commaIndex2 > 0) {
                    int tank1Status = data.substring(0, commaIndex1).toInt();
                    int tank2Status = data.substring(commaIndex1 + 1, commaIndex2).toInt();
                    int tank3Status = data.substring(commaIndex2 + 1).toInt();

                    // Print the received tank statuses
                    // Serial.print("Tank1Status: ");
                    // Serial.print(tank1Status);
                    // Serial.print(", Tank2Status: ");
                    // Serial.print(tank2Status);
                    // Serial.print(", Tank3Status: ");
                    // Serial.println(tank3Status);

                    // Call the function to send the tank statuses
                    sendTankStatus(tank1Status, tank2Status, tank3Status);
                } else {
                    // Serial.println("Invalid TANK data format received");
                }
            }
        }
    } else {
        Serial.println("Waiting for connection...");
        delay(5000); // Check every 5 seconds
    }
}