import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from './styles/styles';
import tinycolor from 'tinycolor2';
import SyncStorage from 'sync-storage';

type Recipe = {
  id: number;
  name: string;
  red: number;
  green: number;
  blue: number;
};

export default function AddRecipeScreen({ navigation, route }) {
  const [newRecipe, setNewRecipe] = useState({ name: '', red: '', green: '', blue: '' });
  const { onReturn } = route.params;
  
const addRecipe = () => {
  const storedRecipes = SyncStorage.get('recipes') || '[]';
  const recipes = JSON.parse(storedRecipes);
  if (newRecipe.name && newRecipe.red && newRecipe.green && newRecipe.blue) {
    const newId = recipes.length ? recipes[recipes.length - 1].id + 1 : 1;
    const recipe: Recipe = {
      id: newId,
      name: newRecipe.name,
      red: parseInt(newRecipe.red),
      green: parseInt(newRecipe.green),
      blue: parseInt(newRecipe.blue),
    };
    const updatedRecipes = [...recipes, recipe];
    SyncStorage.set('recipes', JSON.stringify(updatedRecipes));
    navigation.goBack();
    SyncStorage.set('recipes', JSON.stringify(updatedRecipes));
    if (onReturn) onReturn(updatedRecipes); // Call the callback with new recipes
    navigation.goBack();
  };
};

  const calculateColor = (red: number, green: number, blue: number) => {
    return tinycolor({ r: red, g: green, b: blue }).toRgbString();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
        <View style={styles.buttonContainer}>
          <Button title="Ajouter la recette" onPress={addRecipe} />
          <Button title="Annuler" onPress={() => navigation.goBack()} color="red" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
