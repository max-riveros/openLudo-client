#pragma once

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <cstring>    
#include <unistd.h>   

#include "NativeLoggerModule.h"

namespace facebook::react {

class LudoClient {
private:
    static LudoClient* instance;
    NativeLoggerModule* logger;
    int clientSocket = -1;
    std::string token = "";
    std::string playerId = "";
    std::string currentPlayer = "";
    std::string currentPawn = "";
    std::string color = "";

    LudoClient(NativeLoggerModule* logger) {
        this->logger = logger;
    }
    void sendMessage(jsi::Runtime& rt, std::string message);
    void listenToServer(std::shared_ptr<CallInvoker> jsInvoker);
public:
    static constexpr in_port_t DEFAULT_PORT = 1221;

    LudoClient() = delete;

    static void create(NativeLoggerModule* logger);
    static LudoClient* get();

    void connectToServer(jsi::Runtime& rt, std::shared_ptr<CallInvoker> jsInvoker);
    void registerSelf(jsi::Runtime& rt);
    void startGame(jsi::Runtime& rt);
    void rollDice(jsi::Runtime& rt);
    void selectPawn(jsi::Runtime& rt, int pawn);
    void quit(jsi::Runtime& rt);
    void closeConn(jsi::Runtime& rt);
};

}