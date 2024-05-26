#include <SoftwareSerial.h>

SoftwareSerial espSerial(2, 3); // RX, TX

void setup() {
    Serial.begin(115200); // Start serial communication for debugging at 115200 baud
    espSerial.begin(115200); // Start software serial communication at 115200 baud
    randomSeed(analogRead(0)); // Seed the random number generator

    // Print a message to indicate that the setup is complete
    Serial.println("Setup complete. Starting to send tank statuses...");
}

void loop() {
    // Handle sending tank statuses
    int tank1Status = random(0, 2);
    int tank2Status = random(0, 2);
    int tank3Status = random(0, 2);

    // Print the generated tank statuses for debugging
    Serial.print("Generated Tank1Status: ");
    Serial.print(tank1Status);
    Serial.print(", Tank2Status: ");
    Serial.print(tank2Status);
    Serial.print(", Tank3Status: ");
    Serial.println(tank3Status);

    // Send the tank statuses to the software serial port with markers
    espSerial.print("<TANK>");
    espSerial.print(tank1Status);
    espSerial.print(",");
    espSerial.print(tank2Status);
    espSerial.print(",");
    espSerial.println(tank3Status); // Use println to ensure each set of statuses is on a new line

    delay(5000); // Wait for 5 seconds before sending the next statuses

    // Handle receiving RGB values
    if (espSerial.available()) {
        String data = espSerial.readStringUntil('\n'); // Read until newline
        // Serial.print("Received data: ");
        // Serial.println(data);

        if (data.startsWith("<RGB>")) {
            data = data.substring(5); // Remove the marker
            int commaIndex1 = data.indexOf(',');
            int commaIndex2 = data.indexOf(',', commaIndex1 + 1);
            if (commaIndex1 > 0 && commaIndex2 > 0) {
                int redValue = data.substring(0, commaIndex1).toInt();
                int greenValue = data.substring(commaIndex1 + 1, commaIndex2).toInt();
                int blueValue = data.substring(commaIndex2 + 1).toInt();

                // Print the received color values
                Serial.print("Red: ");
                Serial.print(redValue);
                Serial.print(", Green: ");
                Serial.print(greenValue);
                Serial.print(", Blue: ");
                Serial.println(blueValue);
            } else {
                Serial.println("Invalid RGB data format received");
            }
        }
    }
}
