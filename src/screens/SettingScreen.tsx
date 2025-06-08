import React, { useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = require('@gorhom/bottom-sheet').SCREEN_WIDTH;


const SettingScreen = () => {
    const [showAboutModal, setShowAboutModal] = useState(false);
    type SettingNavigationProp = StackNavigationProp<RootStackParamList, 'Setting'>;
    const navigation = useNavigation<SettingNavigationProp>();
    const handleSignOut = async () => {
        try {
            await auth().signOut();
            Alert.alert('Succès', 'Vous êtes déconnecté.');

            navigation.navigate('Login'); 
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            Alert.alert('Erreur', 'Impossible de se déconnecter.');
        }
    };

    return (
        <LinearGradient
            colors={['#d9e4ef', '#ffffff']}
            start={{ x: 0.25, y: 1 }}
            end={{ x: 0.8, y: 0 }}
            style={styles.container}
        >
            <View>
                <Text style={styles.title}>Paramètres de l'application</Text>
                <View style={styles.content}>
                    <View>
                        <Image
                            source={require('../assets/default.jpg')}
                            style={{ width: 100, height: 100, marginBottom: 35 }}
                            resizeMode="contain"
                            borderRadius={50}
                        />

                    </View>
                </View>
                <View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonLink}>
                            <View style={styles.buttonLinkIconContainer}>
                                <Feather name="user" color="#8BC34A" size={30} />
                            </View>
                            <Text style={styles.btnText}>Mon Profil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonLink}>
                            <View style={styles.buttonLinkIconContainer}>
                                <Feather name="moon" color="#8BC34A" size={30} />
                            </View>
                            <Text style={styles.btnText}>Thème de l'application</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonLink}
                            onPress={() => setShowAboutModal(true)}
                        >
                            <View style={styles.buttonLinkIconContainer}>
                                <Feather name="info" color="#8BC34A" size={30} />
                            </View>
                            <Text style={styles.btnText}>À Propos</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity style={styles.bottomButton} onPress={handleSignOut}>
                            <Text style={styles.dangerButton}>Se déconnecter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal visible={showAboutModal} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>À Propos</Text>
                        <TouchableOpacity
                            style={styles.bottomButton}
                            onPress={() => setShowAboutModal(false)}
                        >
                            <Text style={styles.dangerButton}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalText}>
                            {'\n'}# À Propos de l'Application{'\n\n'}
                            **Nom** : Nutrition App{'\n'}
                            **Version** : 1.0.0{'\n'}
                            **Développeur** : Yann Martin{'\n'}
                            **Description** : Une application pour planifier vos repas et obtenir des conseils nutritionnels personnalisés.{'\n\n'}
                            ## Comment utiliser l'application{'\n\n'}
                            ### Programmation{'\n'}
                            1. Accédez à l'écran **Programmation**.{'\n'}
                            2. Sélectionnez un plat dans la liste des repas disponibles (affichés sous forme de cartes rectangulaires avec images circulaires).{'\n'}
                            3. Choisissez une date via le sélecteur de date (bouton avec icône de calendrier).{'\n'}
                            4. Cliquez sur **Enregistrer** pour ajouter la programmation à votre planning.{'\n'}
                            - Vos programmations sont stockées dans Firebase et peuvent être consultées dans l'écran **Conseil**.{'\n\n'}
                            ### Conseil{'\n'}
                            1. Accédez à l'écran **Conseil et Nutrition**.{'\n'}
                            2. Sélectionnez une période (date de début et de fin) pour analyser vos repas programmés.{'\n'}
                            3. Cliquez sur **Demander conseil** pour obtenir des recommandations détaillées sur :{'\n'}
                            - La qualité gastronomique (harmonie des saveurs).{'\n'}
                            - Les quantités (adéquation des portions).{'\n'}
                            - L'équilibre nutritionnel (macronutriments et micronutriments).{'\n'}
                            - Les conseils sont générés par l'API Gemini et affichés en format markdown pour une lecture claire.
                        </Text>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    buttonContainer: {
        width: SCREEN_WIDTH - 20,
        alignItems: 'center'
    },

    bottomButton: {
        marginTop: 70,
        width: SCREEN_WIDTH - 40,

    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'black',
    },
    content: {
        alignItems: 'center',
    },
    containt: {
        flex: 0.5,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        width: '100%',
        padding: 10,
    },

    subtile: {
        fontSize: 22,
        color: '#8BC34A',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 10,
    },

    buttonLink: {
        flexDirection: 'row',
        padding: 15,
        height: 60,
        gap: 20,
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 30,
        width: '90%',
        elevation: 18,
    },
    buttonLinkIconContainer: {
        width: 32,
    },

    btnText: {
        fontSize: 18,
        fontWeight: '500'
    },

    dangerButton: {
        height: 50,
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 15,
        borderRadius: 20,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    modalTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        padding: 15,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
});

export default SettingScreen;