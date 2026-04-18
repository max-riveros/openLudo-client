import {TurboModule, TurboModuleRegistry} from 'react-native';

export type GameEvent =
	| { type: "registered"; playerId: string; color: string }
	| { type: "playerSetup"; 
		id: string; 
		color: string; 
		startPosition: number; 
		endPosition: number;
		pawns: string;
	  }
	| { type: "gameStart" }
	| { type: "playerTurn"; playerId: string }
	| { type: "waitingForDice" }
	| { type: "diceRolled"; value: number }
	| { type: "waitingForSelect" }
	| { type: "selected"; pawnId: number }
	| { type: "playerSkipped" }
	| { type: "pawnKilled"; killerId: number; killedId: number }
	| { type: "pawnRevived"; pawnId: number }
	| { type: "pawnSaved"; pawnId: number }
	| { type: "pawnMovedToGoalArea"; pawnId: number; position: number }
	| { type: "pawnMoved"; pawnId: number; fromPosition: number; toPosition: number }
	| { type: "gameOver"; winner: string }

export interface Spec extends TurboModule {
  registerCallback(callback: (event: Array<GameEvent>) => void): void;
  registerLog(callback: (log: string) => void): void;

  readonly connectToServer: () => void;
  readonly startGame: () => void;
  readonly registerSelf: () => void;
  readonly rollDice: () => void;
  readonly selectPawn: (pawnId: number) => void;
  readonly disconnect: () => void;
  readonly quit: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeGameModule',
);
