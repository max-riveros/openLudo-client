import React, { useEffect } from 'react';
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
import { Board, BoardHandle } from './components/game/Board';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PawnController } from './features/game/PawnController';
import { Color } from './components/game/Pawn';

function App(): React.JSX.Element {
  const [resetKey, setResetKey] = React.useState(0);
  const [pawnController, setPawnController] = React.useState<PawnController>();

  const [connected, setConnected] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [enableDice, setEnableDice] = React.useState(false);
  const [enableSelect, setEnableSelect] = React.useState<Array<boolean>>([false, false, false, false]);

  const dice = React.useRef(0);
  const playerId = React.useRef("");
  const selfId = React.useRef("");
  const pawnId = React.useRef(-1);
  const pawns = React.useRef<Array<number>>([]);

  GameModule.registerCallback(async (events: Array<GameEvent>) => {
    events.forEach((event: GameEvent) => {
      handle(event);
    });
  });
  GameModule.registerLog(async (message: string) => {
    console.log("App: " + message);
  });

  const onRegistered = (event: Events.RegisteredEvent) => {
    selfId.current = event.playerId;
    setRegistered(true);
  }

  const onPlayerSetup = (event: Events.PlayerSetupEvent) => {
    let color: Color;
    if (event.color == "0") color = "red";
    if (event.color == "1") color = "blue";
    if (event.color == "2") color = "yellow";
    if (event.color == "3") color = "green";
    
    let newPawns: Array<number> = [];
    event.pawns.split(',').forEach((pawn) => {
      let id: number = parseInt(pawn);
      if (event.id == selfId.current) {
        newPawns.push(id);
        console.log("Pushing " + id);
      }
      pawnController?.addPawn({id: id, color: color}, event.id, event.endPosition)
    });
    pawns.current = newPawns;
  }

  const onGameStart = (event: Events.GameStartEvent) => {
    setStarted(true);
  }

  const onPlayerTurn = (event: Events.PlayerTurnEvent) => {
    playerId.current = event.playerId;
  }

  const onWaitingForDice = (event: Events.WaitingForDiceEvent) => {
    if (selfId.current === playerId.current) {
      setEnableDice(true);
    }
  }

  const onDiceRolled = (event: Events.DiceRolledEvent) => {
    setEnableDice(false);
    dice.current = event.value;
  };

  const onWaitingForSelect = (event: Events.WaitingForSelectEvent) => {
    if (selfId.current === playerId.current) {
      let newEnableSelect: Array<boolean> = [false, false, false, false];
      event.pawns.split(',').forEach((pawn) => {
        let index = pawns.current.indexOf(parseInt(pawn));
        console.log("Enabling pawn " + pawn + " at " + index);
        newEnableSelect[index] = true;
      });
      setEnableSelect(newEnableSelect);
    }
  };

  const onSelected = (event: Events.SelectedEvent) => {
    if (selfId.current === playerId.current) {
      setEnableSelect([false, false, false, false]);
    }
    pawnId.current = event.pawnId;
    console.log("Selected Pawn " + event.pawnId);
  };

  const onPlayerSkipped = (event: Events.PlayerSkippedEvent) => {
    console.log("Skipped player");
  };

  const onPawnKilled = (event: Events.PawnKilledEvent) => {
    pawnController?.getPawn(event.killedId).kill();
  };

  const onPawnRevived = (event: Events.PawnRevivedEvent) => {
    console.log("Pawns: " + pawnController?.getPawns().length);
    pawnController?.getPawns().forEach((pawn, index) => {
      console.log(index);
    });
    console.log("Revived " + event.pawn);
    pawnController?.getPawn(event.pawn).revive();
  };

  const onPawnSaved = (event: Events.PawnSavedEvent) => {
    pawnController?.getPawn(event.pawn).moveToGoalArea(5);
  };

  const onPawnMoved = (event: Events.PawnMovedEvent) => {
    pawnController?.getPawn(event.pawn).moveToLinearPosition(event.toPosition);
  };

  const onPawnMovedToGoalArea = (event: Events.PawnMovedToGoalAreaEvent) => {
    pawnController?.getPawn(event.pawn).moveToGoalArea(event.position);
  };

  const onGameOver = (event: Events.GameOverEvent) => {
    setEnableDice(false);
    setEnableSelect([false, false, false, false]);
    console.log(event.winner + " won!");
  };


  const onStart = () => {
    GameModule.startGame();
  }

  const onDisconnect = () => {
    if (!connected) return;

    setConnected(false);
    GameModule.disconnect();
    reset();
  }

  const onQuit = () => {
    if (!connected) return;

    setConnected(false);
    GameModule.quit();
    reset();
  }

  const reset = () => {
    setConnected(false);
    setRegistered(false);
    setStarted(false);
    setPawnController(undefined);

    setEnableDice(false);
    setEnableSelect([false, false, false, false]);
    dice.current = 0;
    playerId.current = "";
    selfId.current = "";
    pawnId.current = -1;
    pawns.current = [];

    setResetKey(resetKey+1);
  }

  const onConnect = () => {
    if ( connected ) return;

    setConnected(true);
    eventListener.subscribe(Events.RegisteredEvent, onRegistered);
    eventListener.subscribe(Events.PlayerSetupEvent, onPlayerSetup);
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
  };
  const rollDice = () => {
    GameModule.rollDice();
  };
  const select1 = () => {
    GameModule.selectPawn(pawns.current[0]);
  };
  const select2 = () => {
    GameModule.selectPawn(pawns.current[1]);
  };
  const select3 = () => {
    GameModule.selectPawn(pawns.current[2]);
  };
  const select4 = () => {
    GameModule.selectPawn(pawns.current[3]);
  };
  const onGetRef = (ref: BoardHandle | null) => {
    if (ref == null || pawnController != undefined) return;
    setPawnController(new PawnController(ref))
  }

  return (
    <SafeAreaProvider key={resetKey}>
      <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <Text style={[styles.title, styles.text]}>
            Welcome to C++ Turbo Native Module Example
          </Text>
        </View>
        <View style={styles.board}>
          <Board ref={(ref) => onGetRef(ref)} >
          </Board>
        </View>
        <View style={styles.controls}>
          <Button title="Connect" onPress={onConnect} disabled={connected} />
          <Button title="Start" onPress={onStart} disabled={!registered || started} />
          <View style={styles.buttons}>
            <Button title="Select 1" onPress={select1} disabled={!enableSelect[0]}/> 
            <Button title="Select 2" onPress={select2} disabled={!enableSelect[1]}/> 
            <Button title="Select 3" onPress={select3} disabled={!enableSelect[2]}/> 
            <Button title="Select 4" onPress={select4} disabled={!enableSelect[3]}/> 
          </View>
          <Button title="Dice" onPress={rollDice} disabled={!enableDice}/>
          <Button title="Quit" onPress={onQuit} disabled={!started} />
          <Button title="Disconnect" onPress={onDisconnect} disabled={!connected} />
        </View>
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  board: {
    flex: 2,
    width: '100%',
    alignSelf: 'stretch',
  },
  controls: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  title: {
    width: '100%',
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
    backgroundColor: "black",
    width: '80%',
  },
});

export default App;