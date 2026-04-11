import React, { useEffect, useRef } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import GameModule, { GameEvent } from '../specs/NativeGameModule';
import { handle } from './features/events/GameEventHandler';
import { eventListener } from './features/events/EventListener';
import * as Events from './features/events/Events';
import { Board, BoardHandle } from './components/game/Board';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PawnController } from './features/game/PawnController';
import { Color } from './components/game/Pawn';

function App(): React.JSX.Element {
  const [reversedValue, setReversedValue] = React.useState('');
  const [connected, setConnected] = React.useState(false);
  const [pawnController, setPawnController] = React.useState<PawnController>();
  const [pawnId, setPawnId] = React.useState(1);

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
    pawnController?.getPawn(pawnId).move(event.value);
  };

  const onWaitingForSelect = (event: Events.WaitingForSelectEvent) => {
    addText(event.type);
  };

  const onSelected = (event: Events.SelectedEvent) => {
    addText(event.type + ": " + event.pawnId);
    setPawnId(event.pawnId);
  };

  const onPlayerSkipped = (event: Events.PlayerSkippedEvent) => {
    addText(event.type);
  };

  const onPawnKilled = (event: Events.PawnKilledEvent) => {
    addText(event.type + ": killer " + event.killerId);
    pawnController?.getPawn(pawnId).kill();
  };

  const onPawnRevived = (event: Events.PawnRevivedEvent) => {
    addText(event.type + ": pawn is at " + event.position);
    pawnController?.getPawn(pawnId).revive();
  };

  const onPawnSaved = (event: Events.PawnSavedEvent) => {
    addText(event.type);
    pawnController?.getPawn(pawnId).moveToGoalArea(5);
  };

  const onPawnMoved = (event: Events.PawnMovedEvent) => {
    addText(event.type + ": from " + event.fromPosition + " to " + event.toPosition);
  };

  const onPawnMovedToGoalArea = (event: Events.PawnMovedToGoalAreaEvent) => {
    addText(event.type + ": to " + event.position);
    pawnController?.getPawn(pawnId).moveToGoalArea(event.position);
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

    if (pawnController == null) return;
    pawnController?.addPawn({id: 1, color: "red"})
    pawnController?.addPawn({id: 2, color: "red"})
    pawnController?.addPawn({id: 3, color: "red"})
    pawnController?.addPawn({id: 4, color: "red"})
    pawnController?.addPawn({id: 5, color: "blue"})
    pawnController?.addPawn({id: 6, color: "blue"})
    pawnController?.addPawn({id: 7, color: "blue"})
    pawnController?.addPawn({id: 8, color: "blue"})
    pawnController?.addPawn({id: 9, color: "yellow"})
    pawnController?.addPawn({id: 10, color: "yellow"})
    pawnController?.addPawn({id: 11, color: "yellow"})
    pawnController?.addPawn({id: 12, color: "yellow"})
    pawnController?.addPawn({id: 13, color: "green"})
    pawnController?.addPawn({id: 14, color: "green"})
    pawnController?.addPawn({id: 15, color: "green"})
    pawnController?.addPawn({id: 16, color: "green"})
  };
  const rollDice = () => {
    GameModule.rollDice();
  };
  const updateId = (id: string) => {
    setPawnId(parseInt(id));
  }
  const select = () => {
    GameModule.selectPawn(pawnId);
  };
  const onGetRef = (ref: BoardHandle | null) => {
    if (ref == null || pawnController != undefined) return;
    setPawnController(new PawnController(ref))
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <View>
        <Text style={[styles.title, styles.text]}>
          Welcome to C++ Turbo Native Module Example
        </Text>
        <Board ref={(ref) => onGetRef(ref)} >
        </Board>
        <View style={styles.buttons}>
          <Button title='Kill' onPress={() => {pawnController?.getPawn(pawnId)?.kill(); }} color="#FF4422"/>
          <Button title='Revive' onPress={() => {pawnController?.getPawn(pawnId)?.revive(); }} color="#FF4422"/>
          <Button title='Move to start' onPress={() => {pawnController?.getPawn(pawnId)?.moveToStart(); }} color="#FF4422"/>
          <Button title='Move to goal' onPress={() => {pawnController?.getPawn(pawnId)?.moveToGoalArea(5); }} color="#FF4422"/>
          <Button title='Move 3' onPress={() => {pawnController?.getPawn(pawnId)?.move(3); }} color="#FF4422"/>
        </View>
        <Button title="Connect" onPress={onConnect} />
        <Button title="Dice" onPress={rollDice} />
        <Text style={styles.title}>Pawn: <TextInput style={styles.text} onChangeText={updateId}></TextInput></Text>
        <Button title="Select 1" onPress={select} />
        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>text: {reversedValue}</Text>
        </ScrollView>
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: 'white',
  },
  scrollView: {
    height: 5,
  },
  text: {
    color: 'white',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    height: 'auto',
    marginBottom: '1%',
  },
});

export default App;