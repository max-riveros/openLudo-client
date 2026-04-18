import React from 'react';
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

function App(): React.JSX.Element {
  const [reversedValue, setReversedValue] = React.useState('');
  const [connected, setConnected] = React.useState(false);
  const [pawnController, setPawnController] = React.useState<PawnController>();

  const [enableDice, setEnableDice] = React.useState(false);
  const [enableSelect, setEnableSelect] = React.useState(false);
  const [playerId, setPlayerId] = React.useState(-1);
  const [selfId, setSelfId] = React.useState(-1);
  const [pawnId, setPawnId] = React.useState(-1);

  GameModule.registerCallback(async (events: Array<GameEvent>) => {
    events.forEach((event: GameEvent) => {
      handle(event);
    });
  });
  GameModule.registerLog(async (message: string) => {
    console.log("App: " + message);
  });

  const onGameStart = (event: Events.GameStartEvent) => {
  }

  const onPlayerTurn = (event: Events.PlayerTurnEvent) => {
  }

  const onWaitingForDice = (event: Events.WaitingForDiceEvent) => {
  }

  const onDiceRolled = (event: Events.DiceRolledEvent) => {
    pawnController?.getPawn(pawnId).move(event.value);
  };

  const onWaitingForSelect = (event: Events.WaitingForSelectEvent) => {
  };

  const onSelected = (event: Events.SelectedEvent) => {
    setPawnId(event.pawnId);
  };

  const onPlayerSkipped = (event: Events.PlayerSkippedEvent) => {
  };

  const onPawnKilled = (event: Events.PawnKilledEvent) => {
    pawnController?.getPawn(pawnId).kill();
  };

  const onPawnRevived = (event: Events.PawnRevivedEvent) => {
    pawnController?.getPawn(pawnId).revive();
  };

  const onPawnSaved = (event: Events.PawnSavedEvent) => {
    pawnController?.getPawn(pawnId).moveToGoalArea(5);
  };

  const onPawnMoved = (event: Events.PawnMovedEvent) => {
  };

  const onPawnMovedToGoalArea = (event: Events.PawnMovedToGoalAreaEvent) => {
    pawnController?.getPawn(pawnId).moveToGoalArea(event.position);
  };

  const onGameOver = (event: Events.GameOverEvent) => {
  };


  const onDisconnect = () => {
    if (!connected) return;

    setConnected(false);
    GameModule.disconnect();
  }

  const onQuit = () => {
    if (!connected) return;

    setConnected(false);
    GameModule.quit();
  }

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
    GameModule.connectToServer();
    GameModule.registerSelf();
    GameModule.startGame();

    /**
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
    **/
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
        <Button title="Connect" onPress={onConnect} />
        <Button title="Dice" onPress={rollDice} disabled={!enableDice}/>
        <Text style={styles.title}>Pawn: <TextInput readOnly={!enableSelect} style={[styles.text, styles.input]} onChangeText={updateId}></TextInput></Text>
        <Button title="Select 1" onPress={select} disabled={!enableSelect}/> 
        <Button title="Quit" onPress={onQuit} />
        <Button title="Disconnect" onPress={onDisconnect} />
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
  input: {
    backgroundColor: "white",
  },
});

export default App;