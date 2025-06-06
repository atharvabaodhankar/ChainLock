// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PasswordVault {
    struct VaultItem {
        string title;
        string encryptedPassword;
    }

    mapping(address => VaultItem[]) private userVault;

    function addPassword(string memory _title, string memory _encryptedPassword) public {
        userVault[msg.sender].push(VaultItem(_title, _encryptedPassword));
    }

    function getPasswords() public view returns (VaultItem[] memory) {
        return userVault[msg.sender];
    }
}
