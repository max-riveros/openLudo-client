import React from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import GameModule from './specs/NativeGameModule';

function App(): React.JSX.Element {
  console.log(Platform.OS);
  const [reversedValue, setReversedValue] = React.useState('');

  // ----- Events -----

  GameModule.registerCallback((event) => {
      if (event.type === "gameStart") {
        setReversedValue(reversedValue + event.type);
      }
      if (event.type === "playerTurn") {
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.playerId);
      }
      if (event.type === "diceRolled") {
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.value);
      }
      if (event.type === "gameOver") {
        setReversedValue(reversedValue + "\n" + event.type);
      }
      if (event.type === "pawnKilled") {
        setReversedValue(reversedValue + "\n" + event.type + ": killer " + event.killerId);
      }
      if (event.type === "pawnMoved") {
        setReversedValue(reversedValue + "\n" + event.type + ": from " + event.fromPosition + " to " + event.toPosition);
      }
      if (event.type === "pawnMovedToGoalArea") {
        setReversedValue(reversedValue + "\n" + event.type + ": to " + event.position);
      }
      if (event.type === "pawnRevived") {
        setReversedValue(reversedValue + "\n" + event.type + ": pawn is at " + event.position);
      }
      if (event.type === "pawnSaved") {
        setReversedValue(reversedValue + "\n" + event.type);
      }
      if (event.type === "playerSkipped") {
        setReversedValue(reversedValue + "\n" + event.type);
      }
      if (event.type === "selected") {
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.pawnId);
      }
      if (event.type === "waitingForSelect") {
        setReversedValue(reversedValue + "\n" + event.type);
      }
      if (event.type === "waitingForDice") {
        setReversedValue(reversedValue + "\n" + event.type);
      }
  });

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