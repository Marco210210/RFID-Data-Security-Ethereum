const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    deployContract: () => {
        ipcRenderer.send('deployContract');
    },

    saveProfileAddress: (address) => {
        ipcRenderer.send('saveProfileAddress', address);
    },

    savePrivateKey: (privateKey) => {
        ipcRenderer.send('savePrivateKey', privateKey);
    },

    saveContractAddress: (contractAddress) => {
        ipcRenderer.send('saveContractAddress', contractAddress);
    },

    openInteragisciWindow: () => {
        ipcRenderer.send('openInteragisciWindow');
    },

    eseguiInteragisci: (descrizioneContratto, tipologiaContratto) => {
        ipcRenderer.send('eseguiInteragisci', descrizioneContratto, tipologiaContratto);
    },

    openCercaWindow: () => {
        ipcRenderer.send('openCercaWindow');
    },

    cercaContratto: (tipologiaContratto) => {
        ipcRenderer.send('cercaContratto', tipologiaContratto);
    },

    openCercaEsistenteWindow: () => {
        ipcRenderer.send('openCercaEsistenteWindow');
    }
});
