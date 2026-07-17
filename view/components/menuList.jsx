import { StatusBar } from 'expo-status-bar';
import { Image, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from "react";
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommunicationController from '../../model/CommunicationController';
import { fetchImage, locationPermissionAsync } from '../../viewmodel/AppViewModel';
import storageManager from '../../model/StorageManager';

export default function MenuList({ setID, setScreen }) {
    const [deliveryText, setDeliveryText] = useState("Loading data");
    const [coordinates, setCoordinates] = useState(null);
    const [lista, setLista] = useState(null);
    const [nome3, setNome3] = useState(null);
    const Separator = () => <View style={styles.separator} />; 

    const Button = ({ title, onPress }) => ( 
        <TouchableOpacity onPress={onPress}> 
          <Text style = {styles.text}>{title}</Text> 
        </TouchableOpacity> 
    );

    //Chiamata getMenu
    useEffect(() => { 
        handleGetMenu();
    }, []);
    
    const handleGetMenu = async () => {
        try {
            const coords = await locationPermissionAsync();
            const sid = await AsyncStorage.getItem("sid");
            setCoordinates(coords)
            setDeliveryText("Coordinate ottenute");
            console.log(coordinates);
            console.log(deliveryText);

            const data = await CommunicationController.getMenu(coords, sid);
            setLista(data);
        } catch (error) {
            console.log("Errore: ", error);
        }
    }; 

    //Ottenere immagini    
    const saveImage = async (mid, setFoto) => {
        try {
            const storedSid = await AsyncStorage.getItem("sid");
            const savedImage = await storageManager.getImageSaved(mid);

            if (savedImage) {
                console.log("Immagine già salvata");
                setFoto(savedImage);
            } else {
                const textToShow = await fetchImage(mid, storedSid); //scarica immagine
                
                if (!textToShow || textToShow.startsWith("Errore")) {
                    setDeliveryText("Errore"); //esco subito, così non salvo nulla di sbagliato
                }

                console.log("Scaricata immagine da server");

                await storageManager.saveImage(mid, textToShow); //salva immagine
                console.log("Immagine salvata localmente");

                setFoto(textToShow);
            }
        } catch (error) {
            console.error("Errore nella gestione immagine: ", error);
            setDeliveryText("Errore");
        }
    };
  
    //Creazione menu
    const Item = ({nome, mid, prezzo, descrizioneBreve, tempo}) => { 
        const [foto, setFoto] = useState(null);

        useEffect(() => {
            saveImage(mid, setFoto);
        }, [mid]); //passare mid come prop useEffect(() => {qualcosa}, [mid]);
        
        const immagine = foto ? `data:image/jpeg;base64,${foto}` : null;
        return (
        <View style={styles.itemContainer}>
            <Image source={{ uri: immagine }} style={styles.image}/>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{nome}</Text>
                <Text>Costo: {prezzo} €</Text>
                <Text>Descrizione: {descrizioneBreve}</Text>
                <Text>Tempo consegna: {tempo} min</Text>

                <TouchableOpacity style={{ backgroundColor: 'lightblue', padding: 10, borderRadius: 5, 
                marginTop: 10, width: 150, }}  onPress={async () => {
                    const storedMid = {mid};
                    
                    await AsyncStorage.setItem("mid", JSON.stringify(mid));
                    console.log("Mid salvato: ", storedMid);
                    setID("3");
                    setScreen("menuDetail");
                    console.log("coord: ", coordinates);
                    return <menuDetail setID={setID} setScreen={setScreen}/>
                }}>
                    <Text style={{ textAlign: 'center' }}>Più informazioni</Text>
                </TouchableOpacity>  
            </View>       
        </View>
        );    
    };

 return (       
        <View style={styles.container}>
            <StatusBar style="auto" /> 
                <View style={styles.navbar}>
                    <Text style={styles.navbarText}>Lista Menu</Text>
                </View>

            <FlatList data={lista} keyExtractor={item => item.mid.toString()}//mid è campo univoco da usare qui 
            renderItem={({item}) => <Item 
                nome={item.name} 
                immagine={`data:image/jpeg;base64,${item.fotoBase64}`}
                mid={item.mid}
                prezzo={item.price}
                descrizioneBreve={item.shortDescription}
                tempo={item.deliveryTime}
            />} />

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
        </View>
    );
}