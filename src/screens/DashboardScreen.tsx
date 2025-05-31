import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
const days = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const months = [
  { month: 'Janvier', nbrejours: 31 },
  { month: 'Février', nbrejours: 28 },
  { month: 'Mars', nbrejours: 30 },
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
let selectedMonth = months.find((mois) => mois.month == "Mai");
if (!selectedMonth) selectedMonth = { month: 'Décembre', nbrejours: 31 };
const weeks = Array(5).fill(0);
const nbrejours = selectedMonth?.nbrejours;
let activeDots : number[] = Array.from({length: nbrejours}, ()=>Math.random());
console.log(activeDots);
const weeklyPlan = [
  { day: 'MER 12', color: { bg: "#FFD086", text: "#703C00" }, meal: 'Riz Frit' },
  { day: 'JEU 13', color: { bg: "#C3FF41", text: "#3F5214" }, meal: 'Salade' },
  { day: 'VEN 14', color: { bg: "#7FA9F6", text: "#294270" }, meal: 'Ndolé' },
  { day: 'SAM 15', color: { bg: "#FF6C6C", text: "#6D1B1B" }, meal: 'Bouillon' },
  { day: 'DIM 16', color: { bg: "#F4FF5E", text: "#67670D" }, meal: 'Okok' },
];

const favoriteMeals = [
  {
    name: 'Fried Cream Potatoes',
    desc: 'Version cheesy',
    price: '2500CFA',
    image: require('../assets/potato.jpeg'),
  },
  {
    name: 'Salade Healthy',
    desc: 'Freshy seasoning',
    price: '1000CFA',
    image: require('../assets/salad.jpg'),
  },
];

const DashboardScreen = () => {
  return (
    <LinearGradient
      colors={['#d9e4ef', '#FFFFFF']}
      start={{ x: 0.8, y: 1 }}
      end={{ x: 0.8, y: 0 }}

    >

      <ScrollView style={styles.container}>
        {/* Header */}
        <Text style={styles.greeting}>
          Hello, <Text style={styles.name}>Yann</Text>
        </Text>

        <Image
          source={require('../assets/banner.jpeg')}
          style={styles.banner}
          resizeMode="cover"
        />

        {/* Monthly Planning */}

        <Text style={styles.sectionTitle}>Planification mensuelle</Text>
        <View style={styles.calendar}>
          <Text style={styles.month}>{selectedMonth?.month} 2025</Text>
          {days.map((day, i) => (
            <View key={i} style={styles.row}>
              
              <Text style={styles.day}>{day}</Text>
              {weeks.map((_, j) => (
                (((j-1) * 7) + i ) > selectedMonth.nbrejours ?
                  <View></View> :
                  <View
                    key={j}
                    style={[
                      styles.dot,
                      activeDots[((j-1) * 7) + i ] ? styles.activeDot : null,
                    ]}
                  ><Text>{activeDots[((j-1) * 7) + i ]}</Text></View>
              ))}
            </View>
          ))}
        </View>

        {/* Weekly Planning */}
        <Text style={styles.sectionTitle}>Planification hebdo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.weeklyPlan, { gap: 10 }]}>
            {weeklyPlan.map((item, index) => (
              <View
                key={index}
                style={[styles.weeklyItem, { backgroundColor: item.color.bg }]}
              >
                <Text style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: item.color.text
                }}>{item.day}</Text>
                <Text style={{
                  fontSize: 14,
                  color: item.color.text
                }}>{item.meal}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Favorite Meals */}
        <Text style={styles.sectionTitle}>Mes Plats Favoris</Text>
        {favoriteMeals.map((meal, index) => (
          <TouchableOpacity key={index} style={styles.mealCard}>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
              <Image source={meal.image} style={styles.mealImage} />
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDesc}>
                  {meal.desc} - <Text style={styles.mealPrice}>{meal.price}</Text>
                </Text>
              </View>

            </View>
            <View style={{ marginRight: 10 }}>
              <Feather
                name="heart"
                color="red"
                size={20}
              />
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginTop: 0,
    padding: 10,
    paddingTop: 10,

  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
  },
  name: {
    color: 'green',
  },
  banner: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    marginVertical: 16,
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
  month: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  day: {
    width: 40,
    fontSize: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  weeklyPlan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  weeklyItem: {
    borderRadius: 12,
    padding: 8,
    width: 85,
    height: 100,
    alignItems: 'center',
  },
  weeklyDay: {
    fontWeight: '700',
    fontSize: 12,
  },
  weeklyMeal: {
    fontSize: 10,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: "space-between",
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
  mealDesc: {
    color: '#555',
    fontSize: 12,
  },
  mealPrice: {
    color: 'green',
    fontWeight: '600',
  },
});

export default DashboardScreen;
