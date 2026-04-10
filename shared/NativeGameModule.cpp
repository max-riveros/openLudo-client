#include "NativeGameModule.h"

namespace facebook::react {

NativeGameModule::NativeGameModule(std::shared_ptr<CallInvoker> jsInvoker) 
    : NativeGameModuleCxxSpec(std::move(jsInvoker)) {}

void NativeGameModule::registerCallback(jsi::Runtime& rt, jsi::Function callback) {
  callback_ = std::make_shared<jsi::Function>(std::move(callback));
}

static jsi::Object makeEvent(jsi::Runtime& rt, const std::string& type) {
  jsi::Object obj(rt);
  obj.setProperty(rt, "type", jsi::String::createFromUtf8(rt, type));
  return obj;
}

// ---- Methods ----

void NativeGameModule::connect(jsi::Runtime& rt) {
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
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "gameStart");
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPlayerTurn(jsi::Runtime& rt, int playerId) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, playerId] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "gameStart");
    event.setProperty(rt, "playerId", jsi::Value(playerId));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitWaitingForDice(jsi::Runtime& rt) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "waitingForDice");
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitDiceRolled(jsi::Runtime& rt, int value) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, value] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "diceRolled");
    event.setProperty(rt, "value", jsi::Value(value));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitWaitingForSelect(jsi::Runtime& rt) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "waitingForSelect");
    (*cb).call(rt, event);
  });
}  

void NativeGameModule::emitSelected(jsi::Runtime& rt, int pawnId) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, pawnId] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "selected");
    event.setProperty(rt, "pawnId", jsi::Value(pawnId));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPlayerSkipped(jsi::Runtime& rt) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "playerSkipped");
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPawnKilled(jsi::Runtime& rt, int killedId) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, killedId] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "pawnKilled");
    event.setProperty(rt, "killedId", jsi::Value(killedId));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPawnRevived(jsi::Runtime& rt, int position) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, position] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "pawnRevived");
    event.setProperty(rt, "position", jsi::Value(position));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPawnSaved(jsi::Runtime& rt) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "pawnSaved");
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPawnMovedToGoalArea(jsi::Runtime& rt, int position) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, position] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "pawnMovedToGoalArea");
    event.setProperty(rt, "position", jsi::Value(position));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitPawnMoved(jsi::Runtime& rt, int fromPosition, int toPosition) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, fromPosition, toPosition] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "pawnMoved");
    event.setProperty(rt, "fromPosition", jsi::Value(fromPosition));
    event.setProperty(rt, "toPosition", jsi::Value(toPosition));
    (*cb).call(rt, event);
  });
}

void NativeGameModule::emitGameOver(jsi::Runtime& rt, int winnerId) {
  if (!callback_) return;

  jsInvoker_->invokeAsync([cb = callback_, winnerId] (jsi::Runtime& rt) {
    jsi::Object event = makeEvent(rt, "gameOver");
    event.setProperty(rt, "winnerId", jsi::Value(winnerId));
    (*cb).call(rt, event);
  });
}

} // namespace facebook::react
