const express = require('express');
const fs = require('fs/promises');
const app = express();
app.use(express.json());

let storedRFID = ""; 

// Funzione per svuotare i campi dei file specificati
async function svuotaFile() {
    try {
        await Promise.all([
            fs.writeFile('my-electron-app/outcerca.json', ''),
            fs.writeFile('my-electron-app/outinteragisci.json', ''),
            fs.writeFile('my-electron-app/RFID.json', ''),
            // Legge il file profile-config.json e svuota i campi appropriati
            fs.readFile('my-electron-app/profile-config.json', 'utf-8')
                .then(configContent => {
                    const configData = JSON.parse(configContent);
                    configData.profileAddress = '';
                    configData.privateKey = '';
                    configData.contractAddress = '';
                    return fs.writeFile('my-electron-app/profile-config.json', JSON.stringify(configData, null, 2));
                })
        ]);
        console.log('Campi dei file svuotati con successo');
    } catch (error) {
        console.error('Errore durante lo svuotamento dei campi dei file:', error);
    }
}

app.post('/receive-data', async (req, res) => {
    console.log('Dati ricevuti:', req.body);
    const rfid = req.body.rfid;

    if (rfid) {
        storedRFID = rfid; // Memorizza l'ID RFID ricevuto

        // Scrivi l'RFID nel file RFID.json
        try {
            await fs.writeFile('my-electron-app/RFID.json', JSON.stringify({ rfid: rfid }));
            console.log('RFID salvato nel file RFID.json');
        } catch (error) {
            console.error('Errore durante il salvataggio dell\'RFID nel file:', error);
        }

        res.status(200).json({ rfid: rfid });
    } else {
        res.status(400).json({ error: "ID RFID non valido" });
    }
});

app.get('/send-data', (req, res) => {
    // Invia l'ID RFID memorizzato come risposta alla richiesta GET
    res.status(200).json({ rfid: storedRFID });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server in ascolto sulla porta ${port}`);
    // Svuota i campi dei file quando il server è in ascolto
    svuotaFile();
});
