#include "arduino_secrets.h"
/*
 AndyW Dash Button V1
 23.02.2018
 by Andy Wolff
*/

//**********************************************************************
// INCLUDE
//**********************************************************************
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPUpdateServer.h>

//**********************************************************************
// DEFINE
//**********************************************************************
#define LED 2               // GPIO2 - Onboard LED
#define SETUP_BUTTON 12     // Button for Webupdate

//**********************************************************************
// PARAMETER
//**********************************************************************
// Wifi
const char* host = "dash-webupdate";
const char  ssid[] = SECRET_WIFI_SSID;
const char  password[] = SECRET_WIFI_PASSWORD;
// MQTT
const char* mqtt_server = "mqtt.andrelademann.de";
const char* mqtt_clientId = "dash";
const char  mqtt_user[] = SECRET_MQTT_USER;
const char  mqtt_password[] = SECRET_MQTT_PASSWORD;
const char* outTopicMsg = "dev/dashbutton/message";
const char* outTopicVCC = "dev/dashbutton/vcc";
// Hardware
boolean mSetupButton = LOW;         // flag Setup Button
int ledState = HIGH;                // ledState used to set the LED
unsigned long previousMillis = 0;   // will store last time LED was updated
const long interval = 500;          // interval at which to blink (milliseconds)
long sendtime = 0;                  // sendtime
char msg[50];                       // message for mqtt publish
int state = 0;                      // for Statemachine

//**********************************************************************
// SETUP
//**********************************************************************
ADC_MODE (ADC_VCC);                 // VCC Read

ESP8266WebServer httpServer(80);
ESP8266HTTPUpdateServer httpUpdater;

WiFiClient espClient;
PubSubClient client(espClient);

void setup(){ 
  pinMode(SETUP_BUTTON, INPUT_PULLUP);    // Webupdate Button
  pinMode(LED, OUTPUT);                   // Onboard LED on ESP-08S as Output                             
  sendtime = millis();                    
  Serial.begin(115200);  

// Setup Wifi
  setup_wifi();

// Setup MQTT
  client.setServer(mqtt_server, 1883);
  
// Setup httpUpdater
  MDNS.begin(host);
  httpUpdater.setup(&httpServer);
  httpServer.begin();
  MDNS.addService("http", "tcp", 80);
} 

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Client ID connected
    if (client.connect(mqtt_clientId, mqtt_user, mqtt_password)) {
      Serial.print(mqtt_clientId);
      Serial.println(" connected");
      // Once connected, publish an announcement...
      client.publish("outTopic", "connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

//**********************************************************************
// LOOP
//**********************************************************************
void loop(){ 
  
  // HTTPServer Handle Client
  httpServer.handleClient();

  // MQTT Client
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // LED blink when ESP is in Upload Mode
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED
    previousMillis = currentMillis;

    // if the LED is off turn it on and vice-versa:
    if ((ledState == LOW) && (mSetupButton = HIGH)){
      ledState = HIGH;
    } else {
      ledState = LOW;
    }
    // set the LED with the ledState of the variable:
    digitalWrite(LED, ledState);
  } 

// Read the VCC from Battery
  float vcc = ESP.getVcc() / 1000.0;
  vcc = vcc - 0.12;     // correction value from VCC

// StateMachine for send the telegram to MQTT
  switch (state) {
    case 0:    // SETUP
      if (digitalRead(SETUP_BUTTON) == LOW) {
        mSetupButton = HIGH;
        Serial.println("Webupdate started ...");
        Serial.printf("Open http://%s.local/update in your browser\n", host);
      } else {
        state = 1;
      }

      if (mSetupButton == HIGH){
        state = 0;
      }
      break;
    case 1:    // Give out the message "ON"
        client.publish(outTopicMsg, "ON");
        Serial.println("Send: ON");
        state = 2;
      break;
    case 2:    // Give out the message "OFF"
        client.publish(outTopicMsg, "OFF");
        Serial.println("Send: OFF");
        state = 3;
      break;
    case 3:    // Give out the message of the State from VCC
        dtostrf(vcc, sizeof(vcc), 2, msg);
        client.publish(outTopicVCC, msg);
        Serial.print("VCC: ");
        Serial.print(msg);
        Serial.println("V");
        state = 4;
      break;
    case 4:    // Give out the Sendtime on Serial and go to Deepsleep  
        sendtime = millis() - sendtime;
        Serial.print("Sendtime: ");
        Serial.print(sendtime);
        Serial.println("ms");
        Serial.print("Good Night ...");
        ESP.deepSleep(0, WAKE_RFCAL);
      break;
  }
  delay(100);  // delay in between reads for stability 
}
