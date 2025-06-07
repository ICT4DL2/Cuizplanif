import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-date-picker';
import platData from '../data/plats.json';
import { ScrollView } from 'react-native-gesture-handler';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 60) / 2; // 2 colonnes avec marges

interface Plat {
  id: string;
  nom: string;
  photoUrl: string | null;
}

const ProgrammationScreen = () => {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [selectedPlatId, setSelectedPlatId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const userId = auth().currentUser?.uid;

  // Charger les plats depuis platData (JSON)
  useEffect(() => {
    try {
      const platsData = platData.plats.map((plat) => ({
        id: plat.id,
        nom: plat.nom,
        photoUrl: plat.image || null,
      }));
      setPlats(platsData);
      console.log('Plats chargés depuis JSON:', platsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur chargement plats JSON:', error);
      Alert.alert('Erreur', 'Impossible de charger les plats.');
      setIsLoading(false);
    }
  }, []);

  // Enregistrer une programmation dans Firestore
  const handleSaveProgrammation = async () => {
    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur non authentifié.');
      return;
    }

    if (!selectedPlatId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un plat.');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date.');
      return;
    }

    setIsSaving(true);

    try {
      const selectedPlat = plats.find((plat) => plat.id === selectedPlatId);
      if (!selectedPlat) {
        throw new Error('Plat non trouvé.');
      }

      // Ajouter un document dans 'programmations'
      await firestore().collection('programmations').add({
        IdUser: userId,
        IdPlat: selectedPlatId,
        NomPlat: selectedPlat.nom,
        Date: selectedDate,
        PhotoUrl: selectedPlat.photoUrl || null,
      });

      console.log('Programmation enregistrée:', {
        IdUser: userId,
        IdPlat: selectedPlatId,
        NomPlat: selectedPlat.nom,
        Date: selectedDate,
      });

      Alert.alert('Succès', 'Programmation ajoutée avec succès !');
      setSelectedPlatId(null);
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Erreur enregistrement programmation:', error);
      Alert.alert('Erreur', 'Impossible d’ajouter la programmation.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sélectionner un plat
  const handleSelectPlat = (platId: string) => {
    setSelectedPlatId(platId);
  };

  // Rendre un élément de la liste des plats
  const renderPlatItem = ({ item }: { item: Plat }) => (
    <TouchableOpacity
      style={[
        styles.platCard,
        selectedPlatId === item.id && styles.platCardSelected,
      ]}
      onPress={() => handleSelectPlat(item.id)}
    >
      <Image
        source={
          item.photoUrl
            ? { uri: item.photoUrl }
            : require('../assets/potato.jpeg')
        }
        style={styles.platImage}
      />
      <Text style={styles.platText} numberOfLines={2}>
        {item.nom}
      </Text>
      {selectedPlatId === item.id && (
        <View style={styles.checkIcon}>
          <Feather name="check" size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#d9e4ef', '#ffffff']}
      start={{ x: 0.25, y: 1 }}
      end={{ x: 0.8, y: 0 }}
      style={styles.container}
    >
      <View style={styles.scrollContainer}>
        <Text style={styles.title}>Ajouter une Programmation</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : plats.length === 0 ? (
          <Text style={styles.noPlatsText}>
            Aucun plat disponible. Vérifiez le fichier plats.json.
          </Text>
        ) : (
          <>
            <ScrollView style={{height:SCREEN_HEIGHT/3}}>
              <FlatList
                data={plats}
                keyExtractor={(item) => item.id}
                renderItem={renderPlatItem}
                numColumns={2}
                contentContainerStyle={styles.platList}
              />
            </ScrollView>
            {/* Liste des plats */}


            {/* Sélecteur de date */}
            <View style={styles.inputContainer}>
             
              <View style={styles.datePickerContainer}>
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  mode="date"
                  locale="fr"
                  minimumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            </View>

            {/* Bouton Enregistrer */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveProgrammation}
              disabled={isSaving}
            >
              <Feather name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  platList: {
    paddingBottom: 20,
  },
  platCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    margin: 5,
  },
  platCardSelected: {
    backgroundColor: '#BEF641',
    borderColor: '#739F12',
    borderWidth: 2,
  },
  platImage: {
    width: CARD_SIZE - CARD_SIZE / 4,
    height: CARD_SIZE * 0.6,
    borderRadius: 8,
    marginBottom: 4,
  },
  platText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#739F12',
    borderRadius: 12,
    padding: 4,
  },
  datePickerContainer: {
    marginTop:20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    alignItems: 'center',
  },
  datePicker: {},
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8BC34A',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#a0c466',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  noPlatsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProgrammationScreen;