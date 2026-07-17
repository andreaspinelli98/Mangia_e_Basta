import CommunicationController from '../model/CommunicationController';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export async function locationPermissionAsync() {
    let canUseLocation = false;
    const grantedPermission = await Location.getForegroundPermissionsAsync()
  
    if (grantedPermission.status === "granted") {
       canUseLocation = true;
    } else {
       const permissionResponse = await Location.requestForegroundPermissionsAsync()
  
       if (permissionResponse.status === "granted") {
           canUseLocation = true;
       }
    }

    if (canUseLocation) {
       const location = await Location.getCurrentPositionAsync()
       console.log("Location ricevuta: ", location);
       return location.coords;
    } else {
       throw new Error("Permesso posizione non concesso");
    }
}

export async function fetchData() { 
    try {
        const data = await CommunicationController.postUser();
        
        if (data && data.sid && data.uid) {
            await AsyncStorage.setItem("sid", data.sid);
            await AsyncStorage.setItem("uid", data.uid.toString()); //se non è string, da errori
            console.log("SID salvato: " + data.sid);
            console.log("UID salvato: " + data.uid);
            return { sid: data.sid, uid: data.uid }; //restituisco un oggetto
        } else {
            console.log("Errore: Nessun SID o UID ricevuto");
            return null;
        }
    } catch (error) {
        console.error("Errore nella richiesta: " + error);
        return null;
    }
}

export async function fetchPutUser(uid, updateUserData) { 
    try {
        const data = await CommunicationController.putUser(uid, updateUserData);
        
        if (data) {
            console.log("Dati inviati correttamente");
            return data;
        } else {
            console.log("Errore: Nessuna risposta dal server");
            return null;
        }
    } catch (error) {
        console.error("Errore nella richiesta: " + error);
        return null;
    }
}

export async function fetchGetUser(uid, sid) { 
    try {
        const data = await CommunicationController.getUser(uid, sid);

        if (data) {
            console.log("Dati ottenuti correttamente");
            return data;
        } else {
            console.log("Errore: Nessuna risposta dal server");
            return null;
        }
    } catch (error) {
        console.error("Errore nella richiesta: " + error);
        return null;
    }
}

export async function fetchImage(mid, sid) {
   try {
       const data = await CommunicationController.getImage(mid, sid);
       return data.base64; 
   } catch (error) {
       console.log("Errore nella richiesta: " + error);
       return null; 
   }
}

export async function fetchGetMenuMid(mid, coordinates, sid) { 
    try {
        const data = await CommunicationController.getMenuMid(mid, coordinates, sid);

        if (data) {
            console.log("Dati ottenuti correttamente");
            return data;
        } else {
            console.log("Errore: Nessuna risposta dal server");
            return null;
        }
    } catch (error) {
        console.error("Errore nella richiesta: " + error);
        return null;
    }
}

export async function fetchPostBuyMenu(mid, sid, location) {
    try {
    const data = await CommunicationController.postBuyMenu(mid, sid, location); 

        if (data) {
            console.log("Dati ottenuti correttamente");
            return data;
        } else {
            console.log("Errore: Nessuna risposta dal server");
            return null;
        }
    } catch (error) {
        console.error("Errore nella richiesta: " + error);
        return null;
    }
}

export async function fetchGetOrder(oid, sid) {
    try {
        const data = await CommunicationController.getOrder(oid, sid); 
        if (data && Object.keys(data).length > 0) {
            console.log("Dati ottenuti correttamente");
            return data;
        } else {
            console.log("Nessun ordine attivo");
            return null;  
        }
    } catch (error) {
        console.error("Errore nella richiesta: ", error);
        return null;
    }
}