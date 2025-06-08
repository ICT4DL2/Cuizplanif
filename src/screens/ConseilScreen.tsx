import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import DatePicker from 'react-native-date-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { parse, isWithinInterval, set } from 'date-fns';
import { fr } from 'date-fns/locale';
import platsData from '../data/plats.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';

interface Ingredient {
  id: string;
  nom: string;
  image: string;
  prixUnitaire: number;
}

interface Plat {
  id: string;
  nom: string;
  type: string;
  image: string;
  ingredients: {
    id: string;
    quantite: number;
    unite: string;
    commentaire: string;
  }[];
}

interface Programmation {
  id: string;
  IdUser: string;
  IdPlat: string;
  Date: any;
}

interface MenuData {
  platNom: string;
  date: string;
  ingredients: { nom: string; quantite: number; unite: string }[];
}

const NutritionAdvice: React.FC = () => {
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [showDebutPicker, setShowDebutPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);
  const [programmations, setProgrammations] = useState<Programmation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const idUser = auth().currentUser?.uid;
  const plats: Plat[] = platsData.plats;
  const ingredients: Ingredient[] = platsData.ingredients;

  useEffect(() => {
    const fetchProgrammations = async () => {
      setIsLoading(true);
      try {
        if (!idUser) {
          Alert.alert('Erreur', 'Veuillez vous connecter pour continuer.');
          return;
        }
        const snapshot = await firestore()
          .collection('programmations')
          .where('IdUser', '==', idUser)
          .get();

        const data: Programmation[] = snapshot.docs.map(doc => ({
          id: doc.id,
          IdUser: doc.data().IdUser ?? '',
          IdPlat: doc.data().IdPlat ?? '',
          Date: doc.data().Date ?? '',
        }));
        console.log('Programmations récupérées:', data);
        setProgrammations(data);
      } catch (err) {
        console.error('Erreur lors du chargement des programmations:', err);
        Alert.alert('Erreur', `Erreur lors du chargement des programmations: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgrammations();
  }, [idUser]);

  const parseFirestoreDate = (dateInput: any): Date => {
    try {
      if (!dateInput) {
        console.error('Date vide:', dateInput);
        return new Date();
      }
      if (typeof dateInput === 'object' && '_seconds' in dateInput && '_nanoseconds' in dateInput) {
        const timestamp = new Date(dateInput._seconds * 1000 + dateInput._nanoseconds / 1000000);
        if (!isNaN(timestamp.getTime())) {
          return timestamp;
        }
        console.error('Timestamp invalide:', dateInput);
        return new Date();
      }
      const parsedLocalized = parse(dateInput, "d MMMM yyyy 'à' HH:mm:ss 'UTC+2'", new Date(), { locale: fr });
      if (!isNaN(parsedLocalized.getTime())) {
        return parsedLocalized;
      }
      const parsedISO = new Date(dateInput);
      if (!isNaN(parsedISO.getTime())) {
        return parsedISO;
      }
      console.error('Date invalide:', dateInput);
      return new Date();
    } catch (err) {
      console.error('Erreur lors du parsing de la date:', dateInput, err);
      return new Date();
    }
  };

  const generateMenuData = (): MenuData[] => {
    if (!idUser) {
      Alert.alert('Erreur', 'Veuillez vous connecter pour continuer.');
      return [];
    }
    if (dateFin < dateDebut && dateFin.getDate() !== dateDebut.getDate()) {
      Alert.alert('Erreur', 'La date de fin doit être postérieure ou égale à la date de début.');
      return [];
    }
    if (!plats || !ingredients) {
      Alert.alert('Erreur', 'Données plats.json manquantes.');
      return [];
    }

    const periodeStart = set(new Date(dateDebut), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    const periodeEnd = set(new Date(dateFin), { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });

    const programmationsFiltrees = programmations.filter(p => {
      if (!p.Date) {
        console.warn(`Programmation ignorée (date vide): id=${p.id}, IdPlat=${p.IdPlat}`);
        return false;
      }
      const progDate = parseFirestoreDate(p.Date);
      return (
        p.IdUser === idUser &&
        isWithinInterval(progDate, { start: periodeStart, end: periodeEnd })
      );
    });

    const menuData: MenuData[] = programmationsFiltrees
      .map(p => {
        const plat = plats.find(plat => plat.id === p.IdPlat);
        if (!plat) {
          console.log(`Plat non trouvé pour IdPlat: ${p.IdPlat}`);
          return null;
        }
        const platIngredients = plat.ingredients.map(ing => {
          const ingredientRef = ingredients.find(i => i.id === ing.id);
          return {
            nom: ingredientRef?.nom ?? 'Ingrédient inconnu',
            quantite: ing.quantite,
            unite: ing.unite,
          };
        });
        return {
          platNom: plat.nom,
          date: parseFirestoreDate(p.Date).toLocaleDateString('fr-FR'),
          ingredients: platIngredients,
        };
      })
      .filter((data): data is MenuData => data !== null);

    console.log('Données des menus générées:', menuData);
    return menuData;
  };

  const requestAdvice = async () => {
    setIsLoading(true);
    try {
      const menuData = generateMenuData();
      if (menuData.length === 0) {
        Alert.alert('Information', 'Aucun plat trouvé pour la période sélectionnée.');
        setHasGenerated(true);
        return;
      }

      const menuText = menuData
        .map(
          menu =>
            `Plat: ${menu.platNom} (Date: ${menu.date})\n` +
            menu.ingredients
              .map(ing => `- ${ing.nom}: ${ing.quantite} ${ing.unite}`)
              .join('\n'),
        )
        .join('\n\n');

      const prompt = `
Analyse la composition des menus suivants pour une période donnée. Chaque menu est composé de plats avec leurs ingrédients (nom, quantité, unité). Fournis des conseils détaillés sur :
1. **Qualité gastronomique** : Harmonie des saveurs, suggestions pour améliorer les plats.
2. **Quantités** : Adéquation des portions par plat, suggestions d'ajustement.
3. **Équilibre nutritionnel** : Analyse des macronutriments (protéines, glucides, lipides) et micronutriments, recommandations pour une alimentation saine.
Menus :
${menuText}
Réponse en français, formatée en markdown pour une lisibilité claire.
`;

      const apiKey = 'AIzaSyAm6FFl6l4wl3VrPpdGrDMjQzoVOIhB2lQ';
      console.log('Appel API Gemini avec clé:', apiKey.substring(0, 5) + '...');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Erreur API Gemini:', response.status, response.statusText, errorBody);
        throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      const adviceText = result.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Aucun conseil disponible.';
      console.log('Conseils reçus:', adviceText);
      setAdvice(adviceText);
      setHasGenerated(true);
    } catch (err) {
      console.error('Erreur lors de la demande de conseil:', err);
      Alert.alert('Erreur', `Erreur lors de la demande de conseil:`);
      setAdvice('Une erreur est survenue lors de la génération des conseils.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conseil et Nutrition</Text>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Date de début :</Text>
        <TouchableOpacity onPress={() => setShowDebutPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{dateDebut.toLocaleDateString('fr-FR')}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Date de fin :</Text>
        <TouchableOpacity onPress={() => setShowFinPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{dateFin.toLocaleDateString('fr-FR')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDebutPicker} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir la date de début</Text>
            <DatePicker date={dateDebut} onDateChange={setDateDebut} mode="date" locale="fr-FR" />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDebutPicker(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowDebutPicker(false)}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showFinPicker} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir la date de fin</Text>
            <DatePicker date={dateFin} onDateChange={setDateFin} mode="date" locale="fr-FR" />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFinPicker(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowFinPicker(false)}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9DD02C" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={requestAdvice} style={styles.button}>
          <Text style={styles.buttonText}>Demander conseil</Text>
        </TouchableOpacity>
      )}

      {hasGenerated && (
        <ScrollView style={styles.adviceContainer}>
          {advice ? (
            <View style={styles.adviceCard}>
              <Markdown style={markdownStyles}>{advice}</Markdown>
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucun conseil disponible pour la période sélectionnée.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
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
    backgroundColor: '#E8ECEF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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
  button: {
    backgroundColor: '#9DD02C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  adviceContainer: {
    flex: 1,
  },
  adviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 24,
  },
});

const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginVertical: 12,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
  },
  body: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  list_item: {
    fontSize: 16,
    color: '#444',
    marginVertical: 4,
  },
  strong: {
    fontWeight: '600',
  },
});

export default NutritionAdvice;