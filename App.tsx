import React, { useState, useEffect } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import tinycolor from 'tinycolor2';
import Icon from 'react-native-vector-icons/FontAwesome';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const TANK_STATUS_UUID = '1dcef519-43ec-4267-8d4a-3b02ca61765d';
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
  const [isScanning, setIsScanning] = useState(false);
  const [noDevicesFound, setNoDevicesFound] = useState(false);
  const [tank1Status, setTank1Status] = useState<number | null>(null);
  const [tank2Status, setTank2Status] = useState<number | null>(null);
  const [tank3Status, setTank3Status] = useState<number | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Bleu Ciel', red: 135, green: 206, blue: 235 },
    { id: 2, name: 'Vert Printemps', red: 0, green: 255, blue: 127 }
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [newRecipe, setNewRecipe] = useState({ name: '', red: '', green: '', blue: '' });

  useEffect(() => {
    return () => {
      if (manager) {
        manager.stopDeviceScan();
        manager.destroy();
      }
    };
  }, []);

  async function scanAndConnect() {
    if (isScanning) return;

    console.log('Starting scan...');
    setIsScanning(true);
    setNoDevicesFound(false);
    setIsConnected(false);
    setConnectedDevice(null);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission BLE refusée');
        setIsScanning(false);
        return;
      }
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Erreur de scan :', error);
        setIsScanning(false);
        return;
      }

      console.log('Scanning...');

      if (device && device.name === 'ColorControl') {
        console.log('Appareil trouvé :', device.name);
        manager.stopDeviceScan();
        setIsScanning(false);
        device.connect()
          .then((device) => {
            console.log('Connecté à :', device.name);
            setIsConnected(true);
            setConnectedDevice(device);
            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            console.log('Services et caractéristiques découverts');
            setupNotifications(device);
          })
          .catch(err => {
            console.log('Erreur de connexion ou de découverte :', err);
            setIsConnected(false);
            setConnectedDevice(null);
          });
      }
    });

    setTimeout(() => {
      if (!isConnected && !connectedDevice) {
        manager.stopDeviceScan();
        setIsScanning(false);
        setNoDevicesFound(true);
        console.log('Scan arrêté, aucun appareil connecté.');
      }
    }, 10000);
  }

  function setupNotifications(device: Device) {
    monitorCharacteristic(device, SERVICE_UUID, TANK_STATUS_UUID, 'Tank Status', (value) => {
      const tank1 = parseInt(value.substring(0, 2), 16);
      const tank2 = parseInt(value.substring(2, 4), 16);
      const tank3 = parseInt(value.substring(4, 6), 16);

      console.log(`Tank 1 Status: ${tank1}, Tank 2 Status: ${tank2}, Tank 3 Status: ${tank3}`);

      setTank1Status(tank1);
      setTank2Status(tank2);
      setTank3Status(tank3);
    });
  }

  function monitorCharacteristic(
    device: Device,
    serviceUUID: string,
    characteristicUUID: string,
    characteristicName: string,
    setState: (value: string) => void
  ) {
    console.log(`Monitoring characteristic ${characteristicName} (${characteristicUUID})...`);
    device.monitorCharacteristicForService(serviceUUID, characteristicUUID, (error, characteristic) => {
      if (error) {
        console.log(`Erreur de lecture de ${characteristicName} :`, error);
        return;
      }
      if (characteristic?.value) {
        const decodedValue = base64.decode(characteristic.value);
        console.log(`${characteristicName} Value (raw):`, characteristic.value);
        console.log(`${characteristicName} Value (decoded):`, decodedValue);
        setState(decodedValue);
      } else {
        console.log(`${characteristicName} Value is empty or invalid.`);
      }
    });
  }

  async function sendData() {
    if (connectedDevice && isConnected) {
      try {
        const redData = base64.encode(String(selectedRecipe.red));
        const greenData = base64.encode(String(selectedRecipe.green));
        const blueData = base64.encode(String(selectedRecipe.blue));

        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, RED_UUID, redData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, GREEN_UUID, greenData);
        await connectedDevice.writeCharacteristicWithResponseForService(SERVICE_UUID, BLUE_UUID, blueData);

        console.log(`Données envoyées pour ${selectedRecipe.name} : Rouge=${selectedRecipe.red}, Vert=${selectedRecipe.green}, Bleu=${selectedRecipe.blue}`);
      } catch (error) {
        console.log('Erreur d\'envoi des données :', error);
      }
    } else {
      console.log('Aucun appareil connecté ou service non trouvé.');
    }
  }

  const addRecipe = () => {
    if (newRecipe.name && newRecipe.red && newRecipe.green && newRecipe.blue) {
      const newId = recipes.length ? recipes[recipes.length - 1].id + 1 : 1;
      const recipe: Recipe = { id: newId, name: newRecipe.name, red: parseInt(newRecipe.red), green: parseInt(newRecipe.green), blue: parseInt(newRecipe.blue) };
      setRecipes([...recipes, recipe]);
      setNewRecipe({ name: '', red: '', green: '', blue: '' });
      setShowAddRecipe(false);
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
      <View style={styles.tankStatusContainer}>
        <Text style={styles.tankStatusTitle}>Statut des réservoirs :</Text>
        <Text style={styles.tankStatus}>Réservoir 1 : {tank1Status !== null ? (tank1Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
        <Text style={styles.tankStatus}>Réservoir 2 : {tank2Status !== null ? (tank2Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
        <Text style={styles.tankStatus}>Réservoir 3 : {tank3Status !== null ? (tank3Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
      </View>
      {!isConnected && (
        <View style={styles.centeredContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Colorful Cocktail</Text>
          <Button title="Connecter à l'appareil BLE" onPress={scanAndConnect} />
          {isScanning && <ActivityIndicator size="large" color="#0000ff" />}
          {noDevicesFound && <Text style={styles.noDeviceText}>Aucun appareil trouvé. Veuillez réessayer.</Text>}
        </View>
      )}
      {isConnected && (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedDevice}>Connecté à : {connectedDevice?.name || 'Appareil inconnu'}</Text>
          <Text style={styles.sectionTitle}>Recettes</Text>
          <FlatList
            data={recipes}
            renderItem={({ item }) => (
              <View style={[styles.recipeItem, selectedRecipe.id === item.id && styles.selectedRecipe]}>
                <Text onPress={() => setSelectedRecipe(item)} style={styles.recipeName}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeRecipe(item.id)}>
                  <Icon name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <TouchableOpacity onPress={() => setShowAddRecipe(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>Ajouter une recette</Text>
          </TouchableOpacity>
          {showAddRecipe && (
            <View style={styles.addRecipeContainer}>
              <TextInput
                placeholder="Nom de la recette"
                value={newRecipe.name}
                onChangeText={(text) => setNewRecipe({ ...newRecipe, name: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Rouge"
                value={newRecipe.red}
                onChangeText={(text) => setNewRecipe({ ...newRecipe, red: text })}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Vert"
                value={newRecipe.green}
                onChangeText={(text) => setNewRecipe({ ...newRecipe, green: text })}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Bleu"
                value={newRecipe.blue}
                onChangeText={(text) => setNewRecipe({ ...newRecipe, blue: text })}
                style={styles.input}
                keyboardType="numeric"
              />
              <View style={[styles.colorPreview, { backgroundColor: calculateColor(parseInt(newRecipe.red) || 0, parseInt(newRecipe.green) || 0, parseInt(newRecipe.blue) || 0) }]} />
              <Button title="Ajouter la recette" onPress={addRecipe} />
            </View>
          )}
          <Text style={styles.sectionTitle}>Recette sélectionnée</Text>
          <Text style={styles.selectedRecipeText}>{selectedRecipe.name}</Text>
          <View style={[styles.colorPreview, { backgroundColor: calculateColor(selectedRecipe.red, selectedRecipe.green, selectedRecipe.blue) }]} />
          <Button title="Envoyer les données" onPress={sendData} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  tankStatusContainer: {
    marginBottom: 20,
  },
  tankStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tankStatus: {
    fontSize: 18,
    marginVertical: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedContainer: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noDeviceText: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  connectedDevice: {
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 5,
  },
  selectedRecipe: {
    backgroundColor: '#d0eaff',
  },
  recipeName: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  addRecipeContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  colorPreview: {
    width: '100%',
    height: 50,
    borderRadius: 5,
    marginVertical: 10,
  },
  selectedRecipeText: {
    fontSize: 18,
    marginBottom: 10,
  },
});
