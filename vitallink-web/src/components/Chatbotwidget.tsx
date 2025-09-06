// File: src/components/ChatbotWidget.tsx

'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function ChatbotWidget() {
  // State to manage the visibility of the chat window
  const [isOpen, setIsOpen] = useState(false);

  // The same useChat hook we used before
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {/* The pop-up chat window, shown only when isOpen is true */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 h-[60vh] bg-black rounded-lg shadow-2xl flex flex-col z-50 transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-theme-500 text-white rounded-t-lg">
            <h3 className="font-bold">VitalLink AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              {/* Close Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto">
            {messages.length > 0 ? messages.map(m => (
              <div key={m.id} className={`my-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg shadow ${m.role === 'user' ? 'bg-theme-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <p className="text-sm">{m.content}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                <p>Have a question about organ donation or VitalLink? Ask away!</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex p-4 border-t">
            <input
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              value={input}
              placeholder="Ask a question..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-theme-500 text-white font-semibold px-4 py-2 rounded-r-md disabled:bg-theme-300 hover:bg-theme-600 transition-colors"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* The floating action button, shown only when isOpen is false */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-theme-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-theme-600 transition-transform transform hover:scale-110 z-50"
          aria-label="Open Chat"
        >
          {/* Chat Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}
    </div>
  );
}