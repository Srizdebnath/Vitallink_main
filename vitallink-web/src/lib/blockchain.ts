// File: src/lib/blockchain.ts

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Define the structure of a "block" in our simulated blockchain
interface Block {
  timestamp: string;
  transactionType: 'DONOR_CONSENT';
  data: any;
  hash: string;
  previousHash: string; // To link the blocks together
}

// The path to our local file that acts as the ledger
const ledgerPath = path.join(process.cwd(), 'data', 'ledger.json');

// A simple in-memory representation of our blockchain
let blockchain: Block[] = [];
let isInitialized = false;

// Function to initialize the blockchain from the file
async function initializeChain() {
  try {
    const fileContent = await fs.readFile(ledgerPath, 'utf-8');
    blockchain = JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, create a "genesis block" (the first block)
    console.log('Ledger file not found. Creating a new one with a genesis block.');
    const genesisBlock: Block = {
      timestamp: new Date().toISOString(),
      transactionType: 'DONOR_CONSENT',
      data: { message: 'Genesis Block - The beginning of the chain' },
      hash: '0',
      previousHash: '0',
    };
    blockchain = [genesisBlock];
    await fs.writeFile(ledgerPath, JSON.stringify(blockchain, null, 2));
  }
  isInitialized = true;
}

// Function to calculate the hash of a block's content
function calculateHash(timestamp: string, data: any, previousHash: string): string {
  const dataString = JSON.stringify(data);
  return createHash('sha256')
    .update(timestamp + dataString + previousHash)
    .digest('hex');
}

// --- The main function we will call from our API ---
export async function recordConsentOnLedger(consentData: { userId: string; consent: boolean; profileData: any }): Promise<boolean> {
  // Ensure the chain is loaded from the file
  if (!isInitialized) {
    await initializeChain();
  }

  const previousBlock = blockchain[blockchain.length - 1];
  const timestamp = new Date().toISOString();
  
  // The data we want to record immutably
  const transactionData = {
    userId: consentData.userId,
    consentGiven: consentData.consent,
    profileHash: createHash('sha256').update(JSON.stringify(consentData.profileData)).digest('hex'), // We hash the profile data for privacy
    recordedAt: timestamp,
  };

  const newHash = calculateHash(timestamp, transactionData, previousBlock.hash);

  const newBlock: Block = {
    timestamp,
    transactionType: 'DONOR_CONSENT',
    data: transactionData,
    hash: newHash,
    previousHash: previousBlock.hash,
  };

  // Add the new block to our chain and save it to the file
  blockchain.push(newBlock);
  try {
    await fs.writeFile(ledgerPath, JSON.stringify(blockchain, null, 2));
    console.log(`Successfully recorded consent for user ${consentData.userId} on the ledger.`);
    return true;
  } catch (error) {
    console.error('Failed to write to ledger:', error);
    // In a real app, you would handle this failure, maybe by trying again.
    blockchain.pop(); // Rollback the change in memory
    return false;
  }
}