import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from "react";
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPutUser, fetchGetUser } from '../../viewmodel/AppViewModel';

export default function Profile({ setID, setScreen }) { //setScreen viene passato come prop al componente Profilo
    const [nome, setNome] = useState(null);
    const [cognome, setCognome] = useState(null);
    const [nomeCompleto, setNomeCompleto] = useState(null);
    const [numCarta, setNumCarta] = useState(null);
    const [meseScad, setMeseScad] = useState(null);
    const [annoScad, setAnnoScad] = useState(null);
    const [cvc, setCVC] = useState(null);
    const [oid, setUltimoOrdine] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);

    const Separator = () => <View style={styles.separator} />; 
    const Button = ({ title, onPress }) => ( 
        <TouchableOpacity onPress={onPress}> 
          <Text style = {styles.text}>{title}</Text> 
        </TouchableOpacity> 
    );

    //Chiamata getUser
    useEffect(() => { 
        handleGetUser();
    }, []);
    
    const handleGetUser = async () => {
        try {    
            const storedUid = await AsyncStorage.getItem("uid");
            const storedSid = await AsyncStorage.getItem("sid");
            
            const userData = await fetchGetUser(storedUid, storedSid);
            console.log("Dati scaricati dal server:", JSON.stringify(userData));
            
            setNome(userData.firstName);
            setCognome(userData.lastName);
            setNomeCompleto(userData.cardFullName);
            setNumCarta(userData.cardNumber);
            setMeseScad(userData.cardExpireMonth.toString());//mostra i numeri dentro gli input, che accettano solo stringhe.
            setAnnoScad(userData.cardExpireYear.toString());
            setCVC(userData.cardCVV);

            if (userData.lastOid == null) {
                setUltimoOrdine("Nessun ordine fatto");
            } else { 
                setUltimoOrdine(userData.lastOid.toString());
            }

            if (userData.orderStatus == null) {
                setOrderStatus(""); 
                await AsyncStorage.setItem("orderStatus", ""); //stringa vuota per non aspettare la fine di setOrderStatus
            } else {
                setOrderStatus(userData.orderStatus);
                await AsyncStorage.setItem("orderStatus", userData.orderStatus);
            }                
    
            if (userData) {
                Alert.alert("Avviso", "Dati scaricati correttamente!", [
                    {text: 'OK', onPress: () => console.log('Alert premuto')},
                ]);
            } else {
                Alert.alert("Errore", "Impossibile scaricare i dati.", [
                    {text: 'OK', onPress: () => console.log('Alert premuto')},
                ]);
            }

        } catch(error) {
            console.log("Errore: " + error);
        };
    }
    
    //Chiamata putUser
    const handlePut = async () => { //costruisco un oggetto con i dati utente e lo passo come parametro a fetchUID
        console.log("bottone premuto"); 
        await AsyncStorage.setItem("isProfileComplete", "false");
        const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome);
        const cognomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(cognome);
        
        if ( nome == '' || cognome == '' || nomeCompleto == '' || numCarta == '' || meseScad == '' ||
             annoScad == '' || cvc == '') {
            Alert.alert("Errore", "Il campo non può essere vuoto.", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return;  //blocca l'invio
        }

        if (!nomeValido) {
            Alert.alert("Errore", "Nome può contenere solo lettere e spazi.", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return;
        }

        if (!cognomeValido) {
            Alert.alert("Errore", "Cognome può contenere solo lettere e spazi.", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return; 
        } 

        if (numCarta.length < 16)  {
            Alert.alert("Errore", "La carta deve avere 16 cifre.", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return; 
        } 
        
        if (parseInt(meseScad) < 1 || parseInt(meseScad) > 12)  {
            Alert.alert("Errore", "Inserire mese valido (es: 03).", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return; 
        }

        if (parseInt(annoScad) < 2025)  {
            Alert.alert("Errore", "Inserire anno valido (es: 2026).", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return; 
        }

        if (cvc.length < 3)  {
            Alert.alert("Errore", "Il codice di verifica della carta deve essere di 3 cifre.", [
                {text: 'OK', onPress: () => console.log('Alert premuto')},
            ]);
            return; 
        } 

        try {    
            const storedUid = await AsyncStorage.getItem("uid"); //usare asyncstorage per passare uid/sid
            const storedSid = await AsyncStorage.getItem("sid");
            
            const updateUserData = {
                firstName: nome,
                lastName: cognome,
                cardFullName: nomeCompleto,
                cardNumber: numCarta,
                cardExpireMonth: parseInt(meseScad), //casting se server vuole interi e non stringhe
                cardExpireYear: parseInt(annoScad),
                cardCVV: cvc,
                sid: storedSid //server vuole sid nel body anche se utente non lo inserisce
            };
            //console.log("updateUserData:", updateUserData);
            console.log("Dati inviati al server:", JSON.stringify(updateUserData));
            const response = await fetchPutUser(storedUid, updateUserData);
    
            if (response !== null && response !== undefined && response.success == true) {
                Alert.alert("Avviso", "Dati aggiornati correttamente!", [
                    {text: 'OK', onPress: () => console.log("Alert premuto")},
                ]);
                await AsyncStorage.setItem("isProfileComplete", "true");
                console.log("Profilo completato");
            } else {
                Alert.alert("Errore", "Impossibile aggiornare i dati.", [
                    {text: 'OK', onPress: () => console.log("Alert premuto")},
                ]);
                await AsyncStorage.setItem("isProfileComplete", "false");
                console.log("Profilo non completato");
            }

        } catch(error) {
            console.log("Errore: " + error);
        };
    }

    return (
        <ScrollView contentContainerStyle={styles.container}> {/*obbligatorio usare contentContainerStyle con scrollview*/}
            <StatusBar style="auto" /> 
                <View style={styles.navbar}>
                    <Text style={styles.navbarText}>Profilo</Text>
                </View>
            
            <View >
                <Text style={styles.title}>Dati personali</Text>
                <View style={styles.row}>
                    <Text>Nome:</Text>
                    <TextInput style={styles.input} onChangeText={setNome} value={nome} maxLength={15}/>
                </View>
                <View style={styles.row}>
                    <Text>Cognome:</Text>
                    <TextInput style={styles.input} onChangeText={setCognome} value={cognome} maxLength={15} />
                </View>
                <Separator /> 
            
                <Text style={styles.title}>Dati carta di credito</Text>
                <View style={styles.row}>
                    <Text>Nome completo:</Text>
                    <TextInput style={styles.input} onChangeText={setNomeCompleto} value={nomeCompleto} 
                    maxLength={31}/>
                </View>
                        
                <View style={styles.row}>
                    <Text>Numero carta:</Text>
                    <TextInput style={styles.input} onChangeText={setNumCarta} value={numCarta} 
                    keyboardType='numeric' maxLength={16}/>
                </View>

                <View style={styles.row}>
                    <Text>Mese di scadenza:</Text>
                    <TextInput style={styles.input} onChangeText={setMeseScad} value={meseScad} keyboardType='numeric'
                     maxLength={2}/>
                </View>

                <View style={styles.row}>
                    <Text>Anno di scadenza:</Text>
                    <TextInput style={styles.input} onChangeText={setAnnoScad} value={annoScad} keyboardType='numeric'
                     maxLength={4}/>
                </View>
                            
                <View style={styles.row}>
                    <Text>CVC:</Text>
                    <TextInput style={styles.input} onChangeText={setCVC} value={cvc} keyboardType='numeric' 
                    maxLength={3}/>
                </View>
                <Separator /> 
                
                <View style={styles.row}>
                    <Text>Ultimo ordine:</Text>
                    <TextInput style={styles.input} onChangeText={setUltimoOrdine} value={oid} editable={false}/>
                    {/*editable={false}: utente non può scrivere */}
                </View>
            </View>   
            
            <View style={styles.row}>
                <View style={styles.box}>
                    <Button title = "Home" onPress={() => {
                        setID("0");  //reset id a "0" quando ritorni alla home
                        setScreen("home")
                    }} />            
                </View>
                <View style={styles.box}>
                    <Button title = "Salva!" onPress={handlePut} /> 
                    {/*appare Alert che informa utente del risultato*/}           
                </View>
            </View>           
        </ScrollView>
    );
}
