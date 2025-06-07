import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../navigation/types';
import platsData from '../data/plats.json';
import { Plat, PlatIngredient, Ingredient } from '../models/models';
import UnitSelector from '../components/UnitSelector';
import FallbackImage from '../components/FallbackImage';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';


type FoodScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodConfig'>;

const FoodSet = () => {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlat, setSelectedPlat] = useState<Plat | null>(null);
  const [editPlat, setEditPlat] = useState<Plat | null>(null);
  const [predefinedQuantities, setPredefinedQuantities] = useState<{ [key: string]: string }>({});
  const [predefinedUnits, setPredefinedUnits] = useState<{ [key: string]: string }>({});
  const [selectedPlats, setSelectedPlats] = useState<string[]>([]); // Track selected plat IDs
  const navigation = useNavigation<FoodScreenNavigationProp>();
  const [longPressedPlats, setLongPressedPlats] = useState<Set<string>>(new Set());
  const userId = auth().currentUser?.uid;


  const [familleId, setFamilleId] = useState<string | null>(null);

  const units = ['g', 'kg', 'ml', 'l', 'cuillère', 'unité', 'pincée', 'c. à soupe', 'c. à café', 'gousses', 'au goût', 'selon besoin'];

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.uid) {
        setFamilleId(user.uid);
      } else {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
      }
    });
    const loadData = async () => {
      const selectedPlatsSnap = await firestore()
        .collection('families')
        .doc(userId)
        .collection('selectedPlats')
        .get();
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    const platsCorriges = platsData.plats.map((plat) => ({
      ...plat,
      type: plat.type === 'camerounais' ? 'camerounais' : 'européen',
    })) as Plat[];

    setPlats(platsCorriges);
    setIngredients(platsData.ingredients);
  }, []);

  useEffect(() => {
    if (familleId) {
      fetchSelectedPlats(familleId);
    }
  }, [familleId]);

  const fetchSelectedPlats = async (familleId: string) => {
    try {
      const snapshot = await firestore()
        .collection('families')
        .doc(familleId)
        .collection('selectedPlats')
        .get();

      const selectedIds = snapshot.docs.map((doc) => doc.id);
      setSelectedPlats(selectedIds);
    } catch (error: any) {
      console.error('Erreur lors du fetch :', error);
      Alert.alert('Erreur', 'Impossible de charger les plats sélectionnés.');
    }
  };

  const togglePlatSelection = async (platId: string) => {
    if (!familleId) return;
    const updatedSet = new Set(longPressedPlats);
    if (updatedSet.has(platId)) {
      updatedSet.delete(platId);
    } else {
      updatedSet.add(platId);
    }
    setLongPressedPlats(updatedSet);
    try {
      const docRef = firestore()
        .collection('families')
        .doc(familleId)
        .collection('selectedPlats')
        .doc(platId);

      if (selectedPlats.includes(platId)) {
        await docRef.delete();
        setSelectedPlats((prev) => prev.filter((id) => id !== platId));
      } else {
        await docRef.set({
          selectedAt: firestore.FieldValue.serverTimestamp(),
        });
        setSelectedPlats((prev) => [...prev, platId]);
      }
    } catch (error: any) {
      console.error('Erreur Firestore :', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la sélection.');
    }
  };



  // Save or update plat to Firestore
  const savePlatToFirestore = async (plat: Plat) => {
    try {
      await firestore().collection('plats').doc(plat.id).set({
        nom: plat.nom,
        type: plat.type,
        image: plat.image || '',
        ingredients: plat.ingredients,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Plat ${plat.nom} saved to Firestore`);
    } catch (error) {
      console.error('Error saving plat to Firestore:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le plat');
    }
  };

  const handleBack = () => navigation.goBack();
  const handleNext = () => navigation.navigate('Drawer');

  const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

  const modifierPlat = () => {
    if (!editPlat?.nom.trim() || editPlat?.ingredients.length === 0) {
      Alert.alert('Erreur', 'Le plat doit avoir un nom et au moins un ingrédient');
      return;
    }

    const updatedIngredients = editPlat.ingredients.map((ing) => ({
      ...ing,
      quantite: parseFloat(predefinedQuantities[ing.id]) || 0,
      unite: predefinedUnits[ing.id] || ing.unite,
    }));

    const updatedPlat = { ...editPlat, ingredients: updatedIngredients };

    setPlats((prev) =>
      prev.map((plat) =>
        plat.id === editPlat.id ? updatedPlat : plat
      )
    );

    savePlatToFirestore(updatedPlat);

    resetEditModal();
  };

  const supprimerPlat = () => {
    if (selectedPlat) {
      Alert.alert(
        'Confirmer la suppression',
        `Voulez-vous vraiment supprimer "${selectedPlat.nom}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete from Firestore
                await firestore().collection('plats').doc(selectedPlat.id).delete();
                await firestore().collection('selectedPlats').doc(selectedPlat.id).delete();

                setPlats((prev) => prev.filter((plat) => plat.id !== selectedPlat.id));
                setSelectedPlats((prev) => prev.filter((id) => id !== selectedPlat.id));
                setSelectedPlat(null);
              } catch (error) {
                console.error('Error deleting plat:', error);
                Alert.alert('Erreur', 'Impossible de supprimer le plat');
              }
            },
          },
        ]
      );
    }
  };

  const openEditModal = () => {
    if (selectedPlat) {
      setEditPlat({ ...selectedPlat });
      setPredefinedQuantities(Object.fromEntries(selectedPlat.ingredients.map((i) => [i.id, i.quantite.toString()])));
      setPredefinedUnits(Object.fromEntries(selectedPlat.ingredients.map((i) => [i.id, i.unite])));
      setEditModalVisible(true);
      setSelectedPlat(null);
    }
  };

  const resetEditModal = () => {
    setEditPlat(null);
    setPredefinedQuantities({});
    setPredefinedUnits({});
    setEditModalVisible(false);
  };

  const getIngredientById = (id: string): Ingredient | undefined =>
    ingredients.find((ing) => ing.id === id);

  const renderIngredientItem = ({ item }: { item: PlatIngredient }) => {
    const ingredient = getIngredientById(item.id);
    return (
      <View style={styles.ingredientItem}>
        <View style={styles.ingredientContent}>
          {ingredient?.image && (
            <FallbackImage
              source={{ uri: ingredient.image }}
              style={styles.image}
              fallbackSource={require('../assets/default_ingredient.png')}
            />
          )}
          <View>
            <Text style={styles.ingredientText}>{ingredient?.nom || item.id}</Text>
            {item.commentaire && <Text style={styles.commentText}>{item.commentaire}</Text>}
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <TextInput
            placeholder="Quantité"
            value={predefinedQuantities[item.id] || item.quantite.toString()}
            onChangeText={(text) =>
              setPredefinedQuantities((prev) => ({ ...prev, [item.id]: text }))
            }
            keyboardType="numeric"
            style={styles.quantityInput}
          />
          <UnitSelector
            units={units}
            selectedUnit={predefinedUnits[item.id] || ''}
            onSelect={(unit) => setPredefinedUnits((prev) => ({ ...prev, [item.id]: unit }))}
          />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Plat }) => (
    <TouchableOpacity
      style={[
        styles.memberContainer,
        longPressedPlats.has(item.id) && styles.boxPressed
      ]}
      onPress={() => {
        setSelectedPlat(item);
        // handlePlatSelection(item.id);
      }}
      onLongPress={() => {
        togglePlatSelection(item.id)
        //Alert.alert("Long pressed");
      }}
    >
      <FallbackImage
        source={{ uri: item.image }}
        fallbackSource={require('../assets/default_plat.png')}
        style={styles.memberPhoto}
      />
      <View>
        <Text style={styles.memberText}>{item.nom}</Text>
        <Text style={styles.typeText}>{item.type}</Text>
      </View>


    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#d9e4ef', '#FFFFFF']}
      start={{ x: 0.8, y: 1 }}
      end={{ x: 0.8, y: 0 }}
      style={styles.container}
    >
      <View style={styles.header}>

        <Text style={styles.title}>Choisissez vos plats favoris</Text>
      </View>

      <Text style={styles.secondTitle}>Sélectionnez vos plats favoris</Text>

      <FlatList
        data={plats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true}
        style={styles.sectionList}
      />


      <Text style={styles.footerText}>
        Vous pouvez modifier les quantités des ingrédients pour chaque plat.
      </Text>

      {/* Modals kept intact */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editModalVisible}
        onRequestClose={resetEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{editPlat?.nom}</Text>
            <Text style={styles.modalType}>{editPlat?.type}</Text>
            {editPlat?.image && (
              <Image
                source={{ uri: editPlat.image }}
                style={styles.modalImage}
                defaultSource={require('../assets/default_plat.png')}
              />
            )}
            <Text style={styles.modalSubtitle}>Ingrédients</Text>
            <FlatList
              data={editPlat?.ingredients}
              renderItem={renderIngredientItem}
              keyExtractor={(item) => item.id}
              style={styles.ingredientList}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetEditModal}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={modifierPlat}>
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedPlat}
        onRequestClose={() => setSelectedPlat(null)}
      >
        <View style={styles.bottomModal}>
          <View style={styles.padding}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedPlat?.nom}</Text>
            <Text style={styles.modalType}>{selectedPlat?.type}</Text>
            {selectedPlat?.image && (
              <Image
                source={{ uri: selectedPlat.image }}
                style={styles.modalImage}
                defaultSource={require('../assets/default_plat.png')}
              />
            )}
            <Text style={styles.modalSubtitle}>Ingrédients</Text>
            {selectedPlat?.ingredients.map((ing) => {
              const ingredient = getIngredientById(ing.id);
              return (
                <Text key={ing.id} style={styles.modalIngredient}>
                  {ingredient?.nom || ing.id}: {ing.quantite} {ing.unite}
                  {ing.commentaire && ` (${ing.commentaire})`}
                </Text>
              );
            })}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={supprimerPlat}>
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlat(null)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondTitle: {
    fontSize: 15,
    color: '#151515',
    marginBottom: 20,
  },
  sectionList: {
    marginBottom: 20,
    height: WINDOW_HEIGHT / 3,
  },
  memberContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    borderColor: '#9DD02C',
    borderWidth: 1,
  },
  selectedContainer: {
    backgroundColor: '#E6F3D9', // Light green for selected items
    borderColor: '#4CAF50', // Darker green border
  },
  memberPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberText: {
    fontSize: 16,
    flex: 1,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#151515',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#151515',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalType: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  ingredientList: {
    marginBottom: 10,
  },
  ingredientItem: {
    //flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  ingredientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
  commentText: {
    fontSize: 12,
    color: 'grey',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#9cd02c',
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
    width: 100,
  },
  unitButtonContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  unitButton: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  unitButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  unitButtonText: {
    fontSize: 12,
    color: 'black',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    flex: 1,
    marginRight: 5,
  },
  cancelButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#9DD02C',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  confirmButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 10,
  },
  padding: {
    padding: 20,
  },
  modalHandle: {
    backgroundColor: '#ccc',
    width: 50,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalIngredient: {
    fontSize: 14,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  box: {

  },
  boxPressed: {
    backgroundColor: "#d4ff72",
    borderWidth: 3,
  },
});

export default FoodSet;