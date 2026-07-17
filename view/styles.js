import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        top: '5%',       
    },
    navbar: {
        width: '100%',
        height: 40,
        backgroundColor: 'lightblue',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5, // Spazio dal contenuto sottostante
    },
    navbarText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 25, 
        fontWeight: 'bold',
        marginBottom: 5,  // Aggiungi spazio sotto il titolo
    },
    text: {
        textAlign: 'center',
        marginVertical: 10,
        color: 'black', 
        fontSize: 25, 
        fontWeight: 'bold', 
        alignItems: 'center',
    },
    box: { //cioè bottoni
        width: 200,
        height: 80,
        backgroundColor: 'lightblue',
        margin: 10,
        justifyContent: 'center',
        borderRadius: 5, //arrotonda angoli
    },
    separator: {
        width: 300,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    input: {
        height: 40, //altezza casella (influenza anche visibilità caratteri inseriti)
        margin: 10, //distanza testo-casella
        borderWidth: 1,
        padding: 10, //grandezza casella
        width: 200, //larghezza casella
        fontSize: 15,
    },
    row: {
        flexDirection: 'row', // Allinea gli elementi orizzontalmente
        alignItems: 'center', // Allinea il testo verticalmente al centro 
        margin: 1, //distanza tra caselle
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10, // Questo è lo spazio a destra dell’immagine
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 10,
        padding: 10,
        borderRadius: 8,
    }, 
    infoContainer: {
        maxWidth: 250,
    },
    map: {
        width: 400,//"100%",
        height: 500,
        borderRadius: 10,
    },
});

export default styles;
