const { ethers } = require("ethers");
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

  const provider = new ethers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  const typeToQuery = process.argv[2];

  if (!typeToQuery) {
    console.error("Devi fornire una tipologia come argomento.");
    return;
  }

  console.log(`Cercando tutti gli RFID di tipologia '${typeToQuery}'...`);

  const rfids = await contract.getRfidsByType(typeToQuery);

  console.log(`RFID trovati per la tipologia '${typeToQuery}':`);

  // Itera sull'array di RFID e recupera i dati per ciascuno
  const results = [];
  for (const rfid of rfids) {
    const data = await contract.getRFIDData(rfid);
    console.log(`RFID: ${rfid} | Dati: ${data}`);
    results.push({ rfid, data });
  }

  // Svuota il file outcerca.json prima di scriverci i nuovi risultati
  try {
    await fs.writeFile('outcerca.json', '');
  } catch (clearError) {
    console.error('Errore durante lo svuotamento del file outcerca.json:', clearError.message);
    return;
  }

  const outputMessage = (rfids.length === 0)
    ? { message: "Nessun elemento trovato" }
    : { message: "Elementi trovati", results };

  // Salva i risultati nel file outcerca.json
  try {
    await fs.appendFile('outcerca.json', JSON.stringify(outputMessage, null, 2));
    console.log('Risultati aggiunti in outcerca.json');
  } catch (writeError) {
    console.error('Errore durante la scrittura del file outcerca.json:', writeError.message);
  }
}

main().catch(console.error);