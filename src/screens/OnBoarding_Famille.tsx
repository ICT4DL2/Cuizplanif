import React, { useState, useRef, useEffect } from 'react';
//import Feather from 'react-native-vector-icons';
import Feather from 'react-native-vector-icons/Feather';
//import React, { useState, useRef, useEffect } from 'react';
//import Feather from 'react-native-vector-icons/Feather';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageSourcePropType,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

// Interface pour un membre
interface Member {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo?: ImageSourcePropType; // Simplifié pour utiliser uniquement ImageSourcePropType
}
type FamilyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FamilyConfig'>;

const OnBoarding_Famille: React.FC = () => {
  const [progress, setProgress] = useState<number>(5);
  const progressAnim = useRef(new Animated.Value(5)).current;
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Vous',
      age: 25,
      gender: 'Homme',
      photo: require('../assets/default.jpg'),
    },
    {
      id: '2',
      name: 'Maman',
      age: 45,
      gender: 'Femme',
      photo: require('../assets/default.jpg'),
    },
  ]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const navigation = useNavigation<FamilyScreenNavigationProp>();

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleBack = () => {
    navigation.goBack();
  };

  const selectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.7,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log("L'utilisateur a annulé la sélection");
        } else if (response.errorCode) {
          console.error('Erreur image-picker : ', response.errorMessage);
          Alert.alert('Erreur', "Impossible de sélectionner la photo");
        } else {
          const uri = response.assets && response.assets[0]?.uri;
          if (uri) {
            setPhoto(uri);
          }
        }
      },
    );
  };

  const addMember = () => {
    if (!name.trim() || !age.trim() || !gender.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Erreur', "L'âge doit être un nombre positif");
      return;
    }

    const newMember: Member = {
      id: (members.length + 1).toString(),
      name: name.trim(),
      age: Number(age),
      gender: gender.trim(),
      photo: photo ? { uri: photo } : require('../assets/default.jpg'),
    };

    setMembers([newMember, ...members]);
    resetForm();
  };

  const updateMember = () => {
    if (!name.trim() || !age.trim() || !gender.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Erreur', "L'âge doit être un nombre positif");
      return;
    }
    if (!editingMemberId) return;

    setMembers(members.map(member =>
      member.id === editingMemberId
        ? {
            ...member,
            name: name.trim(),
            age: Number(age),
            gender: gender.trim(),
            photo: photo ? { uri: photo } : require('../assets/default.jpg'),
          }
        : member
    ));
    resetForm();
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const handleEditMember = (member: Member) => {
    setIsEditing(true);
    setEditingMemberId(member.id);
    setName(member.name);
    setAge(member.age.toString());
    setGender(member.gender);
    // Vérifier si photo est un objet avec une propriété uri
    setPhoto(
      member.photo &&
      typeof member.photo === 'object' &&
      'uri' in member.photo &&
      typeof member.photo.uri === 'string'
        ? member.photo.uri
        : null
    );
    setModalVisible(true);
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('');
    setPhoto(null);
    setModalVisible(false);
    setIsEditing(false);
    setEditingMemberId(null);
  };

  const handleNext = () => {
    let newProgress = progress + 20;
    if (newProgress > 100) newProgress = 100;
    setProgress(newProgress);
    navigation.navigate('FoodConfig');
  };

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['25%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#d9e4ef', '#FFFFFF']}
      start={{ x: 0.8, y: 1 }}
      end={{ x: 0.8, y: 0 }}
      locations={[0.3, 0.8]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeContainer}>
        <View style={{flexDirection:"row", alignItems:"center"}}>
          <TouchableOpacity  onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Let’s start</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBarFill, { width: widthInterpolated }]}
          />
        </View>

        <Text style={styles.secondTitle}>Ajoutez les membres de votre famille</Text>

        <FlatList
          style={{ marginTop: 20 }}
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberContainer}>
              <Image source={item.photo} style={styles.memberPhoto} />
              <Text style={styles.memberText}>
                {item.name} {'\n'} {item.age} ans - {item.gender}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleEditMember(item)}>
                  <Feather name="edit" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeMember(item.id)}
                  style={styles.iconButton}
                >
                  <Feather name="trash" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsEditing(false);
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>Ajouter un membre</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Suivant</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => resetForm()}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isEditing ? 'Modifier un membre' : 'Ajouter un membre'}</Text>

              <TextInput
                placeholder="Nom"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                placeholder="Âge"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Sexe"
                value={gender}
                onChangeText={setGender}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={selectPhoto}
                style={[styles.addButton, { backgroundColor: '#2196F3' }]}
              >
                <Text style={styles.addButtonText}>
                  {photo ? 'Modifier la photo' : 'Choisir une photo'}
                </Text>
              </TouchableOpacity>

              {photo && (
                <Image
                  source={{ uri: photo }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                  }}
                />
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: '#4CAF50', flex: 1, marginRight: 10 }]}
                  onPress={isEditing ? updateMember : addMember}
                >
                  <Text style={styles.addButtonText}>Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: '#F44336', flex: 1 }]}
                  onPress={() => resetForm()}
                >
                  <Text style={styles.addButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  safeContainer: { flex: 1, padding: 20 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10, padding: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000'},
  progressBarContainer: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#0066CC',
    borderRadius: 3,
  },
  secondTitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  subtitle: { fontSize: 30, fontWeight: 'bold', color: '#151515', marginTop: 15, paddingLeft: 26 },
  memberContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    borderColor: '#9DD02C',
    borderWidth: 1,
  },
  memberPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  memberText: { flex: 1, fontWeight: 'bold', fontSize: 16, color: '#000' },
  buttonContainer: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    marginLeft: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#9DD02C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 0,
    width: '100%',
  },
  addButtonText: {
    color: '#151515',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#151515',
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000099',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default OnBoarding_Famille;