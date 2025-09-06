// File: src/app/layout.tsx

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast'; 
import ChatbotWidget from '@/components/Chatbotwidget';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'VitalLink',
  description: 'A transparent and efficient platform for organ donation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} flex flex-col min-h-screen bg-white`}>
        <Toaster position="top-center" /> 
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <ChatbotWidget />
      </body>
    </html>
  );
}