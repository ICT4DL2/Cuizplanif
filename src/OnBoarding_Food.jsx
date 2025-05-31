import React, { useRef, useState } from 'react';
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
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../navigation/types';

// Define the Ingredient interface for plats
interface PlatIngredient {
  nom: string;
  quantite: number;
  unite: string;
}

// Define the Plat interface
interface Plat {
  id: string;
  nom: string;
  image: any;
  ingredients: PlatIngredient[];
}

// Define the Predefined Ingredient interface
interface Ingredient {
  id: string;
  nom: string;
  image: any;
}

// Navigation prop type
type FamilyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FamilyConfig'>;

const OnBoarding_Food = () => {
  // State declarations
  const [plats, setPlats] = useState<Plat[]>([
    {
      id: '1',
      nom: 'Riz au poulet',
      image: require('../assets/salad.jpg'),
      ingredients: [
        { nom: 'Riz', quantite: 200, unite: 'g' },
        { nom: 'Poulet', quantite: 300, unite: 'g' },
        { nom: 'Oignons', quantite: 2, unite: 'unité' },
        { nom: 'Tomates', quantite: 3, unite: 'unité' },
      ],
    },
    {
      id: '2',
      nom: 'Attiéké poisson',
      image: require('../assets/salad.jpg'),
      ingredients: [
        { nom: 'Attiéké', quantite: 150, unite: 'g' },
        { nom: 'Poisson', quantite: 1, unite: 'unité' },
        { nom: 'Piment', quantite: 1, unite: 'cuillère' },
        { nom: 'Oignons', quantite: 1, unite: 'unité' },
      ],
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlat, setSelectedPlat] = useState<Plat | null>(null);
  const [newNom, setNewNom] = useState('');
  const [newIngredients, setNewIngredients] = useState<PlatIngredient[]>([]);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [editPlat, setEditPlat] = useState<Plat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customIngredient, setCustomIngredient] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');
  const [customUnit, setCustomUnit] = useState('g');
  const [predefinedQuantities, setPredefinedQuantities] = useState<{ [key: string]: string }>({});
  const [predefinedUnits, setPredefinedUnits] = useState<{ [key: string]: string }>({});
  const progressAnim = useRef(new Animated.Value(30)).current;

  // Predefined ingredients with updated image extensions
  const predefinedIngredients: Ingredient[] = [
    { id: '1', nom: 'Riz', image: require('../assets/riz.jpeg') },
    { id: '2', nom: 'Poulet', image: require('../assets/poulet.jpg') },
    { id: '3', nom: 'Oignons', image: require('../assets/oignons.jpeg') },
    { id: '4', nom: 'Tomates', image: require('../assets/tomates.jpeg') },
    { id: '5', nom: 'Piment', image: require('../assets/piment.jpeg') },
    { id: '6', nom: 'Attiéké', image: require('../assets/attieke.jpeg') },
    { id: '7', nom: 'Poisson', image: require('../assets/poisson.jpg') },
  ];

  // Predefined units
  const units = ['g', 'kg', 'ml', 'l', 'cuillère', 'unité'];

  const navigation = useNavigation<FamilyScreenNavigationProp>();

  // Progress bar animation
  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['25%', '100%'],
  });

  // Handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate('Drawer');
  };

  const openImagePicker = (isEdit: boolean = false) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri || null;
        if (isEdit && editPlat) {
          setEditPlat({ ...editPlat, image: uri ? { uri } : editPlat.image });
        } else {
          setNewImage(uri);
        }
      }
    });
  };

  const ajouterPlat = () => {
    if (!newNom.trim() || newIngredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir le nom du plat et ajouter au moins un ingrédient');
      return;
    }

    const plat: Plat = {
      id: Date.now().toString(),
      nom: newNom,
      image: newImage ? { uri: newImage } : require('../assets/salad.jpg'),
      ingredients: newIngredients,
    };

    setPlats([plat, ...plats]);
    resetAddModal();
  };

  const modifierPlat = () => {
    if (!editPlat?.nom.trim() || editPlat?.ingredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir le nom du plat et ajouter au moins un ingrédient');
      return;
    }

    setPlats((prevPlats) =>
      prevPlats.map((plat) => (plat.id === editPlat.id ? { ...editPlat } : plat))
    );
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
            onPress: () => {
              setPlats(plats.filter((plat) => plat.id !== selectedPlat.id));
              setSelectedPlat(null);
            },
          },
        ]
      );
    }
  };

  const openEditModal = () => {
    if (selectedPlat) {
      setEditPlat({ ...selectedPlat });
      const initialQuantities = selectedPlat.ingredients.reduce(
        (acc, ing) => ({ ...acc, [ing.nom]: ing.quantite.toString() }),
        {}
      );
      const initialUnits = selectedPlat.ingredients.reduce(
        (acc, ing) => ({ ...acc, [ing.nom]: ing.unite }),
        {}
      );
      setPredefinedQuantities(initialQuantities);
      setPredefinedUnits(initialUnits);
      setEditModalVisible(true);
      setSelectedPlat(null);
    }
  };

  const toggleIngredient = (ingredient: string, isEdit: boolean = false) => {
    const quantiteStr = predefinedQuantities[ingredient] || '';
    const quantite = parseFloat(quantiteStr);
    const unite = predefinedUnits[ingredient] || 'g';

    if (isNaN(quantite) || quantite <= 0) {
      Alert.alert('Erreur', 'Veuillez spécifier une quantité positive pour cet ingrédient');
      return;
    }

    const newIngredient = { nom: ingredient, quantite, unite };
    if (isEdit && editPlat) {
      const updatedIngredients = editPlat.ingredients.some((i) => i.nom === ingredient)
        ? editPlat.ingredients.filter((i) => i.nom !== ingredient)
        : [...editPlat.ingredients, newIngredient];
      setEditPlat({ ...editPlat, ingredients: updatedIngredients });
    } else {
      setNewIngredients((prev) =>
        prev.some((i) => i.nom === ingredient)
          ? prev.filter((i) => i.nom !== ingredient)
          : [...prev, newIngredient]
      );
    }
  };

  const addCustomIngredient = (isEdit: boolean = false) => {
    if (!customIngredient.trim()) {
      Alert.alert('Erreur', 'Veuillez spécifier un nom pour l\'ingrédient');
      return;
    }
    const quantite = parseFloat(customQuantity);
    if (isNaN(quantite) || quantite <= 0) {
      Alert.alert('Erreur', 'Veuillez spécifier une quantité positive');
      return;
    }

    const newIngredient = { nom: customIngredient, quantite, unite: customUnit };
    if (isEdit && editPlat) {
      setEditPlat({ ...editPlat, ingredients: [...editPlat.ingredients, newIngredient] });
    } else {
      setNewIngredients((prev) => [...prev, newIngredient]);
    }
    setCustomIngredient('');
    setCustomQuantity('');
    setCustomUnit('g');
  };

  const resetAddModal = () => {
    setNewNom('');
    setNewIngredients([]);
    setNewImage(null);
    setCustomIngredient('');
    setCustomQuantity('');
    setCustomUnit('g');
    setSearchQuery('');
    setPredefinedQuantities({});
    setPredefinedUnits({});
    setModalVisible(false);
  };

  const resetEditModal = () => {
    setEditPlat(null);
    setCustomIngredient('');
    setCustomQuantity('');
    setCustomUnit('g');
    setSearchQuery('');
    setPredefinedQuantities({});
    setPredefinedUnits({});
    setEditModalVisible(false);
  };

  const filteredIngredients = predefinedIngredients.filter((ingredient) =>
    ingredient.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render unit buttons
  const renderUnitButtons = (ingredientNom: string | null, isEdit: boolean = false, isCustom: boolean = false) => (
    <View style={styles.unitButtonContainer}>
      {units.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[
            styles.unitButton,
            (isCustom ? customUnit : predefinedUnits[ingredientNom || '']) === unit && styles.unitButtonSelected,
          ]}
          onPress={() => {
            if (isCustom) {
              setCustomUnit(unit);
            } else {
              setPredefinedUnits((prev) => ({ ...prev, [ingredientNom || '']: unit }));
            }
          }}
        >
          <Text style={styles.unitButtonText}>{unit}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render item for ingredients list
  const renderIngredientItem = ({ item }: { item: Ingredient }, isEdit: boolean = false) => {
    const isSelected = isEdit
      ? editPlat?.ingredients.some((i) => i.nom === item.nom)
      : newIngredients.some((i) => i.nom === item.nom);
    return (
      <View style={[styles.ingredientItem, isSelected && styles.ingredientItemSelected]}>
        <TouchableOpacity
          style={styles.ingredientContent}
          onPress={() => toggleIngredient(item.nom, isEdit)}
        >
          <Image source={item.image} style={styles.image} />
          <Text style={styles.ingredientText}>{item.nom}</Text>
        </TouchableOpacity>
        <View style={styles.quantityContainer}>
          <TextInput
            placeholder="Quantité"
            value={predefinedQuantities[item.nom] || ''}
            onChangeText={(text) =>
              setPredefinedQuantities((prev) => ({ ...prev, [item.nom]: text }))
            }
            keyboardType="numeric"
            style={styles.quantityInput}
            accessibilityLabel={`Quantité pour ${item.nom}`}
          />
          {renderUnitButtons(item.nom, isEdit)}
        </View>
      </View>
    );
  };

  // Render item for selected ingredients
  const renderSelectedIngredient = ({ item }: { item: PlatIngredient }) => (
    <View style={styles.selectedIngredientItem}>
      <Text style={styles.selectedIngredientText}>
        {item.nom} ({item.quantite} {item.unite})
      </Text>
    </View>
  );

  // Render item for FlatList
  const renderItem = ({ item }: { item: Plat }) => (
    <TouchableOpacity
      style={styles.memberContainer}
      onPress={() => setSelectedPlat(item)}
    >
      <Image source={item.image} style={styles.memberPhoto} />
      <Text style={styles.memberText}>{item.nom}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModalProvider>
      <LinearGradient
        colors={['#d9e4ef', '#FFFFFF']}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.8, y: 0 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Let's start</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: widthInterpolated }]} />
        </View>

        <Text style={styles.secondTitle}>Ajoutez vos plats favoris</Text>

        {/* Plat List */}
        <FlatList
          data={plats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Ajouter un nouveau plat"
            >
              <Text style={styles.addButtonText}>+ Ajouter un plat</Text>
            </TouchableOpacity>
          }
          nestedScrollEnabled={true}
        />

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Suivant</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Vous pouvez toujours ajouter des plats plus tard dans l'application
        </Text>

        {/* Add Plat Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Nouveau plat</Text>
              <TextInput
                placeholder="Nom du plat"
                value={newNom}
                onChangeText={setNewNom}
                style={styles.input}
                accessibilityLabel="Nom du plat"
              />
              <Text style={styles.modalSubtitle}>Ingrédients sélectionnés</Text>
              <FlatList
                data={newIngredients}
                renderItem={renderSelectedIngredient}
                keyExtractor={(item, index) => `${item.nom}-${index}`}
                style={styles.selectedIngredientsList}
                nestedScrollEnabled={true}
              />
              <TextInput
                placeholder="Rechercher un ingrédient..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.input}
                accessibilityLabel="Rechercher un ingrédient"
              />
              <FlatList
                data={filteredIngredients}
                renderItem={(props) => renderIngredientItem(props, false)}
                keyExtractor={(item) => item.id}
                style={styles.ingredientList}
                nestedScrollEnabled={true}
              />
              <Text style={styles.modalSubtitle}>Ajouter un ingrédient personnalisé</Text>
              <TextInput
                placeholder="Nom de l'ingrédient"
                value={customIngredient}
                onChangeText={setCustomIngredient}
                style={styles.input}
                accessibilityLabel="Nom de l'ingrédient personnalisé"
              />
              <View style={styles.quantityContainer}>
                <TextInput
                  placeholder="Quantité"
                  value={customQuantity}
                  onChangeText={setCustomQuantity}
                  keyboardType="numeric"
                  style={styles.quantityInput}
                  accessibilityLabel="Quantité de l'ingrédient personnalisé"
                />
                {renderUnitButtons(null, false, true)}
              </View>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => addCustomIngredient()}
              >
                <Text style={styles.addCustomButtonText}>Ajouter cet ingrédient</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetAddModal}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={ajouterPlat}>
                  <Text style={styles.confirmButtonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Plat Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Modifier le plat</Text>
              <TextInput
                placeholder="Nom du plat"
                value={editPlat?.nom || ''}
                onChangeText={(text) => setEditPlat(editPlat ? { ...editPlat, nom: text } : null)}
                style={styles.input}
                accessibilityLabel="Nom du plat"
              />
              <Text style={styles.modalSubtitle}>Ingrédients sélectionnés</Text>
              <FlatList
                data={editPlat?.ingredients || []}
                renderItem={renderSelectedIngredient}
                keyExtractor={(item, index) => `${item.nom}-${index}`}
                style={styles.selectedIngredientsList}
                nestedScrollEnabled={true}
              />
              <TextInput
                placeholder="Rechercher un ingrédient..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.input}
                accessibilityLabel="Rechercher un ingrédient"
              />
              <FlatList
                data={filteredIngredients}
                renderItem={(props) => renderIngredientItem(props, true)}
                keyExtractor={(item) => item.id}
                style={styles.ingredientList}
                nestedScrollEnabled={true}
              />
              <Text style={styles.modalSubtitle}>Ajouter un ingrédient personnalisé</Text>
              <TextInput
                placeholder="Nom de l'ingrédient"
                value={customIngredient}
                onChangeText={setCustomIngredient}
                style={styles.input}
                accessibilityLabel="Nom de l'ingrédient personnalisé"
              />
              <View style={styles.quantityContainer}>
                <TextInput
                  placeholder="Quantité"
                  value={customQuantity}
                  onChangeText={setCustomQuantity}
                  keyboardType="numeric"
                  style={styles.quantityInput}
                  accessibilityLabel="Quantité de l'ingrédient personnalisé"
                />
                {renderUnitButtons(null, true, true)}
              </View>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => addCustomIngredient(true)}
              >
                <Text style={styles.addCustomButtonText}>Ajouter cet ingrédient</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetEditModal}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={modifierPlat}>
                  <Text style={styles.confirmButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Plat Details Modal */}
        <Modal
          visible={!!selectedPlat}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedPlat(null)}
        >
          <View style={styles.bottomModal}>
            {selectedPlat?.image && (
              <Image source={selectedPlat.image} style={styles.modalImage} />
            )}
            <Text style={styles.modalTitle}>{selectedPlat?.nom}</Text>
            <Text style={styles.modalSubtitle}>Ingrédients :</Text>
            {selectedPlat?.ingredients.map((ingredient, idx) => (
              <Text key={idx} style={styles.modalIngredient}>
                - {ingredient.nom} ({ingredient.quantite} {ingredient.unite})
              </Text>
            ))}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={supprimerPlat} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSelectedPlat(null)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </LinearGradient>
    </BottomSheetModalProvider>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  secondTitle: {
    fontSize: 15,
    color: '#151515',
    marginBottom: 30,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#0066CC',
    borderRadius: 3,
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
  addButton: {
    backgroundColor: '#8BC34A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#151515',
    fontWeight: 'bold',
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
    width: '100%',
    height: '100%',
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
  input: {
    borderWidth: 1,
    borderColor: '#9cd02c',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#9cd02c',
    borderRadius: 10,
    padding: 5,
    marginBottom: 5,
  },
  unitButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
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
    color: '#000',
  },
  ingredientList: {
    marginBottom: 10,
  },
  selectedIngredientsList: {
    maxHeight: 100,
    marginBottom: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  ingredientItemSelected: {
    backgroundColor: '#d0f0c0',
  },
  ingredientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
  selectedIngredientItem: {
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedIngredientText: {
    fontSize: 14,
  },
  addCustomButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addCustomButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#808080',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  bottomModal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalIngredient: {
    fontSize: 16,
    marginTop: 5,
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
});

export default OnBoarding_Food;