const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("Inizio dello script di deployment...");

    // Ottieni l'account deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploy dei contratti con l'account:", deployer.address);

    // Ottieni il contratto factory
    const MockOracle = await ethers.getContractFactory("MockOracle");

    // Effettua il deploy del contratto con la funzione di inizializzazione "initialize"
    console.log("Inizio del deployment del contratto...");

    // Leggi l'indirizzo del proprietario dal file profile-config.json
    const profileConfigPath = path.join(__dirname, '../my-electron-app/profile-config.json');
    const profileConfigContent = fs.readFileSync(profileConfigPath, 'utf-8');
    const profileConfig = JSON.parse(profileConfigContent);

    if (!profileConfig || !profileConfig.profileAddress) {
      throw new Error("Indirizzo del profilo non trovato nel file profile-config.json.");
    }

    const initialOwner = profileConfig.profileAddress;

    const mockOracle = await upgrades.deployProxy(MockOracle, [initialOwner], { initializer: 'initialize' });

    // Stampa l'indirizzo del contratto
    console.log("Indirizzo del contratto:", mockOracle.target);

    console.log("Deployment completato con successo.");
  } catch (error) {
    console.error("Errore durante il deployment:", error);
    process.exit(1);
  }
}

main();
