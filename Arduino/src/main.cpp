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
      std::string value = pCharacteristic->getValue();
      if (pCharacteristic == redCharacteristic) {
        redValue = atoi(value.c_str());
        Serial.print("Received Red Value: ");
        Serial.println(redValue);
      } else if (pCharacteristic == greenCharacteristic) {
        greenValue = atoi(value.c_str());
        Serial.print("Received Green Value: ");
        Serial.println(greenValue);
      } else if (pCharacteristic == blueCharacteristic) {
        blueValue = atoi(value.c_str());
        Serial.print("Received Blue Value: ");
        Serial.println(blueValue);
      }
    }
};

void sendTankStatus() {
    int tank1Status = random(0, 2);
    int tank2Status = random(0, 2);
    int tank3Status = random(0, 2);
    
    char buffer[10];
    sprintf(buffer, "%02X%02X%02X", tank1Status, tank2Status, tank3Status);
    tankStatusCharacteristic->setValue(buffer);
    tankStatusCharacteristic->notify();

    // Print the concatenated message being sent
    Serial.print("Sending Tank Statuses: ");
    Serial.println(buffer);
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
        sendTankStatus();
    } else {
        Serial.println("Waiting for connection...");
    }

    delay(5000); // Update every 5 seconds
}
