import React, { useState } from 'react';
import { RadioButton } from 'react-native-paper';
import {
  View,
  Text as RNText,
  TextInput,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  StyleProp,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import lightColors from '../theme/appColors';
import { RootStackParamList } from '../navigation/types';
import auth, { getAuth } from '@react-native-firebase/auth';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface CustomTextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  [key: string]: any;
}

const Text: React.FC<CustomTextProps> = ({ style, ...props }) => {
  return <RNText style={[styles.text, style]} {...props} />;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert('Erreur de connexion', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      Alert.alert('Connexion réussie', 'Vous allez être redirigé.');
      navigation.navigate('FamilyConfig');
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de la connexion.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Cette adresse email est invalide !';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun utilisateur trouvé avec cet email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert('Erreur de connexion', errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.stackNavTitle}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={30} color="#333" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <Text style={styles.title}>Se connecter</Text>
        </View>
        <Text style={styles.subtitle}>Entrez vos informations de connexion</Text>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          style={{ paddingTop: 20 }}
        >
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={{ alignItems: 'center', paddingTop: 50 }}>
            <TouchableOpacity onPress={handleLogin} style={styles.mainButton}>
              <Text style={styles.mainButtonText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={{ fontSize: 18, textAlign: 'center' }}>
                Vous n'avez pas de compte ?{' '}
                <Text style={{ fontSize: 18, color: '#9DD02C' }}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  stackNavTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontFamily: 'CircularStd-Bold',
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: lightColors.secondaryColor,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 20,
    borderColor: lightColors.mainColor,
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 16,
    fontFamily: 'CircularStd-Bold',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
    width: '100%',
    fontWeight: '500',
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  mainButton: {
    flexDirection: 'row',
    paddingVertical: 13,
    backgroundColor: lightColors.mainColor,
    width: Dimensions.get('window').width - Dimensions.get('window').width / 10 - 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;