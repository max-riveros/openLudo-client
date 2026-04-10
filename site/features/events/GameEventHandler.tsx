import { GameEvent } from '../../../specs/NativeGameModule';
import { eventListener } from './EventListener';
import * as Events from './Events';

export function handle(event: GameEvent) {
    switch (event.type) {
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
            const e = new Events.WaitingForSelectEvent();
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
            const e = new Events.PawnKilledEvent(event.killerId);
            eventListener.emit(e);
            break;
        }

        case "pawnRevived": {
            const e = new Events.PawnRevivedEvent(event.position);
            eventListener.emit(e);
            break;
        }

        case "pawnSaved": {
            const e = new Events.PawnSavedEvent();
            eventListener.emit(e);
            break;
        }

        case "pawnMoved": {
            const e = new Events.PawnMovedEvent(
                event.fromPosition,
                event.toPosition
            );
            eventListener.emit(e);
            break;
        }

        case "pawnMovedToGoalArea": {
            const e = new Events.PawnMovedToGoalAreaEvent(event.position);
            eventListener.emit(e);
            break;
        }

        case "gameOver": {
            const e = new Events.GameOverEvent(event.winnerId);
            eventListener.emit(e);
            break;
        }
        
    }   
}