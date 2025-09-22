const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const fs = require('fs');

let win;
let contractAddress;
let profileAddress;
let interagisciWin;
let cercaWin;
let cercaEsistenteWin;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.webContents.on('did-finish-load', () => {
        win.webContents.executeJavaScript(`window.contractAddress = "${contractAddress}"`);
    });

    win.on('closed', () => {
        win = null;
        // Svuota i campi dei file quando tutte le interfacce sono chiuse
        svuotaFile();
    });
}

ipcMain.on('openInteragisciWindow', () => {
    // Crea la finestra di interazione
    interagisciWin = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    interagisciWin.loadFile('interagisci.html');

    interagisciWin.on('closed', () => {
        interagisciWin = null;
    });
});

ipcMain.on('openCercaWindow', () => {
    // Crea la finestra di ricerca
    cercaWin = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    cercaWin.loadFile('cerca.html');

    cercaWin.on('closed', () => {
        cercaWin = null;
    });
});

ipcMain.on('openCercaEsistenteWindow', () => {
    // Crea la finestra di ricerca esistente
    cercaEsistenteWin = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    cercaEsistenteWin.loadFile('cercaesistente.html');

    cercaEsistenteWin.on('closed', () => {
        cercaEsistenteWin = null;
    });
});

app.on('ready', createWindow);

ipcMain.on('saveProfileAddress', (event, address) => {
    profileAddress = address;
    console.log(`Indirizzo del profilo salvato: ${profileAddress}`);

    // Leggi il contenuto attuale del file di configurazione
    const configPath = path.join(__dirname, 'profile-config.json');
    let configContent;

    try {
        configContent = fs.readFileSync(configPath, 'utf-8');
    } catch (readError) {
        console.error('Errore durante la lettura del file di configurazione:', readError.message);
        return;
    }

    // Parsa il JSON e aggiorna solo il campo profileAddress
    let configData;

    try {
        configData = JSON.parse(configContent);
        configData.profileAddress = profileAddress;
    } catch (parseError) {
        console.error('Errore durante il parsing del file di configurazione:', parseError.message);
        return;
    }

    // Scrivi il file di configurazione aggiornato
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (writeError) {
        console.error('Errore durante la scrittura del file di configurazione:', writeError.message);
    }
});

ipcMain.on('savePrivateKey', (event, privateKey) => {
    console.log(`Private Key salvata: ${privateKey}`);

    // Leggi il contenuto attuale del file di configurazione
    const configPath = path.join(__dirname, 'profile-config.json');
    let configContent;

    try {
        configContent = fs.readFileSync(configPath, 'utf-8');
    } catch (readError) {
        console.error('Errore durante la lettura del file di configurazione:', readError.message);
        return;
    }

    // Parsa il JSON e aggiorna solo il campo privateKey
    let configData;

    try {
        configData = JSON.parse(configContent);
        configData.privateKey = privateKey;
    } catch (parseError) {
        console.error('Errore durante il parsing del file di configurazione:', parseError.message);
        return;
    }

    // Scrivi il file di configurazione aggiornato
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (writeError) {
        console.error('Errore durante la scrittura del file di configurazione:', writeError.message);
    }
});


function deployContract() {
    console.log('Esegui la deploy del contratto...');

    // Aggiungi il profileAddress come parte del comando
    exec('npx hardhat run ../scripts/deploy.js --network myLocalNetwork', (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore durante la deploy del contratto: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Errore durante la deploy del contratto: ${stderr}`);
            return;
        }

        // Estrai l'indirizzo del contratto
        const newContractAddress = extractContractAddress(stdout);

        if (newContractAddress) {
            // Aggiorna il valore della variabile contractAddress
            contractAddress = newContractAddress;

            // Aggiorna l'indirizzo del contratto in profile-config.json
            updateContractAddressInConfig(contractAddress);

            // Aggiorna l'interfaccia utente
            win.webContents.executeJavaScript(`updateContractAddress("${contractAddress}")`);
            win.webContents.executeJavaScript(`document.getElementById("openInteragisciButton").style.display = 'block';`);
            win.webContents.executeJavaScript(`document.getElementById("openCercaButton").style.display = 'block';`);
        } else {
            console.error("Impossibile estrarre l'indirizzo del contratto.");
        }

        console.log(`Deploy del contratto completato: ${stdout}`);
    });
}

ipcMain.on('deployContract', () => {
    deployContract();
});

function extractContractAddress(deployResult) {
    const regex = /Indirizzo del contratto: (0x[0-9a-fA-F]*)/;
    const match = deployResult.match(regex);
    return match && match[1] ? match[1] : null;
}


function updateContractAddressInConfig(address) {
    // Leggi il contenuto attuale del file di configurazione
    const configPath = path.join(__dirname, 'profile-config.json');
    let configContent;

    try {
        configContent = fs.readFileSync(configPath, 'utf-8');
    } catch (readError) {
        console.error('Errore durante la lettura del file di configurazione:', readError.message);
        return;
    }

    // Parsa il JSON e aggiorna solo il campo contractAddress
    let configData;

    try {
        configData = JSON.parse(configContent);
        configData.contractAddress = address;
    } catch (parseError) {
        console.error('Errore durante il parsing del file di configurazione:', parseError.message);
        return;
    }

    // Scrivi il file di configurazione aggiornato
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (writeError) {
        console.error('Errore durante la scrittura del file di configurazione:', writeError.message);
    }
}

ipcMain.on('eseguiInteragisci', (event, descrizioneContratto, tipologiaContratto) => {
    // Esegui il comando node interagisci.js
    exec(`node ../interagisci.js "${descrizioneContratto}" "${tipologiaContratto}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore durante l'interazione con il contratto: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Errore durante l'interazione con il contratto: ${stderr}`);
            return;
        }

        console.log(`Interazione con il contratto completata: ${stdout}`);
    });
});

// Gestisci il comando di ricerca del contratto
ipcMain.on('cercaContratto', (event, tipologiaContratto) => {
    // Esegui il comando node cerca.js "Tipologia del contratto"
    exec(`node ../cerca.js "${tipologiaContratto}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore durante la ricerca del contratto: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Errore durante la ricerca del contratto: ${stderr}`);
            return;
        }

        console.log(`Ricerca del contratto completata: ${stdout}`);
    });
});

async function svuotaFile() {
    try {
        await Promise.all([
            fs.promises.writeFile('outcerca.json', ''),
            fs.promises.writeFile('outinteragisci.json', ''),
            fs.promises.writeFile('RFID.json', ''),
            // Leggi il file profile-config.json e svuota i campi appropriati
            fs.promises.readFile('profile-config.json', 'utf-8')
                .then(configContent => {
                    const configData = JSON.parse(configContent);
                    configData.profileAddress = '';
                    configData.privateKey = '';
                    configData.contractAddress = '';
                    return fs.promises.writeFile('profile-config.json', JSON.stringify(configData, null, 2));
                })
        ]);
        console.log('Campi dei file svuotati con successo');
    } catch (error) {
        console.error('Errore durante lo svuotamento dei campi dei file:', error);
    }
}

ipcMain.on('saveContractAddress', (event, contractAddress) => {
    console.log(`Contract address salvata: ${contractAddress}`);

    // Leggi il contenuto attuale del file di configurazione
    const configPath = path.join(__dirname, 'profile-config.json');
    let configContent;

    try {
        configContent = fs.readFileSync(configPath, 'utf-8');
    } catch (readError) {
        console.error('Errore durante la lettura del file di configurazione:', readError.message);
        return;
    }

    // Parsa il JSON e aggiorna solo il campo privateKey
    let configData;

    try {
        configData = JSON.parse(configContent);
        configData.contractAddress = contractAddress;
    } catch (parseError) {
        console.error('Errore durante il parsing del file di configurazione:', parseError.message);
        return;
    }

    // Scrivi il file di configurazione aggiornato
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (writeError) {
        console.error('Errore durante la scrittura del file di configurazione:', writeError.message);
    }
});





app.on('before-quit', () => {
    // Svuota i campi dei file quando tutte le interfacce sono chiuse
    svuotaFile();
});