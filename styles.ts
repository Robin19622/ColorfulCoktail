import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#f5f5f5',
        },
        messageText: {
          fontSize: 18,
          marginTop: 20,
        },
        tankStatusContainer: {
          width: '100%',
          padding: 10,
          marginBottom: 10,
          backgroundColor: '#fff',
          borderRadius: 10,
          alignItems: 'center',
        },
        tankStatusTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
        },
        tankStatus: {
          fontSize: 16,
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
