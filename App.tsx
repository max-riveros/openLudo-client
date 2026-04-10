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
    switch (event.type) {
      case "gameStart":
        setReversedValue(reversedValue + event.type);
        break;
    
      case "playerTurn":
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.playerId);
        break;
    
      case "diceRolled":
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.value);
        break;
    
      case "gameOver":
        setReversedValue(reversedValue + "\n" + event.type);
        break;
    
      case "pawnKilled":
        setReversedValue(reversedValue + "\n" + event.type + ": killer " + event.killerId);
        break;
    
      case "pawnMoved":
        setReversedValue(reversedValue + "\n" + event.type + ": from " + event.fromPosition + " to " + event.toPosition);
        break;
    
      case "pawnMovedToGoalArea":
        setReversedValue(reversedValue + "\n" + event.type + ": to " + event.position);
        break;
    
      case "pawnRevived":
        setReversedValue(reversedValue + "\n" + event.type + ": pawn is at " + event.position);
        break;
    
      case "pawnSaved":
        setReversedValue(reversedValue + "\n" + event.type);
        break;
    
      case "playerSkipped":
        setReversedValue(reversedValue + "\n" + event.type);
        break;
    
      case "selected":
        setReversedValue(reversedValue + "\n" + event.type + ": " + event.pawnId);
        break;
    
      case "waitingForSelect":
        setReversedValue(reversedValue + "\n" + event.type);
        break;
    
      case "waitingForDice":
        setReversedValue(reversedValue + "\n" + event.type);
        break;
    
      default:
        break;
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
      <View style={{backgroundColor: 'blue'}}>
        <Text style={styles.title}>
          Welcome to C++ Turbo Native Module Example
        </Text>
        <Button title="Connect" onPress={onConnect} />
        <Button title="Dice" onPress={onDice} />
        <Button title="Select 1" onPress={onSelect} />
        <Text>text: {reversedValue}</Text>
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
  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
});

export default App;