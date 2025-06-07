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
import { createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface CustomTextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  [key: string]: any;
}

const Text: React.FC<CustomTextProps> = ({ style, ...props }) => {
  return <RNText style={[styles.text, style]} {...props} />;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('masculin');
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!fullName || !email || !password || !sexe || !age) {
      Alert.alert('Erreur d\'inscription', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const userId = userCredential.user.uid;
      await firestore().collection('users').doc(userId).set({
        fullName,
        email,
        age: parseInt(age),
        sexe,
      });
      Alert.alert('Inscription réussie', 'Votre compte a été créé ! Vous allez être redirigé.');
      navigation.navigate('FamilyConfig');
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Cette adresse email est invalide !';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé !';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert('Erreur d\'inscription', errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.stackNavTitle}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={30} color="#333" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
        </View>
        <Text style={styles.subtitle}>Veuillez renseigner vos informations</Text>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          style={{ paddingTop: 20 }}
        >
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={fullName}
            onChangeText={setFullName}
          />

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

          <Text style={styles.label}>Sexe</Text>
          <RadioButton.Group onValueChange={setSexe} value={sexe}>
            <View style={styles.radio}>
              <RadioButton.Item color="#9DD02C" label="Masculin" value="masculin" />
              <RadioButton.Item color="#9DD02C" label="Féminin" value="feminin" />
            </View>
          </RadioButton.Group>

          <Text style={styles.label}>Âge</Text>
          <TextInput
            style={styles.input}
            placeholder="Âge"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            <TouchableOpacity onPress={handleRegister} style={styles.mainButton}>
              <Text style={styles.mainButtonText}>Créer mon compte</Text>
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

export default RegisterScreen;