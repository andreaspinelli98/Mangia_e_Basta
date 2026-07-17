import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, TouchableOpacity} from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchData } from './viewmodel/AppViewModel';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'; 
import storageManager from './model/StorageManager';

import styles from './view/styles'; 
import Profile from './view/components/profile';
import MenuList from './view/components/menuList';
import StatoConsegna from './view/components/statoConsegna';
import MenuDetail from './view/components/menuDetail';

const SCREEN_KEY =  "home";
const ID_KEY =  "0";

export default function App() { 
  const Button = ({ title, onPress }) => ( 
    <TouchableOpacity onPress={onPress}> 
      <Text style = {styles.text}>{title}</Text> 
    </TouchableOpacity> 
  );

  //Gestione sid/uid
  const [deliveryText, setDeliveryText] = useState("Loading data");
  const [sid, setSid] =  useState(null);
  const [uid, setUid] =  useState(null);
  
  //AsyncStorage.removeItem("hasAlreadyRun");
  useEffect(() => { 
    checkFirstRun();
  }, []);

  const checkFirstRun = async () => {
    try {
      const hasAlreadyRun = await AsyncStorage.getItem("hasAlreadyRun");
      const hasAlreadyRunParsed = JSON.parse(hasAlreadyRun);
      
      if (hasAlreadyRunParsed) {
        console.log("Non è il primo avvio", hasAlreadyRunParsed);
        
        const savedSid = await AsyncStorage.getItem("sid");
        const savedUid = await AsyncStorage.getItem("uid");
        setSid(savedSid);
        setUid(savedUid);

        console.log("Letti da disco:", savedSid, savedUid);
        setDeliveryText("Secondo avvio, dati letti da disco");
      } else {
        console.log("Primo avvio");
        await AsyncStorage.setItem("hasAlreadyRun", JSON.stringify(true));
        
        fetchData().then(({ sid, uid }) => {
          console.log("SID: " + sid);
          console.log("UID: " + uid);
          setSid(sid);
          setUid(uid);
          setDeliveryText("Dati ricevuti: SID e UID salvati");
        }).catch((error) => {
          console.log("Errore: " + error);
        });
        
        setDeliveryText("Primo avvio completato");
      }
    } catch (error) {
      console.error('Errore di esecuzione:', error);
      setDeliveryText("Errore");
    }
  };

  //Gestione DB
  useEffect(() => {
    storageManager.openDB().then(() => {  
      console.log('DB opened');
    }).catch((error) => { 
      console.log('Error: ' + error); 
    }); 
  }, []);

  const drizzle = useDrizzleStudio(storageManager.db);

  //Gestione schermate
  const [id, setID] = useState("0"); 
  const [screen, setScreen] = useState(null);
    
  useEffect(() => { //carica la schermata salvata all'avvio
    const loadScreen = async () => {
      const savedScreen = await AsyncStorage.getItem(SCREEN_KEY);
      const savedID = await AsyncStorage.getItem(ID_KEY);
      
      if (savedScreen) {
        setScreen(savedScreen);
      } else {
        setScreen("home");
      }
      
      if (savedID) { 
        setID(savedID);
      } else {
        setID("0");
      }
    };
    loadScreen();
  }, []);

  useEffect(() => {//salva la schermata ogni volta che cambia
    if (screen) {
      AsyncStorage.setItem(SCREEN_KEY, screen);
    }

    if (id) {
      AsyncStorage.setItem(ID_KEY, id);
    }
  }, [screen, id]);

  const handleChiamata = (id) => {
    setID(id)
    switch (id) {
      case "1":
        console.log("Premuto 1");        
        setScreen("profile");
        break;
      case "2":
        console.log("Premuto 2");
        setScreen("menuList");
        break;
      case "3":
        console.log("Premuto 3");
        setScreen("statoConsegna");
        break;
      case "4":
        console.log("Premuto 4");
        setScreen("menuDetail");
        break;
      default:
        console.log("Premuto 0");
        setScreen("home");
        break;
    }
  }

  if (screen === "profile") {
    console.log("passo a profilo con id: " + id); 
    return <Profile setID={setID} setScreen={setScreen} />
  } else if (screen === "menuList") {
    console.log("passo a menuList con id: " + id);
    return <MenuList setID={setID} setScreen={setScreen} />
  } else if (screen === "menuDetail") {
    console.log("passo a menuDetail con id: " + id);
    return <MenuDetail setID={setID} setScreen={setScreen} />
  } else if (screen === "statoConsegna") {
    console.log("passo a statoConsegna con id: " + id);
    return <StatoConsegna setID={setID} setScreen={setScreen} />
  } else {
    console.log("sono nella home con id: " + id);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.navbar}>
          <Text style={styles.navbarText}>Home</Text>
        </View>
        {/*<Text style={styles.text}>sid: {sid}</Text>
        <Text style={styles.text}>uid: {uid}</Text>*/}
        <View>
          <View style={styles.box}>
            <Button title='Profilo' onPress={() => handleChiamata("1")} />
          </View>
  
          <View style={styles.box}>
            <Button title='Ordina un menù' onPress={() => handleChiamata("2")} />
          </View>
  
          <View style={styles.box}>
            <Button title='Il tuo ordine' onPress={() => handleChiamata("3")} />
          </View>
        </View>
      </ScrollView>
    );
  }
}
