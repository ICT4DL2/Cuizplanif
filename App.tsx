import * as React from 'react';
import { View, Text, Button } from 'react-native';
import {
  NavigationContainer,
  DrawerActions,
  ParamListBase,
  NavigationProp,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnBoarding_Famille from './src/screens/OnBoarding_Famille';
import TableNourriture from './src/screens/OnBoarding_Food';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnBoarding_Food from './src/screens/OnBoarding_Food';
import OnBoardingFinal from './src/screens/OnBoardingFinal';



const SignupScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Signup Screen</Text>
  </View>
);

function Notifications() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notifications Screen</Text>
    </View>
  );
}

// 🔹 Drawer custom avec typage des props
function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Fermer le menu"
        onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}
      />
      <DrawerItem
        label="Basculer le menu"
        onPress={() => props.navigation.dispatch(DrawerActions.toggleDrawer())}
      />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Drawer Navigator pour les écrans avec menu latéral
function MyDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="DashBoard" component={DashboardScreen} />
      <Drawer.Screen name="Paramètres" component={SettingsScreen} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="Famille" component={OnBoarding_Famille} />
      <Drawer.Screen name="Nourriture" component={TableNourriture} />
    </Drawer.Navigator>
  );
}

// Stack Navigator pour la navigation globale
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