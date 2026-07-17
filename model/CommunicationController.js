export default class CommunicationController {
    static BASE_URL = "https://develop.ewlab.di.unimi.it/mc/2425/";

    static async postUser() {
//https://develop.ewlab.di.unimi.it/mc/2425/user
        console.log("postUser chiamata");
        return await CommunicationController.Post('POST', "user");
    }  

    static async postBuyMenu(mid, sid, location) {
//https://develop.ewlab.di.unimi.it/mc/2425/menu/40/buy
        console.log("postBuyMenu chiamata");
        const endpoint = `menu/${mid}/buy`;
        const bodyParams = {
            sid: sid,
            deliveryLocation: location
        };
        
        return await CommunicationController.Post('POST', endpoint, null, bodyParams);
    }

    static async Post(verb, endpoint, queryParams = null, bodyParams = null) { 
        let url = this.BASE_URL + endpoint; 
     
        if (queryParams) {
            const queryString = new URLSearchParams(queryParams).toString();
            url += "?" + queryString;
        }

        console.log("Inviando richiesta " + verb + " a: " + url);
    
        let fetchData = {
            method: verb, headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };
    
        if (bodyParams) {
            fetchData.body = JSON.stringify(bodyParams);
        }
    
        try {
            let httpResponse = await fetch(url, fetchData);
            const status = httpResponse.status;

            if (status == 200) {
                let deserializedObject = await httpResponse.json();
                console.log("ok");
                return deserializedObject;
            } /*else if (status === 204) {
                return { success: true };
            }*/ else if (status === 409) {
                console.log("Ordine già fatto");
                return { error: "Ordine già effettuato" };
            } else {
                const errorText = await httpResponse.text();
                console.error("Errore POST, status:", status);
                console.error("Risposta server:", errorText);
                return null;
            }
        } catch (error) {
            console.error("Errore rete:", error);
            return null;
        }          
    }

    static async putUser(uid, updateUserData) {
//https://develop.ewlab.di.unimi.it/mc/2425/user/44412
        console.log("putUser chiamata con uid: " + uid);
        const endpoint = `user/${uid}`;
        return await CommunicationController.Put('PUT', endpoint, updateUserData); 
    }

    static async Put(verb, endpoint, bodyParams = null) { 
        const url = this.BASE_URL + endpoint; 
        
        console.log("Inviando richiesta " + verb + " a: " + url);
    
        let fetchData = {
            method: verb, headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };
    
        if (bodyParams) {
            fetchData.body = JSON.stringify(bodyParams);
            console.log("Body inviato:", fetchData.body);
            //console.log("fetchData:", fetchData);
        }
    
        try {
            let httpResponse = await fetch(url, fetchData);
            const status = httpResponse.status;

            if (status == 200 || status == 204) {
                console.log("PUT eseguita con successo");

                if (status == 200) {
                    let deserializedObject = await httpResponse.json();                
                    return deserializedObject;
                }
                return { success: true }; //Status 204: ritorno oggetto vuoto o conferma

            } else {
                const errorText = await httpResponse.text(); //messaggio che il server sta inviando
                console.error("Errore PUT, status: ", status);
                console.error("Risposta testuale dal server: ", errorText);
                return {};
            }          
        } catch (error) {
            console.error("Errore rete:", error);
            return null;
        }          
    }

    static async getUser(uid, sid) {
//https://develop.ewlab.di.unimi.it/mc/2425/user/44412?sid=BQoNrTT98NhgZQ69kvq7INoY5g09efIs43oc7rCk15FUpnlx8all2wdfDtgAecGw
        console.log("getUser chiamata con uid: " + uid + " e sid: " + sid);
        const endpoint = `user/${uid}`;
        const queryParams = { sid: sid };
        return await CommunicationController.Get(endpoint, queryParams);
    } 

    static async getMenu(coordinates, sid) {
//https://develop.ewlab.di.unimi.it/mc/2425/menu?lat=37.4220936&lng=-122.083922&sid=xXi1Ut9M6jYEn15XVeT9YdtQ3WmnHVmmuq5hhbt3Kt1HFsV4QoeU9AbAe505CUJD
        console.log("getMenu called");
        const endPoint = `menu`;
        const queryParams = {lat: coordinates.latitude, lng: coordinates.longitude, sid: sid};
        return await CommunicationController.Get(endPoint, queryParams);
    }

    static async getMenuMid(mid, coordinates, sid) {
//https://develop.ewlab.di.unimi.it/mc/2425/menu/40?lat=37.4220936&lng=-122.083922&sid=BQoNrTT98NhgZQ69kvq7INoY5g09efIs43oc7rCk15FUpnlx8all2wdfDtgAecGw
        console.log("getMenuMid called");
        const endPoint = `menu/${mid}`; //mid come parte del path, non come query string (differenza con sopra)
        const queryParams = {lat: coordinates.latitude, lng: coordinates.longitude, sid: sid};
        return await CommunicationController.Get(endPoint, queryParams);
    }

    static async getImage(mid, sid) {
//https://develop.ewlab.di.unimi.it/mc/2425/menu/39/image?sid=xXi1Ut9M6jYEn15XVeT9YdtQ3WmnHVmmuq5hhbt3Kt1HFsV4QoeU9AbAe505CUJD
        console.log("getImage called");
        const endPoint = `menu/${mid}/image`;
        const queryParams = {sid: sid};
        return await CommunicationController.Get(endPoint, queryParams);
    }

    static async getOrder(oid, sid) {
//https://develop.ewlab.di.unimi.it/mc/2425/order/10630?sid=BQoNrTT98NhgZQ69kvq7INoY5g09efIs43oc7rCk15FUpnlx8all2wdfDtgAecGw
        console.log("getOrder called");
        const endPoint = `order/${oid}`;
        const queryParams = {sid: sid};
        return await CommunicationController.Get(endPoint, queryParams);
    }

    static async Get(endpoint, queryParams = null) {
        let url = this.BASE_URL + endpoint; 

        if (queryParams) {  //se ci sono query params
            const queryString = new URLSearchParams(queryParams).toString();
            url += "?" + queryString;
        }

        console.log("Inviando GET a:", url);

        const fetchData = {
            method: 'GET',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
        };

        try {
            const httpResponse = await fetch(url, fetchData);
            const status = httpResponse.status;

            if (status === 200) {
                console.log("GET eseguita con successo");
                const deserializedObject = await httpResponse.json();
                return deserializedObject;
            } else if (status === 404) {
                console.log("Nessun ordine trovato (404)");
                return null; //nessun ordine, caso previsto
            } else {
                const errorText = await httpResponse.text();
                console.error("Errore GET, status:", status);
                console.error("Risposta server:", errorText);
                return {};
            }
        } catch (error) {
            console.error("Errore di rete:", error);
            return null;
        }
    }
}
