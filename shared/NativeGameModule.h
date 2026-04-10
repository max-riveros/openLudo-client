#pragma once

#include <ClientSpecsJSI.h>
#include <ReactCommon/CallInvoker.h>

#include <memory>
#include <functional>

namespace facebook::react {

class NativeGameModule : public NativeGameModuleCxxSpec<NativeGameModule> {
  std::shared_ptr<jsi::Function> callback_;
public:
  NativeGameModule(std::shared_ptr<CallInvoker> jsInvoker);

  void registerCallback(jsi::Runtime& rt, jsi::Function callback);

  // Methods
  void connect(jsi::Runtime& rt);
  void rollDice(jsi::Runtime& rt);
  void selectPawn(jsi::Runtime& rt, int pawnId);

  // Events
  void emitGameStart(jsi::Runtime& rt);
  void emitPlayerTurn(jsi::Runtime& rt,int playerId);
  void emitWaitingForDice(jsi::Runtime& rt);
  void emitDiceRolled(jsi::Runtime& rt, int value);
  void emitWaitingForSelect(jsi::Runtime& rt);
  void emitSelected(jsi::Runtime& rt,int pawnId);
  void emitPlayerSkipped(jsi::Runtime& rt);
  void emitPawnKilled(jsi::Runtime& rt,int killedId);
  void emitPawnRevived(jsi::Runtime& rt,int position);
  void emitPawnSaved(jsi::Runtime& rt);
  void emitPawnMovedToGoalArea(jsi::Runtime& rt,int position);
  void emitPawnMoved(jsi::Runtime& rt,int fromPosition, int toPosition);
  void emitGameOver(jsi::Runtime& rt,int winnerId);
};

} // namespace facebook::react

