import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import React from "react";
import Feather from 'react-native-vector-icons/Feather';

import {
    SafeAreaView,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";


const SettingScreen = () => {
    return (
        <LinearGradient
              colors={['#d9e4ef', '#ffffff']}
              start={{ x: 0.25, y: 1 }}
              end={{ x: 0.8, y: 0 }}
             style={styles.container}
        >
            <View >
                <Text style={styles.title}> Paramètres de l'application</Text>
                <View style={styles.content}>
                    <View >
                        <Image
                            source={require('../assets/default.jpg')}
                            style={{ width: 100, height: 100 }}
                            resizeMode="contain"
                            borderRadius={50}
                        />
                        <Text style={styles.subtile}>Yann Martin</Text>
                    </View>

                    <View style={styles.buttonContainer} >
                        <TouchableOpacity style={styles.buttonLink}>
                            <View style={styles.buttonLinkIconContainer}>
                                <Feather name="user" color="#8BC34A" size={30} />
                            </View>
                            
                            <Text style={styles.btnText}>Mon Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonLink}>
                             <View style={styles.buttonLinkIconContainer}><Feather name="moon" color="#8BC34A" size={30} /></View>
                            
                            <Text style={styles.btnText}>Thème de l'application</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonLink}>
                            <View style={styles.buttonLinkIconContainer}>
                                <Feather name="infos" color="#8BC34A" size={30} />
                            </View>
                            
                            <Text style={styles.btnText}>À Propos</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity style={styles.bottomButton}>
                            <Text style={styles.dangerButton}>Réinitialiser l'application</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

        </LinearGradient>
    );
}

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
        gap:20,
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 30,
        width: '80%',
        elevation: 18,
    },
    buttonLinkIconContainer:{
        width:32,
    },

    btnText: {
        fontSize: 18,
        fontWeight:'500'
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
});

export default SettingScreen;