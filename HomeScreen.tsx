import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tinycolor from 'tinycolor2';
import SyncStorage from 'sync-storage';
import { useBLE } from './hooks/useBLE';
import { useIsFocused } from '@react-navigation/native';

type Recipe = {
  id: number;
  name: string;
  red: number;
  green: number;
  blue: number;
};

// Initialize sync-storage
SyncStorage.init();

export default function HomeScreen({ navigation }) {
  const {
    isConnected,
    isScanning,
    noDevicesFound,
    tank1Status,
    tank2Status,
    tank3Status,
    scanAndConnect,
    sendData,
    connectedDevice,
  } = useBLE();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipesUpdated, setRecipesUpdated] = useState(false); // new state variable to force a re-render

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );
  
  const loadRecipes = useCallback(() => {
    console.log('Loading recipes...');
    const storedRecipes = SyncStorage.get('recipes');
    if (storedRecipes) {
      const parsedRecipes = JSON.parse(storedRecipes);
      console.log('Recipes loaded:', parsedRecipes);
      setRecipes(parsedRecipes); // Update the state of the recipes
    } else {
      console.log('No recipes found');
      setRecipes([]); // Ensure state is updated even if no recipes are found
    }
  }, [setRecipes]);
  
  const saveRecipes = (updatedRecipes: Recipe[]) => {
    SyncStorage.set('recipes', JSON.stringify(updatedRecipes));
    setRecipes(updatedRecipes); // Update state with new recipes
    setRecipesUpdated(true); // set the recipesUpdated state to true
  };

  const removeRecipe = useCallback((id: number) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    saveRecipes(updatedRecipes);
  }, [recipes]);

  const calculateColor = useCallback((red: number, green: number, blue: number) => {
    return tinycolor({ r: red, g: green, b: blue }).toRgbString();
  }, []);

  const renderHeader = () => (
    <>
      {isConnected && (
        <View style={styles.tankStatusContainer}>
          <Text style={styles.tankStatusTitle}>Statut des réservoirs :</Text>
          {[
            { status: tank1Status, label: "Réservoir 1" },
            { status: tank2Status, label: "Réservoir 2" },
            { status: tank3Status, label: "Réservoir 3" },
          ].map((tank, index) => (
            <Text key={index} style={[styles.tankStatus, tank.status === 1 && styles.alertStatus]}>
              {tank.label} : {tank.status !== null ? (tank.status ? 'Alerte' : 'OK') : 'Lecture...'}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.connectedDevice}>Connecté à : {connectedDevice?.name || 'Appareil inconnu'}</Text>
      <Text style={styles.sectionTitle}>Recettes</Text>
    </>
  );
  

  const renderFooter = () => (
    <>
      <TouchableOpacity onPress={() => navigation.navigate('AddRecipe', { onReturn: setRecipes })}>
        <Text>Add Recipe</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Recette sélectionnée</Text>
      {selectedRecipe && (
        <>
          <Text style={styles.selectedRecipeText}>{selectedRecipe.name}</Text>
          <View style={[styles.colorPreview, { backgroundColor: calculateColor(selectedRecipe.red, selectedRecipe.green, selectedRecipe.blue) }]} />
          <Button title="Envoyer les données" onPress={() => sendData(selectedRecipe)} />
        </>
      )}
    </>
  );

  const renderItem = ({ item }: { item: Recipe }) => (
    <View style={[styles.recipeItem, selectedRecipe?.id === item.id && styles.selectedRecipe]}>
      <Text style={styles.recipeName} onPress={() => setSelectedRecipe(item)}>{item.name}</Text>
      <TouchableOpacity onPress={() => removeRecipe(item.id)} style={styles.trashButton}>
        <Icon name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (!isConnected) {
      return (
        <View style={styles.centeredContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('./assets/logo.png')} style={styles.logoLoading} />
          </View>
          <Text style={styles.title}>Colorful Cocktail</Text>
          <Button title="Connecter à l'appareil BLE" onPress={scanAndConnect} />
          {isScanning && <ActivityIndicator size="large" color="#0000ff" />}
          {noDevicesFound && <Text style={styles.noDeviceText}>Aucun appareil trouvé. Veuillez réessayer.</Text>}
        </View>
      );
    }

    return (
      <FlatList
        ListHeaderComponent={renderHeader}
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 100 }} // Adjust padding bottom to ensure buttons are not too high
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
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
  alertStatus: {
    color: 'red',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  trashButton: {
    marginLeft: 10,
    backgroundColor: '#f9f9f9',
    padding: 5,
    borderRadius: 5,
  },
  logoLoading: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#000',
  },
});
