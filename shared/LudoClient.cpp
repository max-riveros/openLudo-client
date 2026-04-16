#include "LudoClient.h"

namespace facebook::react {

LudoClient* LudoClient::instance = nullptr;

void LudoClient::create(NativeLoggerModule* logger) {
    if (!instance && logger) {
        instance = new LudoClient(logger);
    }
}

LudoClient* LudoClient::get() {
    return instance;
}

void LudoClient::connectToServer(jsi::Runtime& rt) {
    clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in serverAddress{};
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(DEFAULT_PORT);
    inet_pton(AF_INET, "192.168.0.49", &serverAddress.sin_addr);
    serverSocket = connect(clientSocket, (struct sockaddr*)&serverAddress, sizeof(serverAddress));
    logger->log(rt, "Address " + std::to_string(serverAddress.sin_addr.s_addr));
    logger->log(rt, "Connected with socket " + std::to_string(serverSocket));
}

void LudoClient::sendMessage(jsi::Runtime& rt) {
    const char* message = "Hello, server!";
    send(clientSocket, message, strlen(message), 0);
}

void LudoClient::closeConn(jsi::Runtime& rt) {
    close(clientSocket);
}

}