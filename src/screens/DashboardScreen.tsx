import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import platData from '../data/plats.json';
import FallbackImage from '../components/FallbackImage';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const days = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const months = [
  { month: 'Janvier', nbrejours: 31 },
  { month: 'Février', nbrejours: 28 },
  { month: 'Mars', nbrejours: 31 },
  { month: 'Avril', nbrejours: 30 },
  { month: 'Mai', nbrejours: 31 },
  { month: 'Juin', nbrejours: 30 },
  { month: 'Juillet', nbrejours: 31 },
  { month: 'Août', nbrejours: 31 },
  { month: 'Septembre', nbrejours: 30 },
  { month: 'Octobre', nbrejours: 31 },
  { month: 'Novembre', nbrejours: 30 },
  { month: 'Décembre', nbrejours: 31 },
];

interface Plat {
  id: string;
  nom: string;
  photoUrl: string | null;
  ingredients: { nom: string; quantite: number; unite: string; prixUnitaire: number }[];
}

interface Programmation {
  id: string;
  date: Date;
  nomPlat: string;
  idPlat: string;
}
interface PlatSelect {
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


interface Banner {
  id: string;
  image: any;
}

const DashboardScreen = () => {
  const [userName, setUserName] = useState('Utilisateur');
  const [favoriteMeals, setFavoriteMeals] = useState<Plat[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<PlatSelect[]>([]);
  const [programmations, setProgrammations] = useState<Programmation[]>([]);
  const [monthIndex, setMonthIndex] = useState(months.findIndex((mois) => mois.month === 'Mai')); // Mai 2025
  const [activeBanner, setActiveBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<FlatList>(null);
  const userId = auth().currentUser?.uid;

  const banners: Banner[] = [
    { id: '1', image: require('../assets/banner.jpeg') },
    { id: '2', image: require('../assets/salad.jpg') },
    { id: '3', image: require('../assets/potato.jpeg') },
  ];

  useEffect(() => {
    if (!userId) {
      console.log('Utilisateur non authentifié');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);

      try {
        //  Charger le nom de l'utilisateur
        const userRef = firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists()) {
          setUserName(userDoc.data()?.fullName || 'Utilisateur');
          console.log('Nom utilisateur chargé:', userDoc.data()?.fullName);
        }

        //  Charger les IDs des plats sélectionnés
        const selectedPlatsSnap = await firestore()
          .collection('families')
          .doc(userId)
          .collection('selectedPlats')
          .get();

        const platIds: string[] = selectedPlatsSnap.docs.map(doc => doc.id);

        // Charger les détails des plats depuis la collection 'plats'
        const selectedPlats = platData.plats.filter(plat => platIds.includes(plat.id));
        const platsSelectionne = selectedPlats.map((pl) => ({
          id: pl.id,
          nom: pl.nom,
          type: pl.type,
          image: pl.image,
          ingredients: pl.ingredients,
        }));
        setSelectedMeals(platsSelectionne);
        //setSelectedPlats(selectedPlats); 
        console.log('Plats sélectionnés chargés:', selectedPlats);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }

      setIsLoading(false);
    };

    loadData();

    // 🔹 Écoute des plats favoris
    const platsUnsubscribe = firestore()
      .collection('plats')
      .where('IdUser', '==', userId)
      .onSnapshot((snapshot) => {
        if (snapshot) {
          const plats = snapshot.docs.map((doc) => ({
            id: doc.id,
            nom: doc.data().NomPlat,
            photoUrl: doc.data().PhotoUrl,
            ingredients: doc.data().Ingredients || [],
          }));
          setFavoriteMeals(plats);
          console.log('Plats favoris chargés:', plats);
        }
      }, (error) => {
        console.error('Erreur chargement plats favoris:', error);
      });

    // 🔹 Auto-scroll du carousel
    const interval = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % banners.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);

    return () => {
      platsUnsubscribe();
      clearInterval(interval);
    };

  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    // Charger les programmations pour le mois sélectionné
    const selectedMonth = months[monthIndex];
    const startOfMonth = new Date(2025, monthIndex, 1);
    const endOfMonth = new Date(2025, monthIndex, selectedMonth.nbrejours);
    const progUnsubscribe = firestore()
      .collection('programmations')
      .where('IdUser', '==', userId)
      .where('Date', '>=', startOfMonth)
      .where('Date', '<=', endOfMonth)
      .onSnapshot((snapshot) => {
        if (snapshot) {
          const progs = snapshot.docs.map((doc) => ({
            id: doc.id,
            date: doc.data().Date.toDate(),
            nomPlat: doc.data().NomPlat,
            idPlat: doc.data().IdPlat,
          }));
          setProgrammations(progs);
          console.log('Programmations chargées:', progs);
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Erreur chargement programmations:', error);
        setIsLoading(false);
      });

    return () => progUnsubscribe();
  }, [userId, monthIndex]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setMonthIndex((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? 11 : prev - 1;
      } else {
        return prev === 11 ? 0 : prev + 1;
      }
    });
  };

  const getWeeklyPlan = () => {
    const selectedMonth = months[monthIndex];
    const weekStart = new Date(2025, monthIndex, 12);
    const weekEnd = new Date(2025, monthIndex, 16);
    return programmations
      .filter((prog) => prog.date >= weekStart && prog.date <= weekEnd)
      .map((prog, index) => ({
        day: `${days[prog.date.getDay() === 0 ? 6 : prog.date.getDay() - 1]} ${prog.date.getDate()}`,
        color: [
          { bg: '#FFD086', text: '#703C00' },
          { bg: '#C3FF41', text: '#3F5214' },
          { bg: '#7FA9F6', text: '#294270' },
          { bg: '#FF6C6C', text: '#6D1B1B' },
          { bg: '#F4FF5E', text: '#67670D' },
        ][index % 5],
        meal: prog.nomPlat,
      }));
  };

  const getActiveDots = () => {
    const selectedMonth = months[monthIndex];
    const dots = Array(selectedMonth.nbrejours).fill(0);
    programmations.forEach((prog) => {
      const day = prog.date.getDate() - 1;
      if (day >= 0 && day < dots.length) {
        dots[day] = 1;
      }
    });
    return dots;
  };

  const getFirstDayOffset = () => {
    const firstDay = new Date(2025, monthIndex, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Ajuster pour commencer par lundi
  };

  const selectedMonth = months[monthIndex];
  const activeDots = getActiveDots();
  const weeklyPlan = getWeeklyPlan();
  const weeks = Array(Math.ceil((selectedMonth.nbrejours + getFirstDayOffset()) / 7)).fill(0);
  const firstDayOffset = getFirstDayOffset();

  const renderBannerItem = ({ item }: { item: Banner }) => (
    <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
  );

  return (
    <LinearGradient
      colors={['#d9e4ef', '#ffffff']}
      start={{ x: 0.25, y: 1 }}
      end={{ x: 0.8, y: 0 }}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.greeting}>
          Hello, <Text style={styles.name}>{userName}</Text>
        </Text>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveBanner(index);
            }}
            scrollEventThrottle={16}
          />
          <View style={styles.carouselDots}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeBanner ? styles.activeDot : null]}
              />
            ))}
          </View>
        </View>

        {/* Monthly Planning */}
        <Text style={styles.sectionTitle}>Planification mensuelle</Text>
        <View style={styles.calendar}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Feather name="chevron-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{selectedMonth.month} 2025</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Feather name="chevron-right" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.dayHeader}>
            {days.map((day, i) => (
              <Text key={i} style={styles.day}>{day}</Text>
            ))}
          </View>
          {weeks.map((_, weekIndex) => (
            <View key={weekIndex} style={styles.row}>
              {days.map((_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex - firstDayOffset + 1;
                if (dayNumber <= 0 || dayNumber > selectedMonth.nbrejours) {
                  return <View key={dayIndex} style={styles.dayCell} />;
                }
                return (
                  <View key={dayIndex} style={styles.dayCell}>
                    <Text>{dayNumber}</Text>
                    <View
                      style={[
                        styles.dot,
                        activeDots[dayNumber - 1] ? styles.activeDot : null,
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Weekly Planning */}
        <Text style={styles.sectionTitle}>Planification hebdomadaire</Text>
        {isLoading ? (
          <Text style={styles.noMealsText}>Chargement...</Text>
        ) : weeklyPlan.length === 0 ? (
          <Text style={styles.noMealsText}>Aucune programmation pour cette semaine.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.weeklyPlan, { gap: 10 }]}>
              {weeklyPlan.map((item, index) => (
                <View
                  key={index}
                  style={[styles.weeklyItem, { backgroundColor: item.color.bg }]}
                >
                  <Text style={{ fontWeight: '700', fontSize: 16, color: item.color.text }}>
                    {item.day}
                  </Text>
                  <Text style={{ fontSize: 14, color: item.color.text }}>
                    {item.meal}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Favorite Meals */}
        <Text style={styles.sectionTitle}>Mes Plats Favoris</Text>
        {isLoading ? (
          <Text style={styles.noMealsText}>Chargement...</Text>
        ) : selectedMeals.length === 0 ? (
          <Text style={styles.noMealsText}>Aucun plat favori pour le moment.</Text>
        ) :
          <ScrollView style={{height:SCREEN_HEIGHT/3}}>
            <FlatList
              data={selectedMeals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.mealCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {/* Afficher la photo si elle existe */}
                    <FallbackImage
                      source={{ uri: item.image }}
                      fallbackSource={require('../assets/default_ingredient.png')}
                      style={styles.mealImage}
                    />
                    <View>
                      <Text style={styles.mealName}>{item.nom}</Text>
                      <Text style={styles.mealPrice}>
                        Plat {item.type}
                      </Text>
                    </View>
                  </View>


                  <View style={styles.heartContainer}>
                    <Feather name="heart" color="red" size={20} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        }
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    padding: 10,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
  },
  name: {
    color: 'green',
  },
  carouselContainer: {
    marginVertical: 12,
  },
  carouselImage: {
    width: SCREEN_WIDTH - 20,
    height: 120,
    borderRadius: 16,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  calendar: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 5,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthText: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    justifyContent: 'space-between',
  },
  day: {
    width: (SCREEN_WIDTH - 44) / 7,
    fontSize: 14,
    textAlign: 'center',
  },
  dayCell: {
    width: (SCREEN_WIDTH - 44) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginTop: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  weeklyPlan: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  weeklyItem: {
    borderRadius: 12,
    padding: 8,
    width: 85,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  mealName: {
    fontWeight: '600',
    fontSize: 14,
  },
  mealPrice: {
    color: 'green',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  noMealsText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default DashboardScreen;