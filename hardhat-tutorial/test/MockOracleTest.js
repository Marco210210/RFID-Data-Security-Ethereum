const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockOracle Contract", function () {
  let mockOracle;
  let deployer;

  beforeEach(async function () {
    // Distribuzione del contratto MockOracle
    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();
    [deployer] = await ethers.getSigners();
  });

  it("should allow to set and get RFID data", async function () {
    // Imposta un valore fittizio per l'ID RFID
    const rfidData = "123456789";
    const setTx = await mockOracle.setRFIDData(rfidData);

    // Attendere che la transazione sia confermata
    await setTx.wait();

    // Recupera l'ID RFID dal contratto
    const retrievedData = await mockOracle.getRFIDData();

    // Verifica che l'ID RFID recuperato corrisponda a quello impostato
    expect(retrievedData).to.equal(rfidData);
  });
});
