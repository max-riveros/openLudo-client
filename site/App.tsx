import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import GameModule, { GameEvent } from '../specs/NativeGameModule';
import { handle } from './features/events/GameEventHandler';
import { eventListener } from './features/events/EventListener';
import * as Events from './features/events/Events';

function App(): React.JSX.Element {
  const [reversedValue, setReversedValue] = React.useState('');
  const [connected, setConnected] = React.useState(false);

  GameModule.registerCallback(async (events: Array<GameEvent>) => {
    events.forEach((event: GameEvent) => {
      handle(event);
    });
  });

  const addText = (text: String) => {
    setReversedValue(prev => prev + "\n" + text);
  }

  const onGameStart = (event: Events.GameStartEvent) => {
    addText(event.type);
  }

  const onPlayerTurn = (event: Events.PlayerTurnEvent) => {
    addText(event.type + ": " + event.playerId);
  }

  const onWaitingForDice = (event: Events.WaitingForDiceEvent) => {
    addText(event.type);
  }

  const onDiceRolled = (event: Events.DiceRolledEvent) => {
    addText(event.type + ": " + event.value);
  };

  const onWaitingForSelect = (event: Events.WaitingForSelectEvent) => {
    addText(event.type);
  };

  const onSelected = (event: Events.SelectedEvent) => {
    addText(event.type + ": " + event.pawnId);
  };

  const onPlayerSkipped = (event: Events.PlayerSkippedEvent) => {
    addText(event.type);
  };

  const onPawnKilled = (event: Events.PawnKilledEvent) => {
    addText(event.type + ": killer " + event.killerId);
  };

  const onPawnRevived = (event: Events.PawnRevivedEvent) => {
    addText(event.type + ": pawn is at " + event.position);
  };

  const onPawnSaved = (event: Events.PawnSavedEvent) => {
    addText(event.type);
  };

  const onPawnMoved = (event: Events.PawnMovedEvent) => {
    addText(event.type + ": from " + event.fromPosition + " to " + event.toPosition);
  };

  const onPawnMovedToGoalArea = (event: Events.PawnMovedToGoalAreaEvent) => {
    addText(event.type + ": to " + event.position);
  };

  const onGameOver = (event: Events.GameOverEvent) => {
    addText(event.type + ": winner " + event.winnerId);
  };


  const onConnect = () => {
    if ( connected ) return;
    setConnected(true);
    eventListener.subscribe(Events.GameStartEvent, onGameStart);
    eventListener.subscribe(Events.PlayerTurnEvent, onPlayerTurn);
    eventListener.subscribe(Events.WaitingForDiceEvent, onWaitingForDice);
    eventListener.subscribe(Events.DiceRolledEvent, onDiceRolled);
    eventListener.subscribe(Events.WaitingForSelectEvent, onWaitingForSelect);
    eventListener.subscribe(Events.SelectedEvent, onSelected);
    eventListener.subscribe(Events.PlayerSkippedEvent, onPlayerSkipped);
    eventListener.subscribe(Events.PawnKilledEvent, onPawnKilled);
    eventListener.subscribe(Events.PawnRevivedEvent, onPawnRevived);
    eventListener.subscribe(Events.PawnSavedEvent, onPawnSaved);
    eventListener.subscribe(Events.PawnMovedEvent, onPawnMoved);
    eventListener.subscribe(Events.PawnMovedToGoalAreaEvent, onPawnMovedToGoalArea);
    eventListener.subscribe(Events.GameOverEvent, onGameOver);
    GameModule.connect();
  };
  const onDice = () => {
    GameModule.rollDice();
  };
  const onSelect = () => {
    GameModule.selectPawn(1);
  };

  return (
      <View>
        <Text style={[styles.title, styles.text]}>
          Welcome to C++ Turbo Native Module Example
        </Text>
        <Button title="Connect" onPress={onConnect} />
        <Button title="Dice" onPress={onDice} />
        <Button title="Select 1" onPress={onSelect} />
        <Text style={styles.text}>text: {reversedValue}</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  text: {
    color: 'white',
  },
  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
});

export default App;