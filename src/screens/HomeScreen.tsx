import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import lightColors from '../theme/appColors';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

// Typage pour la navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  function gotoDash(): void {
    navigation.navigate('Drawer');
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.jpg')}
        style={styles.logo}
        
      />
      <View style={{ marginTop: 20 }} >
        <Text style={styles.mainTitle}>
          <Text style={{ color: lightColors.secondaryColor }}>Meal</Text>
          <Text style={{ color: lightColors.mainColor }}>Planner</Text>
        </Text>
        <Text style={styles.subTitle}>Une nouvelle manière de se nourrir</Text>
      </View>

      <View style={{ marginTop: Dimensions.get('window').height / 2 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.mainButton}
        >
          <Text style={styles.mainButtonText}>Commencer maintenant !</Text>
        </TouchableOpacity>
      </View>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    fontFamily:'CircularStd-Medium'
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 35,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Ombre pour Android
    elevation: 5,
  },
  mainTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mainButton: {
    flexDirection: 'row',
    paddingVertical: 13,
    backgroundColor: lightColors.mainColor,
    width: Dimensions.get('window').width - Dimensions.get('window').width / 10,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;