import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './styles/styles';
import tinycolor from 'tinycolor2';
import { useBLE } from './hooks/useBLE';
import SyncStorage from 'sync-storage';

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

  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [newRecipe, setNewRecipe] = useState({ name: '', red: '', green: '', blue: '' });

  useEffect(() => {
    // Initialize SyncStorage and load recipes
    const initStorage = async () => {
      await SyncStorage.init();
      const storedRecipes = SyncStorage.get('recipes');
      console.log('Loaded recipes from storage:', storedRecipes);
      if (storedRecipes) {
        const parsedRecipes = JSON.parse(storedRecipes);
        setRecipes(parsedRecipes);
        if (parsedRecipes.length > 0) {
          setSelectedRecipe(parsedRecipes[0]);
        }
      }
      setIsStorageInitialized(true);
    };

    initStorage();
  }, []);

  useEffect(() => {
    if (recipes.length > 0 && !selectedRecipe) {
      setSelectedRecipe(recipes[0]);
    }
  }, [recipes]);

  const addRecipe = () => {
    if (newRecipe.name && newRecipe.red && newRecipe.green && newRecipe.blue) {
      const newId = recipes.length ? recipes[recipes.length - 1].id + 1 : 1;
      const recipe: Recipe = { id: newId, name: newRecipe.name, red: parseInt(newRecipe.red), green: parseInt(newRecipe.green), blue: parseInt(newRecipe.blue) };
      const updatedRecipes = [...recipes, recipe];
      setRecipes(updatedRecipes);
      SyncStorage.set('recipes', JSON.stringify(updatedRecipes));
      console.log('Saved recipes to storage:', JSON.stringify(updatedRecipes));
      setNewRecipe({ name: '', red: '', green: '', blue: '' });
      setShowAddRecipe(false);
    }
  };

  const removeRecipe = (id: number) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    SyncStorage.set('recipes', JSON.stringify(updatedRecipes));
    console.log('Updated recipes in storage after removal:', JSON.stringify(updatedRecipes));
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe(updatedRecipes.length > 0 ? updatedRecipes[0] : null);
    }
  };

  const calculateColor = (red: number, green: number, blue: number) => {
    return tinycolor({ r: red, g: green, b: blue }).toRgbString();
  };

  if (!isStorageInitialized) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
              <View style={[styles.recipeItem, selectedRecipe?.id === item.id && styles.selectedRecipe]}>
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
          {selectedRecipe && (
            <>
              <Text style={styles.sectionTitle}>Recette sélectionnée</Text>
              <Text style={styles.selectedRecipeText}>{selectedRecipe.name}</Text>
              <View style={[styles.colorPreview, { backgroundColor: calculateColor(selectedRecipe.red, selectedRecipe.green, selectedRecipe.blue) }]} />
              <Button title="Envoyer les données" onPress={() => sendData(selectedRecipe)} />
            </>
          )}
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
