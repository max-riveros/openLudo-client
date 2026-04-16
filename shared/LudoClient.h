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
    int serverSocket = -1;

    LudoClient(NativeLoggerModule* logger) {
        this->logger = logger;
    }
public:
    static constexpr in_port_t DEFAULT_PORT = 1221;

    LudoClient() = delete;

    static void create(NativeLoggerModule* logger);
    static LudoClient* get();

    void connectToServer(jsi::Runtime& rt);
    void sendMessage(jsi::Runtime& rt);
    void closeConn(jsi::Runtime& rt);
};

}