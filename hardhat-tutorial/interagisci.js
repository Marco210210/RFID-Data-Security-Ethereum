const { ethers } = require("ethers");
const axios = require("axios");
const fs = require("fs").promises;

async function readConfigFile(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Errore durante la lettura del file di configurazione:", error);
    process.exit(1);
  }
}


async function main() {

  const { providerUrl, privateKey, contractAddress } = await readConfigFile('profile-config.json');

  const contractABI = [
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "rfid",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "contractData",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "rfidType",
          "type": "string"
        }
      ],
      "name": "RFIDDataChanged",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_rfid",
          "type": "string"
        }
      ],
      "name": "getRFIDData",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_rfid",
          "type": "string"
        }
      ],
      "name": "getRFIDType",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_rfidType",
          "type": "string"
        }
      ],
      "name": "getRfidsByType",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_rfid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contractData",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_rfidType",
          "type": "string"
        }
      ],
      "name": "setRFIDData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];


  try {
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const newContractData = process.argv[2];
    const newType = process.argv[3];

    if (!newContractData || !newType) {
      console.error("Devi fornire i dati del contratto e la tipologia come argomenti.");
      process.exit(1);
    }

    const response = await axios.get('http://192.168.155.210:3000/send-data');
    const rfid = response.data.rfid;

    console.log("Interazione con il contratto completata: ID RFID ricevuto dal server:", rfid);

    const existingData = await contract.getRFIDData(rfid);
    const existingType = await contract.getRFIDType(rfid); 

    let interactionMessage = "Interazione con il contratto completata:";

    if (existingData !== "") {
      interactionMessage += ` Tipologia: ${existingType}\n RFID già registrato con dati: ${existingData}`;
      // Scrivi i risultati nel file outinteragisci.json
      const resultData = {
        message: interactionMessage,
        rfid: rfid,
        existingData: existingData,
        existingType: existingType,
        newData: newContractData,
        newType: newType
      };
      await fs.writeFile('outinteragisci.json', JSON.stringify(resultData, null, 2));
      return; // Termina l'esecuzione se l'RFID è già registrato
    }

    // Registra l'RFID con i nuovi dati e tipologia se non è già registrato
    const tx = await contract.setRFIDData(rfid, newContractData, newType);
    await tx.wait();

    interactionMessage += ` Dati e tipologia impostati per RFID: ${rfid}`;

    console.log(interactionMessage);

    // Scrivi i risultati nel file outinteragisci.json
    const resultData = {
      message: interactionMessage,
      rfid: rfid,
      existingData: existingData,
      existingType: existingType,
      newData: newContractData,
      newType: newType
    };

    await fs.writeFile('outinteragisci.json', JSON.stringify(resultData, null, 2));

  } catch (error) {
    console.error("Errore durante l'interazione:", error);
  }

  console.log("Interazione completata con successo.");

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Errore durante l'interazione:", error);
    process.exit(1);
  });
