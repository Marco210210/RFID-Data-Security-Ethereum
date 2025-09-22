#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

const int RST_PIN = 22; // Pin di reset per il modulo RFID
const int SS_PIN = 21;  // Pin di selezione schiavo per il modulo RFID
const char* ssid = "Marco WiFi";        // Inserisci il nome della tua rete WiFi
const char* password = "0000000001"; // Inserisci la password della tua rete WiFi

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
    Serial.begin(115200); // Inizia la comunicazione seriale
    Serial.println(F("RFID Reader and Data Sender"));

    // Connettiti al Wi-Fi
    WiFi.begin(ssid, password); 

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");

    SPI.begin();
    mfrc522.PCD_Init();
    mfrc522.PCD_DumpVersionToSerial();
    Serial.println(F("Scan PICC to see UID..."));
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;   // Oggetto per la richiesta HTTP

        http.begin("http://192.168.155.210:3000/receive-data"); // URL dell'API
        http.addHeader("Content-Type", "application/json"); 

        // Continua a leggere finché non viene letto un RFID valido
        while (true) {
            // Leggi l'UID dal modulo RFID
            if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
                byte UID[16];
                memcpy(UID, mfrc522.uid.uidByte, 16);


                // Converti l'UID in una stringa esadecimale
                String uidString = "";
                for (byte i = 0; i < mfrc522.uid.size; i++) {
                    uidString += String(UID[i], HEX);
                }

                Serial.print(F("Card UID: "));
                Serial.println(uidString);

                // Verifica se l'UID è valido (ad esempio, lunghezza maggiore di 0)
                if (uidString.length() > 0) {
                    // Dati da inviare in formato JSON con l'UID
                    String httpRequestData = "{\"rfid\":\"" + uidString + "\"}";

                    Serial.println(F("Sending RFID data to server..."));

                    // Invia la richiesta POST
                    int httpResponseCode = http.POST(httpRequestData);

                    // Ottieni la risposta
                    if (httpResponseCode > 0) {
                        String response = http.getString();
                        Serial.print(F("HTTP Response Code: "));
                        Serial.println(httpResponseCode);
                        Serial.println(F("Server Response:"));
                        Serial.println(response);
                    }
                    else {
                        Serial.print(F("Error on sending POST: "));
                        Serial.println(http.errorToString(httpResponseCode).c_str());
                    }

                    //Serial.println(F("RFID data sent to server successfully."));
                    break; // Esci dal loop una volta inviato con successo
                }
            }
        }

        http.end(); // Chiudi la connessione
    }
    delay(5000); // Attendi prima di inviare la prossima richiesta

    mfrc522.PICC_HaltA();
    delay(1000);
}
