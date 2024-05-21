import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform, PermissionsAndroid, TextInput, FlatList } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import tinycolor from 'tinycolor2';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const RED_UUID = '8a7f1168-48af-4ef4-9bae-a8d15f08cefe';
const GREEN_UUID = '77b9c657-94d5-4f72-bfd4-53758dffa508';
const BLUE_UUID = '0dcef519-43ec-4267-8d4a-3b02ca61765d';

const manager = new BleManager();

type Recipe = {
  id: number;
  name: string;
  red: number;
  green: number;
  blue: number;
};

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Recipe 1', red: 100, green: 150, blue: 200 },
    { id: 2, name: 'Recipe 2', red: 200, green: 100, blue: 150 }
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [newRecipe, setNewRecipe] = useState({ name: '', red: '', green: '', blue: '' });

  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  async function scanAndConnect() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('BLE permission denied');
        return;
      }
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        return;
      }
      console.log('Scanning...');
      if (device && device.name === 'ColorControl') {
        console.log('Device found:', device.name);
        manager.stopDeviceScan();
        device.connect()
          .then((device) => {
            console.log('Connected to:', device.name);
            setIsConnected(true);
            setConnectedDevice(device);
            return device.discoverAllServicesAndCharacteristics();
          })
          .catch(err => console.log('Connection or discovery error:', err));
      }
    });

    setTimeout(() => {
      if (!isConnected) {
        manager.stopDeviceScan();
        console.log('Stopped scanning, no devices connected.');
      }
    }, 10000);
  }

  async function sendData() {
    if (connectedDevice && isConnected) {
      try {
        await connectedDevice.discoverAllServicesAndCharacteristics();
        const services = await connectedDevice.services();
        const service = services.find(service => service.uuid === SERVICE_UUID);
        if (service) {
          const redData = base64.encode(String(selectedRecipe.red));
          const greenData = base64.encode(String(selectedRecipe.green));
          const blueData = base64.encode(String(selectedRecipe.blue));

          await connectedDevice.writeCharacteristicWithResponseForService(service.uuid, RED_UUID, redData);
          await connectedDevice.writeCharacteristicWithResponseForService(service.uuid, GREEN_UUID, greenData);
          await connectedDevice.writeCharacteristicWithResponseForService(service.uuid, BLUE_UUID, blueData);

          console.log(`Data sent for ${selectedRecipe.name}: Red=${selectedRecipe.red}, Green=${selectedRecipe.green}, Blue=${selectedRecipe.blue}`);
        } else {
          console.log('Service not found.');
        }
      } catch (error) {
        console.log('Error sending data:', error);
      }
    } else {
      console.log('No device connected or service found.');
    }
  }

  const addRecipe = () => {
    if (newRecipe.name && newRecipe.red && newRecipe.green && newRecipe.blue) {
      const newId = recipes.length ? recipes[recipes.length - 1].id + 1 : 1;
      const recipe: Recipe = { id: newId, name: newRecipe.name, red: parseInt(newRecipe.red), green: parseInt(newRecipe.green), blue: parseInt(newRecipe.blue) };
      setRecipes([...recipes, recipe]);
      setNewRecipe({ name: '', red: '', green: '', blue: '' });
    }
  };

  const removeRecipe = (id: number) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const calculateColor = (red: number, green: number, blue: number) => {
    return tinycolor({ r: red, g: green, b: blue }).toRgbString();
  };

  return (
    <View style={styles.container}>
      <Button title={!isConnected ? "Connect to BLE Device" : "Disconnect BLE Device"} onPress={scanAndConnect} />
      {isConnected && (
        <View style={styles.connectedContainer}>
          <Text>Connected to: {connectedDevice?.name || 'Unknown Device'}</Text>
          <FlatList
            data={recipes}
            renderItem={({ item }) => (
              <View style={styles.recipeItem}>
                <Text onPress={() => setSelectedRecipe(item)}>{item.name}</Text>
                <Button title="Remove" onPress={() => removeRecipe(item.id)} />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.addRecipeContainer}>
            <TextInput
              placeholder="Recipe Name"
              value={newRecipe.name}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, name: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Red"
              value={newRecipe.red}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, red: text })}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Green"
              value={newRecipe.green}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, green: text })}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Blue"
              value={newRecipe.blue}
              onChangeText={(text) => setNewRecipe({ ...newRecipe, blue: text })}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={[styles.colorPreview, { backgroundColor: calculateColor(parseInt(newRecipe.red) || 0, parseInt(newRecipe.green) || 0, parseInt(newRecipe.blue) || 0) }]} />
            <Button title="Add Recipe" onPress={addRecipe} />
          </View>
          <Text>Selected Recipe: {selectedRecipe.name}</Text>
          <View style={[styles.colorPreview, { backgroundColor: calculateColor(selectedRecipe.red, selectedRecipe.green, selectedRecipe.blue) }]} />
          <Button title="Send Data" onPress={sendData} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedContainer: {
    width: '100%',
    padding: 10,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addRecipeContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  colorPreview: {
    width: '100%',
    height: 100,
    marginTop: 10,
  },
});