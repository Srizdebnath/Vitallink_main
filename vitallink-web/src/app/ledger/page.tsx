'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Block = {
  timestamp: string;
  transactionType: string;
  data: any;
  hash: string;
  previousHash: string;
};

export default function LedgerPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch('/api/ledger', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch ledger data.');
        }
        const data = await response.json();
        setBlocks(data.ledger.reverse()); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, [router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading Ledger...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 flex-grow py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-black text-center">Consent Ledger</h1>
        <p className="mt-2 text-gray-600 text-center">This is a permanent, auditable record of all donor consent actions.</p>

        <div className="mt-8 space-y-6">
          {blocks.map((block, index) => (
            <div key={block.hash} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-theme-500">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Block #{blocks.length - index}</h2>
                <span className="text-xs font-mono bg-gray-100 text-black px-2 py-1 rounded">{new Date(block.timestamp).toLocaleString()}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm font-mono text-gray-600 break-all">
                <p><strong className="text-gray-800">Type:</strong> {block.transactionType}</p>
                <p><strong className="text-gray-800">Data Hash:</strong> {block.data.profileHash || 'N/A'}</p>
                <p><strong className="text-gray-800">Block Hash:</strong> {block.hash}</p>
                <p><strong className="text-gray-800">Previous Hash:</strong> {block.previousHash}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}