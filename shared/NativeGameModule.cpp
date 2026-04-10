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

  return jsi::String::createFromUtf8(rt, std::get<std::string>(v));
}

jsi::Object toJSI(jsi::Runtime& rt, const Event& event) {
  jsi::Object obj(rt);

  obj.setProperty(rt, "type", jsi::String::createFromUtf8(rt, event.type));
  for (const auto& [key, value] : event.properties) {
    obj.setProperty(rt, key.c_str(), toJSIValue(rt, value));
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

  while (!localQueue.empty()) {
    const auto& event = localQueue.front();
    localQueue.pop();
    callback_->call(rt, toJSI(rt, event));
  }

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
  jsInvoker_->invokeAsync([cb = callback_](jsi::Runtime& rt) {
    auto console = rt.global().getPropertyAsObject(rt, "console");
    auto log = console.getPropertyAsFunction(rt, "log");

    log.call(rt, "1");
    log.call(rt, "2");
    log.call(rt, "3");
  });
  emitGameStart(rt);
  emitPlayerTurn(rt, 1);
  emitWaitingForDice(rt);
}

void NativeGameModule::rollDice(jsi::Runtime& rt) {
  emitDiceRolled(rt, 3);
  emitWaitingForSelect(rt);
}

void NativeGameModule::selectPawn(jsi::Runtime& rt, int pawnId) {
  emitSelected(rt, pawnId);
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
