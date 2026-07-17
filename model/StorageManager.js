import * as SQLite from 'expo-sqlite';

class StorageManager {
    constructor() {
        this.db = null;
    }
    
    async openDB() {
        this.db = await SQLite.openDatabaseAsync('imageDB'); 
        //const query0= "DROP TABLE Images"; 
        const query = "CREATE TABLE IF NOT EXISTS Images (ID INTEGER PRIMARY KEY AUTOINCREMENT, mid TEXT UNIQUE, stringa TEXT);";
        //await this.db.execAsync(query0);
        await this.db.execAsync(query);
    }
       
    async saveImage(mid, stringa) {
        //await this.db.execAsync("DELETE FROM Images"); //elimina tutte immagini
        const query = "INSERT OR REPLACE INTO Images (mid, stringa) VALUES (?, ?);"; 
        await this.db.runAsync(query, mid, stringa);
    }
   
    async getImageSaved(mid) {
        const query = "SELECT stringa FROM Images WHERE mid = ?";
        const result = await this.db.getFirstAsync(query, mid);
   
        //se result esiste e ha il campo stringa, allora lo ritorna, altrimenti restituisce null
        if (result && result.stringa) {
            return result.stringa;
        } else {
            return null;
        }    
    }   
}

//singleton
const storageManager = new StorageManager();
export default storageManager;