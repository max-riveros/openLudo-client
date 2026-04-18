#include "NativeGameModule.h"

namespace facebook::react {

NativeGameModule::NativeGameModule(std::shared_ptr<CallInvoker> jsInvoker) 
    : NativeGameModuleCxxSpec(std::move(jsInvoker)) {}


// -------- Util ----------

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

void NativeGameModule::handleLine(jsi::Runtime& rt, const std::string& line) {
        // TODO: send info to js
    auto map = parseLine(line);
    if (!map.contains("event")) return;
    std::string event = map["event"];
    if (event == "registered") {
        *token = map["token"];
        emitRegistered(rt, map["playerId"], map["color"]);
    }
    if (event == "playerSetup") {
        std::string id = map["id"];
        std::string color = map["color"];
        int startPosition = std::stoi(map["startPosition"]);
        int endPosition = std::stoi(map["endPosition"]);
        std::string pawns = map["pawns"];
        emitPlayerSetup(rt, id, color, startPosition, endPosition, pawns);
        return;
    }
    if (event == "gameStart") {
        emitGameStart(rt);
        return;
    }
    if (event == "playerTurn") {
        emitPlayerTurn(rt, map["player"]);
        return;
    }
    if (event == "waitingForDice") {
        emitWaitingForDice(rt);
        return;
    }
    if (event == "diceRolled") {
        int val = std::stoi(map["value"]);
        emitDiceRolled(rt, val);
        return;
    }
    if (event == "waitingForSelect") {
        emitWaitingForSelect(rt, map["pawns"]);
        return;
    }
    if (event == "selected") {
        int pawn = std::stoi(map["pawn"]);
        emitSelected(rt, pawn);
        return;
    }
    if (event == "playerSkipped") {
        emitPlayerSkipped(rt);
        return;
    }
    if (event == "pawnKilled") {
        int killer = std::stoi(map["killer"]);
        int killed = std::stoi(map["killed"]);
        emitPawnKilled(rt, killer, killed);
        return;
    }
    if (event == "pawnRevived") {
        int pawn = std::stoi(map["pawn"]);
        emitPawnRevived(rt, pawn);
        return;
    }
    if (event == "pawnSaved") {
        int pawn = std::stoi(map["pawn"]);
        emitPawnSaved(rt, pawn);
        return;
    }
    if (event == "pawnMovedToGoalArea") {
        int pawn = std::stoi(map["pawn"]);
        int position = std::stoi(map["position"]);
        emitPawnMovedToGoalArea(rt, pawn, position);
        return;
    }
    if (event == "pawnMoved") {
        int pawn = std::stoi(map["pawn"]);
        int from = std::stoi(map["from"]);
        int to = std::stoi(map["to"]);
        emitPawnMoved(rt, pawn, from, to);
        return;
    }
    if (event == "gameOver") {
        emitGameOver(rt, map["player"]);
        return;
    }
}

void NativeGameModule::log(jsi::Runtime& rt, std::string message) {
  logCallback_->call(rt, jsi::String::createFromUtf8(rt, message));
}


// ------ Networking ------

void NativeGameModule::sendMessage(jsi::Runtime& rt, std::string message) {
    if (clientSocket < 0) return;

    if ((*token).length() != 0) message = message + ";token=" + *token;
    send(clientSocket, message.c_str(), message.length(), 0);
}

void NativeGameModule::listen_() {
    char buffer[1024];
    ssize_t bytes = 1;
    while (clientSocket != -1) {
        bytes = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        std::string message;
        if (bytes > 0) {
            buffer[bytes] = '\0';
            for (const std::string& line : parseRecv(std::string(buffer))) {
                std::string lineCopy = std::string(line);
                jsInvoker_->invokeAsync([this, lineCopy](jsi::Runtime& rt) {
                  log(rt, "Server: " + lineCopy);
                  handleLine(rt, lineCopy);
                });
            }
            continue;
        } else if (bytes == 0) {
            message = "Server disconnected.";
        } else {
            message = "There was an error trying to communicate with the server: " + std::to_string(errno);
        }
        jsInvoker_->invokeAsync([this, message](jsi::Runtime& rt) {
            log(rt, message);
        });
        return;
    }
    close_();
}

void NativeGameModule::close_() {
    close(clientSocket);
    clientSocket = -1;
    *token = "";
}

void NativeGameModule::connect_(jsi::Runtime& rt) {
    clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in serverAddress{};
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(DEFAULT_PORT);
    inet_pton(AF_INET, "192.168.0.49", &serverAddress.sin_addr);
    if (connect(clientSocket, (struct sockaddr*)&serverAddress, sizeof(serverAddress)) < 0) {
        log(rt, "Failed to connect to Server! (" + std::to_string(errno) + ")");
        clientSocket = -1;
        return;
    }
    log(rt, "Address " + std::to_string(serverAddress.sin_addr.s_addr));
    log(rt, "Connected with socket " + std::to_string(clientSocket));

    std::thread thread = std::thread(&NativeGameModule::listen_, this);
    thread.detach();
}


// ---- Event Handling ----

void NativeGameModule::registerCallback(jsi::Runtime& rt, jsi::Function callback) {
    callback_ = std::make_shared<jsi::Function>(std::move(callback));
}
void NativeGameModule::registerLog(jsi::Runtime& rt, jsi::Function callback) {
    logCallback_ = std::make_shared<jsi::Function>(std::move(callback));
}

jsi::Value toJSIValue(jsi::Runtime& rt, const Value& v) {
  if (std::holds_alternative<int>(v))
    return jsi::Value(std::get<int>(v));

  if (std::holds_alternative<double>(v))
    return jsi::Value(std::get<double>(v));

  if (std::holds_alternative<bool>(v))
    return jsi::Value(std::get<bool>(v));

  if (std::holds_alternative<std::string>(v))
    return jsi::String::createFromUtf8(rt, std::get<std::string>(v));

  // fallback
  return jsi::Value::undefined();
}

jsi::Object toJSI(jsi::Runtime& rt, const Event& event) {
  jsi::Object obj(rt);

  obj.setProperty(rt, "type", jsi::String::createFromUtf8(rt, event.type));
  for (const auto& [key, value] : event.properties) {
    obj.setProperty(rt, jsi::String::createFromUtf8(rt, key), toJSIValue(rt, value));
  }
  
  return obj;
}

void NativeGameModule::enqueueEvent(Event event) {
  {
    std::lock_guard<std::mutex> lock(queueMutex_);
    eventQueue_.push(std::move(event));
  }
  scheduleFlush();
}

void NativeGameModule::scheduleFlush() {
  bool expected = false;
  if (!flushScheduled_.compare_exchange_strong(expected, true)) {
    return; // already scheduled
  }

  jsInvoker_->invokeAsync([this](jsi::Runtime& rt) {
    this->flushEvents(rt);
  });
}

void NativeGameModule::flushEvents(jsi::Runtime& rt) {
  if (!callback_) return;

  std::queue<Event> localQueue;

  {
    std::lock_guard<std::mutex> lock(queueMutex_);
    std::swap(localQueue, eventQueue_);
  }

  size_t size = localQueue.size();
  jsi::Array events(rt, size);

  size_t i = 0;
  while (!localQueue.empty()) {
    auto event = std::move(localQueue.front());
    localQueue.pop();
    events.setValueAtIndex(rt, i++, toJSI(rt, event));
  }
  callback_->call(rt, events);

  flushScheduled_ = false;

  // If more events arrived while flushing, schedule again
  {
    std::lock_guard<std::mutex> lock(queueMutex_);
    if (!eventQueue_.empty()) {
      scheduleFlush();
    }
  }
}


// ---- Methods ----

void NativeGameModule::connectToServer(jsi::Runtime& rt) {
    connect_(rt);
}

void NativeGameModule::registerSelf(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=register");
}

void NativeGameModule::startGame(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=start");
}

void NativeGameModule::selectPawn(jsi::Runtime& rt, int pawn) {
    sendMessage(rt, "cmd=selectPawn;pawn="+std::to_string(pawn));
}

void NativeGameModule::rollDice(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=rollDice");
}

void NativeGameModule::quit(jsi::Runtime& rt) {
    sendMessage(rt, "cmd=quit");
}

void NativeGameModule::disconnect(jsi::Runtime& rt) {
    close_();
}

// ---- Events ----

void NativeGameModule::emitRegistered(
  jsi::Runtime& rt, std::string playerId, std::string color
) {
  Event event;
  event.type = "registered";
  event.properties["playerId"] = playerId;
  event.properties["color"] = color;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPlayerSetup(
  jsi::Runtime& rt, std::string id, std::string color, 
  int startPosition, int endPosition, std::string pawns
) {
  Event event;
  event.type = "playerSetup";
  event.properties["id"] = id;
  event.properties["color"] = color;
  event.properties["startPosition"] = startPosition;
  event.properties["endPosition"] = endPosition;
  event.properties["pawns"] = pawns;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitGameStart(jsi::Runtime& rt) {
  Event event;
  event.type = "gameStart";
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPlayerTurn(jsi::Runtime& rt, std::string playerId) {
  Event event;
  event.type = "playerTurn";
  event.properties["playerId"] = playerId;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitWaitingForDice(jsi::Runtime& rt) {
  Event event;
  event.type = "waitingForDice";
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitDiceRolled(jsi::Runtime& rt, int value) {
  Event event;
  event.type = "diceRolled";
  event.properties["value"] = value;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitWaitingForSelect(jsi::Runtime& rt, std::string pawns) {
  Event event;
  event.type = "waitingForSelect";
  event.properties["pawns"] = pawns;
  enqueueEvent(std::move(event));
}  

void NativeGameModule::emitSelected(jsi::Runtime& rt, int pawnId) {
  Event event;
  event.type = "selected";
  event.properties["pawnId"] = pawnId;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPlayerSkipped(jsi::Runtime& rt) {
  Event event;
  event.type = "playerSkipped";
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnKilled(jsi::Runtime& rt, int killerId, int killedId) {
  Event event;
  event.type = "pawnKilled";
  event.properties["killedId"] = killedId;
  event.properties["killerId"] = killerId;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnRevived(jsi::Runtime& rt, int pawn) {
  Event event;
  event.type = "pawnRevived";
  event.properties["pawn"] = pawn;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnSaved(jsi::Runtime& rt, int pawn) {
  Event event;
  event.type = "pawnSaved";
  event.properties["pawn"] = pawn;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnMovedToGoalArea(jsi::Runtime& rt, int pawn, int position) {
  Event event;
  event.type = "pawnMovedToGoalArea";
  event.properties["pawn"] = pawn;
  event.properties["position"] = position;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnMoved(jsi::Runtime& rt, int pawn, int fromPosition, int toPosition) {
  Event event;
  event.type = "pawnMoved";
  event.properties["pawn"] = pawn;
  event.properties["fromPosition"] = fromPosition;
  event.properties["toPosition"] = toPosition;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitGameOver(jsi::Runtime& rt, std::string winner) {
  Event event;
  event.type = "gameOver";
  event.properties["winner"] = winner;
  enqueueEvent(std::move(event));
}

} // namespace facebook::react
