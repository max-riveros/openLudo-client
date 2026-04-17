#include "LudoClient.h"

#include <thread>

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

void LudoClient::sendMessage(jsi::Runtime& rt, std::string message) {
    if (serverSocket < 0) return;

    if (token.length() != 0) message = message + ";token=" + token;
    send(clientSocket, message.c_str(), message.length(), 0);
}

void LudoClient::listenToServer(std::shared_ptr<CallInvoker> jsInvoker) {
    char buffer[1024];
    ssize_t bytes = 1;
    while (clientSocket != -1 && bytes > 0) {
        bytes = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        std::string message;
        if (bytes > 0) {
            buffer[bytes] = '\0';
            message = "Message from Server: " + std::string(buffer);
        } else if (bytes == 0) {
            message = "Server disconnected.";
        } else {
            message = "There was an error trying to communicate with the server: " + std::to_string(errno);
        }
        jsInvoker->invokeAsync([this, message](jsi::Runtime& rt) {
            logger->log(rt, message);
        });
    }
}

void LudoClient::connectToServer(jsi::Runtime& rt, std::shared_ptr<CallInvoker> jsInvoker) {
    clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in serverAddress{};
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(DEFAULT_PORT);
    inet_pton(AF_INET, "192.168.0.49", &serverAddress.sin_addr);
    if (connect(clientSocket, (struct sockaddr*)&serverAddress, sizeof(serverAddress)) < 0) {
        logger->log(rt, "Failed to connect to Server!");
        clientSocket = -1;
        return;
    }
    logger->log(rt, "Address " + std::to_string(serverAddress.sin_addr.s_addr));
    logger->log(rt, "Connected with socket " + std::to_string(serverSocket));

    std::thread thread = std::thread(&LudoClient::listenToServer, this, jsInvoker);
    thread.detach();
}

void LudoClient::registerSelf(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=register");
    token = "00000";
}

void LudoClient::selectPawn(jsi::Runtime& rt, int pawn) {
    sendMessage(rt, "cmd=selectPawn;pawn="+std::to_string(pawn));
}

void LudoClient::rollDice(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=rollDice");
}

void LudoClient::quit(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=quit");
    closeConn(rt);
    delete this;
}

void LudoClient::closeConn(jsi::Runtime& rt) {
    close(clientSocket);
    serverSocket = -1;
    clientSocket = -1;
    token = "";
}

}