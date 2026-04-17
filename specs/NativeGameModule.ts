import {TurboModule, TurboModuleRegistry} from 'react-native';

export type GameEvent =
	| { type: "gameStart" }
	| { type: "playerTurn"; playerId: number }
	| { type: "waitingForDice" }
	| { type: "diceRolled"; value: number }
	| { type: "waitingForSelect" }
	| { type: "selected"; pawnId: number }
	| { type: "playerSkipped" }
	| { type: "pawnKilled"; killerId: number }
	| { type: "pawnRevived"; position: number }
	| { type: "pawnSaved" }
	| { type: "pawnMovedToGoalArea"; position: number }
	| { type: "pawnMoved"; fromPosition: number; toPosition: number }
	| { type: "gameOver"; winnerId: number }

export interface Spec extends TurboModule {
  registerCallback(callback: (event: Array<GameEvent>) => void): void;

  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly quit: () => void;
  readonly rollDice: () => void;
  readonly selectPawn: (pawnId: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeGameModule',
);
