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
  ActivityIndicator,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-date-picker';
import platData from '../data/plats.json';
import { ScrollView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Plat {
  id: string;
  nom: string;
  photoUrl: string | null;
}

const ProgrammationScreen = () => {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [selectedPlatId, setSelectedPlatId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const userId = auth().currentUser?.uid;

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

  const handleSelectPlat = (platId: string) => {
    setSelectedPlatId(platId);
  };

  const renderPlatItem = ({ item }: { item: Plat }) => (
    <TouchableOpacity
      style={[
        styles.platCard,
        selectedPlatId === item.id && styles.platCardSelected,
      ]}
      onPress={() => handleSelectPlat(item.id)}
      activeOpacity={0.8}
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
          <Feather name="check" size={16} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Ajouter une Programmation</Text>
        <Text style={{marginBottom:7, fontWeight:'bold', color:'grey'}}>Définissez le jour, puis Sélectionner un plat pour ajouter une programmation.</Text>
        <View style={styles.dateSection}>
          <Text style={styles.label}>Date de programmation :</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('fr-FR')}
            </Text>
            <Feather name="calendar" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveProgrammation}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Feather name="check" size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9DD02C" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : plats.length === 0 ? (
          <View style={styles.noPlatsContainer}>
            <Feather name="alert-circle" size={24} color="#777" />
            <Text style={styles.noPlatsText}>
              Aucun plat disponible. Vérifiez le fichier plats.json.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.platSection}>
              <Text style={styles.modalTitle}>Plats</Text>
              <FlatList
                data={plats}
                keyExtractor={(item) => item.id}
                renderItem={renderPlatItem}
                contentContainerStyle={styles.platList}
              />
            </View>



          </>
        )}
      </ScrollView>

      <Modal visible={showDatePicker} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir la date</Text>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              mode="date"
              locale="fr"
              minimumDate={new Date()}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  platSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  platList: {
    paddingVertical: 8,
  },
  platCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH - 32,
    height: 100,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  platCardSelected: {
    backgroundColor: 'rgba(157, 208, 44, 0.1)',
    borderColor: '#9DD02C',
    borderWidth: 2,
  },
  platImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  platText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  checkIcon: {
    backgroundColor: '#9DD02C',
    borderRadius: 12,
    padding: 6,
  },
  dateSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8ECEF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9DD02C',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginBottom: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#B7DD64',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
  },
  noPlatsContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  noPlatsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#9DD02C',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ProgrammationScreen;