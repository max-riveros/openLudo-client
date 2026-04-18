import { GameEvent } from '../../../specs/NativeGameModule';
import { eventListener } from './EventListener';
import * as Events from './Events';

export function handle(event: GameEvent) {
    switch (event.type) {
        case "registered":
            eventListener.emit(new Events.RegisteredEvent(
                event.playerId, event.color,
            ));
            break;

        case "playerSetup":
            eventListener.emit(new Events.PlayerSetupEvent(
                event.id, event.color, 
                event.startPosition, event.endPosition,
                event.pawns
            ));
            break;

        case "gameStart":
            eventListener.emit(new Events.GameStartEvent());
            break;

        case "playerTurn": {
            const e = new Events.PlayerTurnEvent(event.playerId);
            eventListener.emit(e);
            break;
        }

        case "waitingForDice": {
            const e = new Events.WaitingForDiceEvent();
            eventListener.emit(e);
            break;
        }
        
        case "diceRolled": {
            const e = new Events.DiceRolledEvent(event.value);
            eventListener.emit(e);
            break;
        }

        case "waitingForSelect": {
            const e = new Events.WaitingForSelectEvent(event.pawns);
            eventListener.emit(e);
            break;
        }

        case "selected": {
            const e = new Events.SelectedEvent(event.pawnId);
            eventListener.emit(e);
            break;
        }

        case "playerSkipped": {
            const e = new Events.PlayerSkippedEvent();
            eventListener.emit(e);
            break;
        }

        case "pawnKilled": {
            const e = new Events.PawnKilledEvent(
                event.killerId,
                event.killedId,
            );
            eventListener.emit(e);
            break;
        }

        case "pawnRevived": {
            const e = new Events.PawnRevivedEvent(
                event.pawn
            );
            eventListener.emit(e);
            break;
        }

        case "pawnSaved": {
            const e = new Events.PawnSavedEvent(
                event.pawn,
            );
            eventListener.emit(e);
            break;
        }

        case "pawnMoved": {
            const e = new Events.PawnMovedEvent(
                event.pawn,
                event.fromPosition,
                event.toPosition
            );
            eventListener.emit(e);
            break;
        }

        case "pawnMovedToGoalArea": {
            const e = new Events.PawnMovedToGoalAreaEvent(
                event.pawn,
                event.position
            );
            eventListener.emit(e);
            break;
        }

        case "gameOver": {
            const e = new Events.GameOverEvent(event.winner);
            eventListener.emit(e);
            break;
        }
        
    }   
}