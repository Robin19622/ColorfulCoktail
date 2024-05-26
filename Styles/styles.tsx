import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tankStatus: {
    fontSize: 16,
    marginVertical: 2,
    color: 'gray',
  },
  alertStatus: {
    color: 'red',
    fontWeight: 'bold',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logoLoading: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'gray',
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
    padding: 16,
  },
  tankStatusContainer: {
    marginBottom: 16,
  },
  tankStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
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
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noDeviceText: {
    marginTop: 16,
    fontSize: 16,
    color: 'red',
  },
  connectedDevice: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#007BFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
    borderRadius: 4,
  },
  selectedRecipe: {
    backgroundColor: '#d0eaff',
  },
  recipeName: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addRecipeContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  colorPreview: {
    width: '100%',
    height: 40,
    borderRadius: 4,
    marginVertical: 8,
  },
  selectedRecipeText: {
    fontSize: 16,
    marginBottom: 8,
  },
  removeText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#721c24',
    fontSize: 16,
    textAlign: 'center',
  },
  addRecipeButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  addRecipeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
