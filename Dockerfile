FROM python:3.12-slim as builder

ARG ARDUINO_BOARD_MANAGER_ADDITIONAL_URLS="https://arduino.esp8266.com/stable/package_esp8266com_index.json https://dl.espressif.com/dl/package_esp32_index.json"
ENV ARDUINO_BOARD_MANAGER_ADDITIONAL_URLS="${ARDUINO_BOARD_MANAGER_ADDITIONAL_URLS}"

RUN pip3 install pyserial
RUN apt update && apt install -y curl
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/bin sh

RUN arduino-cli core update-index
RUN arduino-cli core install esp8266:esp8266 
RUN arduino-cli core install esp32:esp32

# Packages
RUN arduino-cli lib install WiFiManager
RUN arduino-cli lib install PubSubClient

# Sketch
ARG SKETCH="wifi-button"
COPY ./${SKETCH}/ /${SKETCH}/
WORKDIR /${SKETCH}

# Replacements
ARG SECRET_WIFI_SSID \
         SECRET_WIFI_PASSWORD \
         SECRET_MQTT_USER \
         SECRET_MQTT_PASSWORD \
         SECRET_MQTT_HOST \
         SECRET_MQTT_PORT \
         SECRET_MQTT_CLIENT_ID

ENV SECRET_WIFI_SSID="${SECRET_WIFI_SSID}" \
         SECRET_WIFI_PASSWORD="${SECRET_WIFI_PASSWORD}" \
         SECRET_MQTT_USER="${SECRET_MQTT_USER}" \
         SECRET_MQTT_PASSWORD="${SECRET_MQTT_PASSWORD}" \
         SECRET_MQTT_HOST="${SECRET_MQTT_HOST}" \
         SECRET_MQTT_PORT="${SECRET_MQTT_PORT}" \
         SECRET_MQTT_CLIENT_ID="${SECRET_MQTT_CLIENT_ID}"

# RUN sed -i "s/YOUR-SSID/${SECRET_WIFI_SSID}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-PASSWORD/${SECRET_WIFI_PASSWORD}/g"arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-USER/${SECRET_MQTT_USER}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-PASSWORD/${SECRET_MQTT_PASSWORD}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-HOST/${SECRET_MQTT_HOST}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-PORT/${SECRET_MQTT_PORT}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-TOPIC/${SECRET_MQTT_TOPIC}/g" arduino_secrets.h
# RUN sed -i "s/YOUR-MQTT-CLIENT-ID/${SECRET_MQTT_CLIENT_ID}/g" arduino_secrets.h


# Compile
RUN arduino-cli compile --fqbn esp8266:esp8266:generic ${SKETCH}  --build-path=/dist/esp8266-generic
#RUN arduino-cli compile --fqbn esp32:esp32:d1_mini32 ${SKETCH}  --build-path=/dist/esp32-esp32-d1_mini32

FROM netresearch/node-webserver as httpd

COPY ./app  /app

ARG SKETCH="wifi-button"
COPY  --from=builder /dist/esp8266-generic/${SKETCH}.ino.bin  /app/public/releases/${SKETCH}.esp8266.bin
#COPY  --from=builder /dist/esp32-esp32-d1_mini32/${SKETCH}.ino.bin  /app/public/releases/${SKETCH}.esp32.bin

WORKDIR /app/public
