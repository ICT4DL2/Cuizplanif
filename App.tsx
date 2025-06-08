import * as React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  DrawerActions,
  
  useNavigationState,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import DashboardScreen from './src/screens/DashboardScreen';
import OnBoarding_Famille from './src/screens/OnBoarding_Famille';
import OnBoarding_Food from './src/screens/OnBoarding_Food';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnBoardingFinal from './src/screens/OnBoardingFinal';
import ProgrammationScreen from './src/screens/ProgrammationScreen';
import FoodSet from './src/screens/FoodSet';
import FamilySet from './src/screens/FamilySet';
import SettingScreen from './src/screens/SettingScreen';
import ListScreen from './src/screens/ListScreen';
import ConseilScreen from './src/screens/ConseilScreen';
import ShoppingListGenerator from './src/screens/ListScreen';

// Placeholder écrans
const IngredientsScreen = () => (
  <View style={styles.centered}>
    <Text>Écran Mes Ingrédients (À développer)</Text>
  </View>
);


// 🔹 Drawer personnalisé
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [userPhoto, setUserPhoto] = React.useState<string | null>(null);
  const userId = auth().currentUser?.uid;

  const currentRoute = props.state.routeNames[props.state.index];

  React.useEffect(() => {
    if (userId) {
      firestore()
        .collection('users')
        .doc(userId)
        .get()
        .then((doc) => {
          if (doc.exists()) {
            setUserPhoto(doc.data()?.photoUrl || null);
          }
        })
        .catch((error) => {
          console.error('Erreur chargement photo utilisateur:', error);
        });
    }
  }, [userId]);

  const drawerItems = [
    { label: 'Dashboard', icon: 'home', route: 'Dashboard' },
    { label: 'Ma Famille', icon: 'users', route: 'Ma Famille' },
    { label: 'Mes Plats', icon: 'coffee', route: 'Mes Plats' },
    { label: 'Conseil', icon: 'bookmark', route: 'Conseils' },
    { label: 'Programmations', icon: 'calendar', route: 'Programmations' },
    { label: 'Listes du marché', icon: 'list', route: 'Listes' },
    { label: 'Paramètres', icon: 'settings', route: 'Paramètres' },
  ];

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Paramètres')}
          style={styles.userPhotoContainer}
        >
          <Image
            source={
              userPhoto ? { uri: userPhoto } : require('./src/assets/default.jpg')
            }
            style={styles.userPhoto}
          />
        </TouchableOpacity>
      </View>

      {drawerItems.map((item) => (
        <DrawerItem
          key={item.route}
          label={item.label}
          icon={({ color, size }) => (
            <Feather name={item.icon as any} color={color} size={size} />
          )}
          onPress={() => props.navigation.navigate(item.route)}
          focused={currentRoute === item.route}
          activeBackgroundColor="#C2E164"
          activeTintColor="#5D820D"
          inactiveTintColor="black"
        />
      ))}

      <DrawerItem
        label="Fermer le menu"
        icon={({ color, size }) => <Feather name="x" color={color} size={size} />}
        onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}
      />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#739F12',
        drawerActiveBackgroundColor: '#BEF641',
        drawerInactiveTintColor: 'black',
        headerShown: true,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Ma Famille" component={FamilySet} />
      <Drawer.Screen name="Mes Plats" component={FoodSet} />
      <Drawer.Screen name="Conseils" component={ConseilScreen} />
      <Drawer.Screen name="Programmations" component={ProgrammationScreen} />
      <Drawer.Screen name="Listes" component={ShoppingListGenerator} />
      <Drawer.Screen name="Paramètres" component={SettingScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={RegisterScreen} />
        <Stack.Screen name="FamilyConfig" component={OnBoarding_Famille} />
        <Stack.Screen name="FoodConfig" component={OnBoarding_Food} />
        <Stack.Screen name="ConfigurationFinal" component={OnBoardingFinal} />
        <Stack.Screen name="Drawer" component={MyDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhotoContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
