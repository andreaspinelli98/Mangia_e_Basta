import { StatusBar } from 'expo-status-bar';
import { ScrollView, Image, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGetMenuMid, fetchPostBuyMenu } from '../../viewmodel/AppViewModel';
import * as Location from 'expo-location';
import storageManager from '../../model/StorageManager';
import styles from '../styles';

export default function MenuDetail({ setID, setScreen }) {
    const [lista, setLista] = useState(null);
    const [foto, setFoto] = useState(null);

    const Separator = () => <View style={styles.separator} />; 

    const Button = ({ title, onPress }) => ( 
        <TouchableOpacity onPress={onPress}> 
          <Text style = {styles.text}>{title}</Text> 
        </TouchableOpacity> 
    );

    //Chiamata getMenuMId
    useEffect(() => { 
        handleGetMenuMid();        
    },[]);
    
    const handleGetMenuMid = async () => {
        try {
            const sid = await AsyncStorage.getItem("sid");
            const mid = await AsyncStorage.getItem("mid");

            const location = await Location.getCurrentPositionAsync()
            console.log("Location ricevuta: ", location);

            const data = await fetchGetMenuMid(mid, location.coords, sid);
            console.log("Dati scaricati dal server:", JSON.stringify(data));
            setLista(data);

            await AsyncStorage.setItem("nomeMenu", data.name);
        } catch (error) {
            console.log("Errore: ", error);
        }
    }; 

    //Funzione per recuperare immagine dal DB
    useEffect(() => { 
        loadImage();        
    }, []);

    const loadImage = async () => {
        try {
            const mid = await AsyncStorage.getItem("mid");
            const base64 = await storageManager.getImageSaved(mid);
            if (base64) {
                setFoto(`data:image/jpeg;base64,${base64}`);
            }
        } catch (error) {
            console.log("Errore caricamento immagine:", error);
        }
    };

    //Chiamata getBuyMenu
    const handlePostBuyMenu = async () => {
        const flag = await AsyncStorage.getItem("isProfileComplete");
            
        if (flag !== "true") {
            Alert.alert(
                "Profilo incompleto",
                "Completa il tuo profilo per acquistare un menu."
            );
            return;
        } else {
            console.log("Profilo completato");
        }

        try {
            const mid = await AsyncStorage.getItem("mid");
            const sid = await AsyncStorage.getItem("sid"); 
            
            const location = await Location.getCurrentPositionAsync()
            console.log("Location ricevuta: ", location);
            const locationObj = {
                lat: location.coords.latitude,
                lng: location.coords.longitude
            };

            const data = await fetchPostBuyMenu(mid, sid, locationObj);
            console.log("Dati scaricati dal server:", JSON.stringify(data));
            
            await AsyncStorage.setItem("oid", JSON.stringify(data.oid));


            if (data && data.error == "Ordine già effettuato") {
                Alert.alert("Errore", "Non puoi fare un altro ordine prima della consegna.", [
                    {text: 'OK', onPress: () => console.log("Alert premuto")},
                ]);

            } else if (data) {
                setID("4");
                setScreen("statoConsegna");
            } else {
                Alert.alert("Errore", "Riprova più tardi.", [
                    {text: 'OK', onPress: () => console.log("Alert premuto")},
                ]);
            }
        } catch (error) {
            console.log("Errore: ", error);
        }
    }; 

    if (!lista) {
        return (
            <View style={styles.container}>
                <Text>Caricamento...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}> 
            <StatusBar style="auto" /> 
                <View style={styles.navbar}>
                    <Text style={styles.navbarText}>Dettagli Menu</Text>
                </View>

                <View style={styles.container}> 
                    <Image source={{ uri: foto }} style={{width: "200", height: "200"}}/>
                    <Text style={styles.title}>{lista.name}</Text>
                    <Text>Costo: {lista.price} €</Text>
                    <Text>Descrizione lunga: {lista.longDescription}</Text>
                    <Text>Tempo consegna: {lista.deliveryTime} min</Text>
                </View> 

                <View style={styles.box}>
                    <Button title = "Acquista Menu!" onPress={handlePostBuyMenu} />        
                </View>

            <Separator />
            <View style={styles.row}>
                <View style={styles.box}>
                    <Button title = "Home" onPress={() => {
                        setID("0"); 
                        setScreen("home")
                    }} />            
                </View>

                <View style={styles.box}>
                    <Button title = "Profilo" onPress={() => {
                        setID("1"); 
                        setScreen("profile")
                    }} />            
                </View>
            </View>    
        </ScrollView>
    );
}