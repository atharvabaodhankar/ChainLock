import { ethers } from "ethers";
import vaultABI from './abi/vault.json'; // Save ABI here

const CONTRACT_ADDRESS = "0xa880d332D42f586d5312C8A913805e6f8f8344DD";

export const getVaultContract = (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, vaultABI, signerOrProvider);
};
