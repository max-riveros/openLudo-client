#include "NativeGameModule.h"
#include <iostream>

namespace facebook::react {

NativeGameModule::NativeGameModule(std::shared_ptr<CallInvoker> jsInvoker) 
    : NativeGameModuleCxxSpec(std::move(jsInvoker)) {}

// ---- Event Handling ----

void NativeGameModule::registerCallback(jsi::Runtime& rt, jsi::Function callback) {
  callback_ = std::make_shared<jsi::Function>(std::move(callback));
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

void NativeGameModule::connect(jsi::Runtime& rt) {
  LudoClient* client = LudoClient::get();
  if (!client) return;
  client->connectToServer(rt);
  client->registerSelf(rt);
}

void NativeGameModule::rollDice(jsi::Runtime& rt) {
  LudoClient* client = LudoClient::get();
  if (!client) return;
  client->rollDice(rt);
}

void NativeGameModule::selectPawn(jsi::Runtime& rt, int pawnId) {
  LudoClient* client = LudoClient::get();
  if (!client) return;
  client->selectPawn(rt, pawnId);
}

void NativeGameModule::quit(jsi::Runtime& rt) {
  LudoClient* client = LudoClient::get();
  if (!client) return;
  client->quit(rt);
}

void NativeGameModule::disconnect(jsi::Runtime& rt) {
  LudoClient* client = LudoClient::get();
  if (!client) return;
  client->closeConn(rt);
}

// ---- Events ----

void NativeGameModule::emitGameStart(jsi::Runtime& rt) {
  Event event;
  event.type = "gameStart";
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPlayerTurn(jsi::Runtime& rt, int playerId) {
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

void NativeGameModule::emitWaitingForSelect(jsi::Runtime& rt) {
  Event event;
  event.type = "waitingForSelect";
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

void NativeGameModule::emitPawnKilled(jsi::Runtime& rt, int killedId) {
  Event event;
  event.type = "pawnKilled";
  event.properties["killedId"] = killedId;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnRevived(jsi::Runtime& rt, int position) {
  Event event;
  event.type = "pawnRevived";
  event.properties["position"] = position;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnSaved(jsi::Runtime& rt) {
  Event event;
  event.type = "pawnSaved";
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnMovedToGoalArea(jsi::Runtime& rt, int position) {
  Event event;
  event.type = "pawnMovedToGoalArea";
  event.properties["position"] = position;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitPawnMoved(jsi::Runtime& rt, int fromPosition, int toPosition) {
  Event event;
  event.type = "pawnMoved";
  event.properties["fromPosition"] = fromPosition;
  event.properties["toPosition"] = toPosition;
  enqueueEvent(std::move(event));
}

void NativeGameModule::emitGameOver(jsi::Runtime& rt, int winnerId) {
  Event event;
  event.type = "gameOver";
  event.properties["winnerId"] = winnerId;
  enqueueEvent(std::move(event));
}

} // namespace facebook::react
