
# RFID Certification and Data Tracking with Ethereum Smart Contracts

This project integrates **RFID** technology with **Ethereum smart contracts** to enable certification and tracking of information. The RFID data is collected by an Arduino and sent to a server, which interacts with an Ethereum smart contract to store and retrieve data.

---

## 🌐 Project Overview

The goal of this project is to track items using RFID technology and store related data in a decentralized manner on the Ethereum blockchain. The project includes several components:

- **Arduino Setup**: Reads RFID data using an MFRC522 module and sends it to a server.
- **Server**: Receives RFID data from Arduino and interacts with an Ethereum smart contract to store/retrieve data.
- **Ethereum Smart Contract**: Stores and manages data associated with the RFID tags.
- **Deployment**: Utilizes Hardhat to deploy the smart contract to a local Ethereum network for testing.

---

## 🛠️ Technologies & Tools

- **Languages**: JavaScript (Node.js), Solidity, Arduino C++
- **Libraries**:
  - **Arduino**: `SPI`, `MFRC522`, `WiFi`, `HTTPClient`
  - **Node.js**: `ethers.js`, `express`, `fs`, `axios`
  - **Hardhat**: For smart contract development and deployment
- **Smart Contract**: Solidity (with OpenZeppelin contracts)
- **Server**: Express.js API
- **Blockchain Network**: Local Ethereum Network (Ganache)

---

## 📁 Repository Structure

```
RFID-Ethereum-Tracking/
├── Arduino/                  → Arduino code and communication files
│   └── Arduino.ino            → Main Arduino code with MFRC522
│
├── hardhat-tutorial/         → Ethereum smart contract and interaction files
│   ├── server.js              → Server to handle RFID data
│   ├── interagisci.js         → Interacts with the smart contract
│   ├── cerca.js               → Searches RFID data in the smart contract
│   └── ...                    → Other necessary files for proper functionality
│
├── presentation/              → Presentation file (Italian)
│   └── Data_Security_Overview.pptx → Rename this file as needed
│
├── README.md                 → Project documentation
└── .gitignore                → Git ignore file (to be added)

⚠️ Note: Some folders (e.g. node_modules/, my-electron-app/node_modules) are excluded from version control. Make sure to run npm install after cloning.

```

---

## 🚀 How to Use

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Marco210210/RFID-Ethereum-Tracking.git
   ```

2. **Arduino Setup**:
   - Flash the provided Arduino code (`Arduino.txt`) onto your Arduino board.
   - Ensure the RFID reader (MFRC522) is connected to the Arduino.
   - Connect the Arduino to a WiFi network by providing the correct SSID and password in the code.

3. **Start the Server**:
   - Navigate to the `server/` folder and run:
     ```bash
     npm install
     npm start
     ```
   - The server will be running at `http://localhost:3000`.

4. **Deploy the Smart Contract**:
   - Install Hardhat and deploy the contract on a local Ethereum network:
     ```bash
     npx hardhat run --network myLocalNetwork scripts/deploy.js
     ```

5. **Interact with the Smart Contract**:
   - **Insert RFID Data**: Use the server's API to insert RFID data into the smart contract.
   - **Search RFID Data**: Query the smart contract for RFID data by type using the search feature.

---

## 📄 Documentation

- **Server Endpoint**:
  - `/receive-data`: Receives RFID data from the Arduino and stores it.
  - `/send-data`: Returns the latest RFID data.

- **Smart Contract**:
  - The smart contract allows the storage and retrieval of RFID data and ensures that each RFID is associated with a unique entry.

---

## 👥 Contributors

- Ciancio Vittorio
- Di Maio Marco

---

## 📄 License

This project is licensed under the [CC BY-NC-SA 4.0 License](https://creativecommons.org/licenses/by-nc-sa/4.0/)  
[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)  

You may share and adapt this work for non-commercial purposes only, **as long as you give appropriate credit** and **distribute your contributions under the same license**.  
For commercial use, **explicit permission from the authors is required**.
