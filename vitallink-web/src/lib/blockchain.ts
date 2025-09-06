import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';


interface TransactionData {
  userId: string;
  consentGiven: boolean;
  profileHash: string;
  recordedAt: string;
  message?: string; 
}

interface Block {
  timestamp: string;
  transactionType: 'DONOR_CONSENT';
  data: TransactionData;
  hash: string;
  previousHash: string;
}

const ledgerPath = path.join(process.cwd(), 'data', 'ledger.json');
let blockchain: Block[] = [];
let isInitialized = false;

async function initializeChain() {
  try {
    const fileContent = await fs.readFile(ledgerPath, 'utf-8');
    blockchain = JSON.parse(fileContent);
  } catch (error) {
    console.log('Ledger file not found. Creating a new one with a genesis block.');
    const genesisBlock: Block = {
      timestamp: new Date().toISOString(),
      transactionType: 'DONOR_CONSENT',
      data: {
        userId: 'SYSTEM',
        consentGiven: true,
        profileHash: '0',
        recordedAt: new Date().toISOString(),
        message: 'Genesis Block - The beginning of the chain',
      },
      hash: '0',
      previousHash: '0',
    };
    blockchain = [genesisBlock];
    await fs.writeFile(ledgerPath, JSON.stringify(blockchain, null, 2));
  }
  isInitialized = true;
}


function calculateHash(timestamp: string, data: TransactionData, previousHash: string): string {
  const dataString = JSON.stringify(data);
  return createHash('sha256')
    .update(timestamp + dataString + previousHash)
    .digest('hex');
}


interface ProfileData {
  bloodType: string;
  address: string;
  organsToDonate: string[];
}

export async function recordConsentOnLedger(consentData: { userId: string; consent: boolean; profileData: ProfileData }) {
  if (!isInitialized) {
    await initializeChain();
  }

  const previousBlock = blockchain[blockchain.length - 1];
  const timestamp = new Date().toISOString();
  
  const transactionData: TransactionData = {
    userId: consentData.userId,
    consentGiven: consentData.consent,
    profileHash: createHash('sha256').update(JSON.stringify(consentData.profileData)).digest('hex'),
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

  blockchain.push(newBlock);
  try {
    await fs.writeFile(ledgerPath, JSON.stringify(blockchain, null, 2));
    console.log(`Successfully recorded consent for user ${consentData.userId} on the ledger.`);
  } catch (error) {
    console.error('Failed to write to ledger:', error);
    blockchain.pop();
  }
}