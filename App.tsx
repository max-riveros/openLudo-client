import React from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import GameModule, { GameEvent } from './specs/NativeGameModule';

function App(): React.JSX.Element {
  console.log(Platform.OS);
  const [reversedValue, setReversedValue] = React.useState('');

  // ----- Events -----

  GameModule.registerCallback(async (events: Array<GameEvent>) => {
    console.log("Handling " + events.length + " events...");
    events.forEach((event: GameEvent) => {
      handleEvent(event);
    });
  });

  function handleEvent(event: GameEvent) {
    console.log("Event type " + event.type);
    switch (event.type) {
      case "gameStart":
        addText(event.type);
        break;
      case "playerTurn":
        addText(event.type + ": " + event.playerId);
        break;
      case "diceRolled":
        addText(event.type + ": " + event.value);
        break;
      case "gameOver":
        addText(event.type);
        break;
      case "pawnKilled":
        addText(event.type + ": killer " + event.killerId);
        break;
      case "pawnMoved":
        addText(event.type + ": from " + event.fromPosition + " to " + event.toPosition);
        break;
      case "pawnMovedToGoalArea":
        addText(event.type + ": to " + event.position);
        break;
      case "pawnRevived":
        addText(event.type + ": pawn is at " + event.position);
        break;
      case "pawnSaved":
        addText(event.type);
        break;
      case "playerSkipped":
        addText(event.type);
        break;
      case "selected":
        addText(event.type + ": " + event.pawnId);
        break;
      case "waitingForSelect":
        addText(event.type);
        break;
      case "waitingForDice":
        addText(event.type);
        break;
    }    
  } 

  const addText = (text: String) => {
    setReversedValue(prev => prev + "\n" + text);
  }

  // ------------------

  const onConnect = () => {
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
        <Text style={styles.title}>
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