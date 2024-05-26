import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tankStatus: {
    fontSize: 18,
    marginVertical: 5,
    color: '#333', // Default text color
  },
  alertStatus: {
    color: 'red', // Make alert statuses stand out
    fontWeight: 'bold',
  },
  logoLoading: {
    width: 150, // Larger logo for better visibility
    height: 150,
    marginBottom: 20,
    borderRadius: 75, // Fully rounded
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hidden: {
    display: 'none',
  },
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
  removeText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});