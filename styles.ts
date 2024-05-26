import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    fontWeight: 'bold', // Make the alert text bold
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
    width: 120, // Increased size
    height: 120, // Increased size
    marginBottom: 20,
    borderRadius: 60, // Increased to make it perfectly round
    borderWidth: 2, // Thicker border
    borderColor: '#000',
    alignSelf: 'center', // Ensure it's centered
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
