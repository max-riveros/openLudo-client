#include "LudoClient.h"

#include <map>
#include <vector>
#include <thread>

namespace facebook::react {

LudoClient* LudoClient::instance = nullptr;

std::vector<std::string> parseRecv(const std::string& input) {
    std::vector<std::string> lines;

    std::stringstream ss(input);
    std::string line;

    while (std::getline(ss, line, '\n')) {
        lines.push_back(line);
    }

    return lines;
}

std::map<std::string, std::string> parseLine(const std::string& input) {
    std::map<std::string, std::string> result;

    std::stringstream ss(input);
    std::string pair;

    while (std::getline(ss, pair, ';')) {
        auto pos = pair.find('=');
        if (pos != std::string::npos) {
            result[pair.substr(0, pos)] = pair.substr(pos + 1);
        }
    }

    return result;
}

void handleLine(const std::string& line) {
        // TODO: send info to js
    auto map = parseLine(line);
    if (!map.contains("event")) return;
    std::string event = map["event"];
    if (event == "registered") {
        token = map["token"];
        playerId = map["playerId"];
        color = map["color"];
    }
    if (event == "playerSetup") {
        // keys: id, color, startPosition, endPosition, pawns (delim ',')
        return;
    }
    if (event == "gameStart") {
        // keys: playerCount
        return;
    }
    if (event == "playerTurn") {
        currentPlayer = map["player"];
        if (currentPlayer != playerId) {
            // Disable buttons
        } else {
            // Enable buttons
        }
        return;
    }
    if (event == "waitingForDice") {
        if (currentPlayer != playerId) return;
        // Enable button
        return;
    }
    if (event == "diceRolled") {
        // keys: value
        return;
    }
    if (event == "waitingForSelect") {
        if (currentPlayer != playerId) return;
        // Enable button
        return;
    }
    if (event == "selected") {
        currentPawn = map["pawn"];
        return;
    }
    if (event == "playerSkipped") {
        return;
    }
    if (event == "pawnKilled") {
        // keys: killer, killed
        return;
    }
    if (event == "pawnRevived") {
        // keys: pawn
        return;
    }
    if (event == "pawnSaved") {
        // keys: pawn
        return;
    }
    if (event == "pawnMovedToGoalArea") {
        // keys: pawn
        return;
    }
    if (event == "pawnMoved") {
        // keys: pawn, from, to
        return;
    }
    if (event == "gameOver") {
        // keys: player
        return;
    }
}

void LudoClient::create(NativeLoggerModule* logger) {
    if (!instance && logger) {
        instance = new LudoClient(logger);
    }
}

LudoClient* LudoClient::get() {
    return instance;
}

void LudoClient::sendMessage(jsi::Runtime& rt, std::string message) {
    if (clientSocket < 0) return;

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
            message = "";
            for (const std::string& line : parseRecv(std::string(buffer))) {
                message += "Message from Server: " + line + "\n";
                handleLine(line);
            }
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
    logger->log(rt, "Connected with socket " + std::to_string(clientSocket));

    std::thread thread = std::thread(&LudoClient::listenToServer, this, jsInvoker);
    thread.detach();
}

void LudoClient::registerSelf(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=register");
}

void LudoClient::startGame(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=start");
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
}

void LudoClient::closeConn(jsi::Runtime& rt) {
    close(clientSocket);
    clientSocket = -1;
    token = "";
}

}