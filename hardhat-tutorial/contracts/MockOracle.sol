// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MockOracle is Initializable, OwnableUpgradeable {
    mapping(string => string) private rfidToContractData;
    mapping(string => string) private rfidToType;
    mapping(string => string[]) private typeToRfids; 

    event RFIDDataChanged(string rfid, string contractData, string rfidType);

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    function setRFIDData(string memory _rfid, string memory _contractData, string memory _rfidType) public onlyOwner {
        require(bytes(rfidToContractData[_rfid]).length == 0, unicode"RFID già registrato");

        rfidToContractData[_rfid] = _contractData;
        rfidToType[_rfid] = _rfidType;
        typeToRfids[_rfidType].push(_rfid); 

        emit RFIDDataChanged(_rfid, _contractData, _rfidType);
    }

    function getRFIDData(string memory _rfid) public view returns (string memory) {
        return rfidToContractData[_rfid];
    }

    function getRFIDType(string memory _rfid) public view returns (string memory) {
        return rfidToType[_rfid];
    }

    //ottiene tutti gli RFID di una certa tipologia
    function getRfidsByType(string memory _rfidType) public view returns (string[] memory) {
        return typeToRfids[_rfidType];
    }
}
