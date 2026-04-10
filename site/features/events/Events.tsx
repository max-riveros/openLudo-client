export interface Event {
    readonly type: String;
}
export class GameStartEvent implements Event {
    readonly type = "gameStart";
}
export class PlayerTurnEvent implements Event {
    readonly type = "playerTurn";
    constructor(public readonly playerId: number) {}
}
export class WaitingForDiceEvent implements Event {
    readonly type = "waitingForDice";
}
export class DiceRolledEvent implements Event {
  readonly type = "diceRolled";

  constructor(public readonly value: number) {}
}
export class WaitingForSelectEvent implements Event {
    readonly type = "waitingForSelect";
}
export class SelectedEvent implements Event {
  readonly type = "selected";

  constructor(public readonly pawnId: number) {}
}
export class PlayerSkippedEvent implements Event {
    readonly type = "playerSkipped";
}
export class PawnKilledEvent implements Event {
  readonly type = "pawnKilled";

  constructor(public readonly killerId: number) {}
}
export class PawnRevivedEvent implements Event {
  readonly type = "pawnRevived";

  constructor(public readonly position: number) {}
}
export class PawnSavedEvent implements Event {
  readonly type = "pawnSaved";
}
export class PawnMovedToGoalAreaEvent implements Event {
  readonly type = "pawnMovedToGoalArea";

  constructor(public readonly position: number) {}
}
export class PawnMovedEvent implements Event {
  readonly type = "pawnMoved";

  constructor(
    public readonly fromPosition: number,
    public readonly toPosition: number
  ) {}
}
export class GameOverEvent implements Event {
  readonly type = "gameOver";

  constructor(public readonly winnerId: number) {}
}