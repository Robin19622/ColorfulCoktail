import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform, PermissionsAndroid, TextInput, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import tinycolor from 'tinycolor2';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const [isScanning, setIsScanning] = useState(false);
  const [noDevicesFound, setNoDevicesFound] = useState(false);
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
    if (isScanning) return; // Prevent multiple scans at the same time

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

          console.log(`Données envoyées pour ${selectedRecipe.name} : Rouge=${selectedRecipe.red}, Vert=${selectedRecipe.green}, Bleu=${selectedRecipe.blue}`);
        } else {
          console.log('Service non trouvé.');
        }
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75, // Make the logo round
    borderWidth: 2,
    borderColor: '#ff6347', // Match the border color to the title color
  },
  title: {
    fontSize: 28, // Increase the font size
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff6347',
    textShadowColor: 'rgba(0, 0, 0, 0.25)', // Add a subtle shadow
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  connectedContainer: {
    width: '100%',
    padding: 10,
  },
  connectedDevice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#32CD32',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  selectedRecipe: {
    backgroundColor: '#e0f7fa',
  },
  recipeName: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addRecipeContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  colorPreview: {
    width: '100%',
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
  noDeviceText: {
    marginTop: 20,
    color: 'red',
    fontWeight: 'bold',
  },
  selectedRecipeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
