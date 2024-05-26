import React, { useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './styles/styles';
import tinycolor from 'tinycolor2';
import { useBLE } from './hooks/useBLE';

type Recipe = {
  id: number;
  name: string;
  red: number;
  green: number;
  blue: number;
};

export default function App() {
  const {
    isConnected,
    connectedDevice,
    isScanning,
    noDevicesFound,
    tank1Status,
    tank2Status,
    tank3Status,
    scanAndConnect,
    sendData,
  } = useBLE();

  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Bleu Ciel', red: 135, green: 206, blue: 235 },
    { id: 2, name: 'Vert Printemps', red: 0, green: 255, blue: 127 }
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [newRecipe, setNewRecipe] = useState({ name: '', red: '', green: '', blue: '' });

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {!showAddRecipe && (
        <>
          <Text style={styles.connectedDevice}>Connecté à : {connectedDevice?.name || 'Appareil inconnu'}</Text>
          <View style={[styles.tankStatusContainer, !isConnected && styles.hidden]}>
            <Text style={styles.tankStatusTitle}>Statut des réservoirs :</Text>
            <Text style={[styles.tankStatus, tank1Status ? styles.alertStatus : null]}>Réservoir 1 : {tank1Status !== null ? (tank1Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
            <Text style={[styles.tankStatus, tank2Status ? styles.alertStatus : null]}>Réservoir 2 : {tank2Status !== null ? (tank2Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
            <Text style={[styles.tankStatus, tank3Status ? styles.alertStatus : null]}>Réservoir 3 : {tank3Status !== null ? (tank3Status ? 'Alerte' : 'OK') : 'Lecture...'}</Text>
          </View>
        </>
      )}
      {!isConnected && (
        <View style={styles.centeredContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logoLoading} />
          <Text style={styles.title}>Colorful Cocktail</Text>
          <Button title="Connecter à l'appareil BLE" onPress={scanAndConnect} />
          {isScanning && <ActivityIndicator size="large" color="#0000ff" />}
          {noDevicesFound && <Text style={styles.noDeviceText}>Aucun appareil trouvé. Veuillez réessayer.</Text>}
        </View>
      )}
      {isConnected && !showAddRecipe && (
        <View style={styles.connectedContainer}>
          <Text style={styles.sectionTitle}>Recettes</Text>
          <FlatList
            data={recipes}
            renderItem={({ item }) => (
              <View style={[styles.recipeItem, selectedRecipe.id === item.id && styles.selectedRecipe]}>
                <Text onPress={() => setSelectedRecipe(item)} style={styles.recipeName}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeRecipe(item.id)}>
                  <Text style={styles.removeText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <TouchableOpacity onPress={() => setShowAddRecipe(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>Ajouter une recette</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Recette sélectionnée</Text>
          <Text style={styles.selectedRecipeText}>{selectedRecipe.name}</Text>
          <View style={[styles.colorPreview, { backgroundColor: calculateColor(selectedRecipe.red, selectedRecipe.green, selectedRecipe.blue) }]} />
          <Button title="Envoyer les données" onPress={() => sendData(selectedRecipe)} />
        </View>
      )}
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
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => setShowAddRecipe(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addRecipe} style={styles.addRecipeButton}>
              <Text style={styles.addRecipeButtonText}>Ajouter la recette</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
