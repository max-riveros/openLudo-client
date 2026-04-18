#pragma once

#include <ClientSpecsJSI.h>
#include <ReactCommon/CallInvoker.h>

#include "LudoClient.h"

#include <memory>
#include <queue>
#include <mutex>
#include <functional>

namespace facebook::react {

using Value = std::variant<int, double, bool, std::string>;
struct Event {
  std::string type;
  std::unordered_map<std::string, Value> properties;
};

class NativeGameModule : public NativeGameModuleCxxSpec<NativeGameModule> {
  std::shared_ptr<jsi::Function> logCallback_;

  std::shared_ptr<jsi::Function> callback_;
  std::queue<Event> eventQueue_;
  std::mutex queueMutex_;
  std::atomic<bool> flushScheduled_{false};

  int clientSocket = -1;
  std::string token = "";
  std::string playerId = "";
  std::string currentPlayer = "";
  std::string currentPawn = "";
  std::string color = "";

  void sendMessage(jsi::Runtime& rt, std::string message);
  void listenToServer(std::shared_ptr<CallInvoker> jsInvoker);
  void log(jsi::Runtime& rt, std::string message);
public:
  static constexpr in_port_t DEFAULT_PORT = 1221;
  NativeGameModule(std::shared_ptr<CallInvoker> jsInvoker);

  // Event Handling
  void registerLog(jsi::Runtime& rt, jsi::Function callback);
  void registerCallback(jsi::Runtime& rt, jsi::Function callback);
  void enqueueEvent(Event event);
  void scheduleFlush();
  void flushEvents(jsi::Runtime& rt);

  // Methods
  void connectToServer(jsi::Runtime& rt, std::shared_ptr<CallInvoker> jsInvoker);
  void startGame(jsi::Runtime& rt);
  void registerSelf(jsi::Runtime& rt);
  void rollDice(jsi::Runtime& rt);
  void selectPawn(jsi::Runtime& rt, int pawnId);
  void disconnect(jsi::Runtime& rt);
  void quit(jsi::Runtime& rt);

  // Events
  void emitRegistered(
    jsi::Runtime& rt, std::string playerId, std::string color, 
  );
  void emitPlayerSetup(
    jsi::Runtime& rt, std::string id, std::string color, 
    int startPosition, int endPosition, std::string pawns
  );
  void emitGameStart(jsi::Runtime& rt);
  void emitPlayerTurn(jsi::Runtime& rt, std::string playerId);
  void emitWaitingForDice(jsi::Runtime& rt);
  void emitDiceRolled(jsi::Runtime& rt, int value);
  void emitWaitingForSelect(jsi::Runtime& rt);
  void emitSelected(jsi::Runtime& rt, int pawnId);
  void emitPlayerSkipped(jsi::Runtime& rt);
  void emitPawnKilled(jsi::Runtime& rt, int killerId, int killedId);
  void emitPawnRevived(jsi::Runtime& rt, int pawn);
  void emitPawnSaved(jsi::Runtime& rt, int pawn);
  void emitPawnMovedToGoalArea(jsi::Runtime& rt, int pawn, int position);
  void emitPawnMoved(jsi::Runtime& rt, int pawn, int fromPosition, int toPosition);
  void emitGameOver(jsi::Runtime& rt, std::string winner);
};

} // namespace facebook::react

