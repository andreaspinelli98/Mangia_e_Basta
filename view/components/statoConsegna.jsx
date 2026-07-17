import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
//MapView è il default export — non metterlo tra { }. Marker invece è named.
import MapView, { Marker } from 'react-native-maps';
import styles from '../styles';
import { fetchGetOrder } from '../../viewmodel/AppViewModel';

export default function StatoConsegna({ setID, setScreen }) {
    const [ordine, setOrdine] = useState("");
    const [nomeMenu, setNomeMenu] = useState("");
    const [stato, setStato] = useState("");
    const [ora, setOra] = useState("");

    const mapRef = useRef(null);
    const Separator = () => <View style={styles.separator} />; 

    const Button = ({ title, onPress }) => ( 
        <TouchableOpacity onPress={onPress}> 
          <Text style = {styles.text}>{title}</Text> 
        </TouchableOpacity> 
    );

    //polling: aggiorna i dati ogni 5 secondi
    useEffect (() => {
        getOrder();
    }, []);

    useEffect(() => {
        let intervalId;
        if (ordine?.status === "ON_DELIVERY") {
            intervalId = setInterval(() => {
            getOrder();
            }, 5000);
        }

        //pulizia
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
        /*Appena lo stato cambia (COMPLETED), lo useEffect si riesegue, vede che non è più ON_DELIVERY e 
        pulisce l’intervallo. Quindi ferma il polling*/
    }, [[ordine?.status]]);

    const getOrder = async () => {
        try {
            const oid = await AsyncStorage.getItem("oid");
            const sid = await AsyncStorage.getItem("sid");

            const data = await fetchGetOrder(oid, sid);

            if (data) {
                console.log("Dati scaricati dal server:", JSON.stringify(data));
                setOrdine(data);

                //ordine
                if (data.status === "ON_DELIVERY") {
                    setStato("In consegna");
                } else if (data.status === "COMPLETED") {
                    setStato("Consegnato");
                } 

                //orario
                if (data.expectedDeliveryTimestamp) {
                    setOra(new Date(data.expectedDeliveryTimestamp).toLocaleTimeString());
                } else if (ordine.deliveryTimestamp) {
                    setOra(new Date(data.deliveryTimestamp).toLocaleTimeString());
                } 

                //nome menu
                const name = await AsyncStorage.getItem("nomeMenu");
                if (name) {
                    setNomeMenu(name); 
                }
            } else {
                console.log("Dati scaricati dal server:", JSON.stringify(data));                
                setOrdine(null); 
                setNomeMenu("");
                setStato("");
                setOra("");
            }
        } catch (error) {
            console.log("Errore:", error);
        }
    };

    //centra la mappa sul punto di consegna
    useEffect(() => {
        if (ordine?.deliveryLocation) {
            const { lat, lng } = ordine.deliveryLocation; //ordine fatto in via celoria 18
      
            mapRef.current?.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 500); // durata in ms
        }
    }, [ordine]);

    return (
        <ScrollView contentContainerStyle={styles.container}> 
            <StatusBar style="auto" /> 
                <View style={styles.navbar}>
                    <Text style={styles.navbarText}>Stato Consegna</Text>
                </View>

            {stato ? (
                <View>
                    <Text>Menù: {nomeMenu}</Text>
                    <Text>Stato: {stato}</Text>
                    <Text>Ora: {ora}</Text>
                <Separator />
                </View> 
            ) : ( 
                <View style={{ marginVertical: 10 }}>
                    <Text>Nessun ordine attivo</Text>
                <Separator />
                </View>
            )}

            <View>
                <MapView ref={mapRef} style={styles.map} showsUserLocation={true} initialRegion={{
                    latitude: 45.4685017, //Milano
                    longitude: 9.1824017,
                    //zoom mappa
                    latitudeDelta: 0.005, //più il valore è piccolo, maggiore è lo zoom lungo l'asse verticale (lat)
                    longitudeDelta: 0.005, //più il valore è piccolo, maggiore è lo zoom lungo l'asse orizzontale (long)
                }}>    

                {/*stato ON_DELIVERY: 2 marker */}
                {ordine?.status === "ON_DELIVERY" && (
                    <>
                        <Marker coordinate={{
                            latitude: ordine.deliveryLocation.lat,
                            longitude: ordine.deliveryLocation.lng,
                        }} title="Destinazione" pinColor="blue" />

                        <Marker coordinate={{
                            latitude: ordine.currentPosition.lat,
                            longitude: ordine.currentPosition.lng,
                        }} title="Drone" pinColor="red"/>
                    </>
                )}

                {/*stato COMPLETED: solo punto consegna */}
                {ordine?.status === "COMPLETED" && (
                    <Marker coordinate={{
                        latitude: ordine.deliveryLocation.lat,
                        longitude: ordine.deliveryLocation.lng,
                    }} title="Consegna completata" pinColor="green"/>
                )}
                </MapView>
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