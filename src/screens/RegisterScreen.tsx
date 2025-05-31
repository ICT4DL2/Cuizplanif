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

// Interface pour typer les props du composant Text
interface CustomTextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  [key: string]: any;
}

// Composant Text personnalisé pour appliquer la police
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

  const handleRegister = () => {
    Keyboard.dismiss();
    if (!fullName || !email || !password || !sexe || !age) {
      Alert.alert('Erreur d\'inscription', 'Veuillez remplir tous les champs.');
      return;
    }
    Alert.alert('Inscription réussie', 'Votre compte a été créé ! Vous pouvez maintenant vous connecter.');
    navigation.navigate('Login');
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
          contentContainerStyle={{ paddingBottom: 50 }} // Ajout pour le contenu
          keyboardShouldPersistTaps="handled" // Gère les interactions tactiles
          style={{ paddingTop: 20 }}>
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
              <RadioButton.Item color='#9DD02C' label="Masculin" value="masculin" />
              <RadioButton.Item color='#9DD02C' label="Féminin" value="feminin" />
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

          <View style={{ alignItems: 'center', paddingBottom:20 }}>
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
    // justifyContent: 'center', // Centre horizontalement l'icône et le texte
    marginBottom: 10,
  },
  text: {
    fontFamily: 'CircularStd-Bold', // Police appliquée à tous les Text
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: lightColors.secondaryColor, // Utilise la couleur du thème
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    width: '100%', // Aligné avec les labels
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 20,
    borderColor: lightColors.mainColor, // Utilise la couleur du thème
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
    width: Dimensions.get('window').width - Dimensions.get('window').width / 10 - 40, // Ajusté pour le padding
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