import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Modal, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { parse, isWithinInterval, set } from 'date-fns';
import { fr } from 'date-fns/locale';
import platsData from '../data/plats.json';
import Clipboard from '@react-native-clipboard/clipboard'; // Ajout de Clipboard

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
  idUser: string;
  idPlat: string;
  date: any; // Supporte chaîne ou Timestamp
}

interface ShoppingItem {
  id: string;
  nom: string;
  unite: string;
  quantiteTotale: number;
  prixUnitaire: number;
}

const ShoppingListGenerator: React.FC = () => {
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [showDebutPicker, setShowDebutPicker] = useState(false); // Corrigé à false
  const [showFinPicker, setShowFinPicker] = useState(false); // Corrigé à false
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [programmations, setProgrammations] = useState<Programmation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const idUser = auth().currentUser?.uid;
  const plats: Plat[] = platsData.plats;
  const ingredients: Ingredient[] = platsData.ingredients;

  useEffect(() => {
    console.log('Plats chargés:', plats);
    console.log('Ingrédients chargés:', ingredients);

    const fetchProgrammations = async () => {
      setIsLoading(true);
      try {
        if (!idUser) {
          console.log('Erreur : Utilisateur non connecté');
          Alert.alert('Erreur', 'Veuillez vous connecter pour continuer.');
          return;
        }
        console.log('Récupération des programmations pour idUser:', idUser);
        const snapshot = await firestore()
          .collection('programmations')
          .where('IdUser', '==', idUser)
          .get();

        const data: Programmation[] = snapshot.docs.map(doc => ({
          id: doc.id,
          idUser: doc.data().IdUser ?? '',
          idPlat: doc.data().IdPlat ?? '', // Corrigé : idPlat au lieu de IdPlat
          date: doc.data().Date ?? '', // Corrigé : date au lieu de Date
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

  const generateShoppingList = () => {
    console.log('=== Génération de la liste de courses ===');
    console.log('idUser:', idUser);
    if (!idUser) {
      console.log('Erreur : Utilisateur non connecté');
      Alert.alert('Erreur', 'Veuillez vous connecter pour continuer.');
      return;
    }
    if (dateFin < dateDebut) {
      if (dateFin.getDate() !== dateDebut.getDate()) { // Corrigé : getDate()
        Alert.alert('Erreur', 'La date de fin doit être postérieure ou égale à la date de début.');
        return;
      }
    }
    if (!plats || !ingredients) {
      console.log('Erreur : Données plats.json manquantes');
      Alert.alert('Erreur', 'Données de plats manquantes.');
      return;
    }

    const periodeStart = set(new Date(dateDebut), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    const periodeEnd = set(new Date(dateFin), { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
    console.log('Période start:', periodeStart.toISOString());
    console.log('Période end:', periodeEnd.toISOString());

    const programmationsFiltrees = programmations.filter(p => {
      if (!p.date) {
        console.warn(`Programmation ignorée (date vide): id=${p.id}, idPlat=${p.idPlat}`);
        return false;
      }
      const progDate = parseFirestoreDate(p.date);
      console.log(`Vérification date ${JSON.stringify(p.date)} (parsed: ${progDate}) pour idPlat ${p.idPlat}`);
      return (
        p.idUser === idUser &&
        isWithinInterval(progDate, { start: periodeStart, end: periodeEnd })
      );
    });
    console.log('Programmations filtrées:', programmationsFiltrees);

    const platsProgrammes = programmationsFiltrees
      .map(p => {
        const plat = plats.find(plat => plat.id === p.idPlat);
        if (!plat) {
          console.log(`Plat non trouvé pour idPlat: ${p.idPlat}`);
        }
        return plat;
      })
      .filter((p): p is Plat => p !== undefined);
    console.log('Plats programmés:', platsProgrammes);

    if (platsProgrammes.length === 0) {
      console.log('Aucun plat trouvé pour les programmations filtrées');
      Alert.alert('Information', 'Aucun plat trouvé pour la période sélectionnée.');
    }

    const agregat = new Map<string, ShoppingItem>();

    platsProgrammes.forEach(plat => {
      plat.ingredients.forEach(ing => {
        const ingredientRef = ingredients.find(i => i.id === ing.id);
        if (!ingredientRef) {
          console.log(`Ingrédient non trouvé pour id: ${ing.id}`);
          return;
        }
        console.log(`Ajout ingrédient: ${ingredientRef.nom}, quantite: ${ing.quantite} ${ing.unite}, prix unitaire: ${ingredientRef.prixUnitaire} FCFA, total: ${ing.quantite * ingredientRef.prixUnitaire} FCFA`);

        const key = `${ing.id}-${ing.unite}`;
        const existing = agregat.get(key);

        if (!existing) {
          agregat.set(key, {
            id: ing.id,
            nom: ingredientRef.nom,
            unite: ing.unite,
            quantiteTotale: ing.quantite,
            prixUnitaire: ingredientRef.prixUnitaire,
          });
        } else {
          existing.quantiteTotale += ing.quantite;
        }
      });
    });

    const newShoppingList = Array.from(agregat.values());
    console.log('Liste de courses générée:', newShoppingList);
    setShoppingList(newShoppingList);
    setHasGenerated(true);
  };

  // Nouvelle fonction pour copier la liste dans le presse-papiers
  const copyToClipboard = () => {
    if (shoppingList.length === 0) {
      Alert.alert('Erreur', 'La liste de courses est vide.');
      return;
    }

    const listText = shoppingList
      .map(item => `- ${item.nom}: ${item.quantiteTotale} ${item.unite} - ${item.prixUnitaire * item.quantiteTotale} FCFA`)
      .join('\n');
    const totalText = `Total: ${total} FCFA`;
    const finalText = `Liste de courses\n${listText}\n${totalText}`;

    Clipboard.setString(finalText);
    Alert.alert('Succès', 'La liste de courses a été copiée dans le presse-papiers.');
  };

  const total = shoppingList.reduce((acc, item) => acc + item.quantiteTotale * item.prixUnitaire, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liste de courses</Text>
      </View>

      <View style={styles.dateSection}>
        <Text>Date de début :</Text>
        <TouchableOpacity onPress={() => setShowDebutPicker(true)} style={styles.dateButton}>
          <Text>{dateDebut.toLocaleDateString('fr-FR')}</Text>
        </TouchableOpacity>

        <Text>Date de fin :</Text>
        <TouchableOpacity onPress={() => setShowFinPicker(true)} style={styles.dateButton}>
          <Text>{dateFin.toLocaleDateString('fr-FR')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDebutPicker} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <DatePicker date={dateDebut} onDateChange={setDateDebut} mode="date" locale="fr-FR" />
          <Button title="OK" onPress={() => setShowDebutPicker(false)} />
        </View>
      </Modal>

      <Modal visible={showFinPicker} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <DatePicker date={dateFin} onDateChange={setDateFin} mode="date" locale="fr-FR" />
          <Button title="OK" onPress={() => setShowFinPicker(false)} />
        </View>
      </Modal>

      {isLoading ? (
        <Text>Chargement...</Text>
      ) : (
        <TouchableOpacity onPress={generateShoppingList} style={styles.button}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>Générer la liste</Text>
        </TouchableOpacity>
      )}

      {hasGenerated && (
        <>
          {shoppingList.length === 0 ? (
            <Text style={styles.emptyText}>Aucun ingrédient trouvé pour la période sélectionnée.</Text>
          ) : (
            <>
              <Text style={styles.title}>Liste Générée</Text>
              <FlatList
                data={shoppingList}
                keyExtractor={item => `${item.id}-${item.unite}`}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={styles.itemName}>{item.nom}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantiteTotale} {item.unite} - {item.prixUnitaire * item.quantiteTotale} FCFA
                    </Text>
                  </View>
                )}
              />
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total : {total} FCFA</Text>
              </View>
              <TouchableOpacity onPress={copyToClipboard} style={styles.button}>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>Copier la liste</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  dateSection: { marginBottom: 20 },
  dateButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  listItem: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#9DD02C',
    alignItems: 'center',
    padding: 14,
    borderRadius: 5,
    borderColor: 'black',
    marginBottom: 15,
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemDetails: { fontSize: 14, color: '#666' },
  totalContainer: { marginTop: 20, alignItems: 'flex-end' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' },
});

export default ShoppingListGenerator;