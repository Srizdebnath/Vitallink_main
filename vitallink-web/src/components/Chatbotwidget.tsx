'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 h-[60vh] bg-black rounded-lg shadow-2xl flex flex-col z-50 transform transition-all duration-300 ease-out">
          <div className="flex justify-between items-center p-4 bg-theme-500 text-white rounded-t-lg">
            <h3 className="font-bold">VitalLink AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

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

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-theme-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-theme-600 transition-transform transform hover:scale-110 z-50"
          aria-label="Open Chat"
        >

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M416 208C416 305.2 330 384 224 384C197.3 384 171.9 379 148.8 370L67.2 413.2C57.9 418.1 46.5 416.4 39 409C31.5 401.6 29.8 390.1 34.8 380.8L70.4 313.6C46.3 284.2 32 247.6 32 208C32 110.8 118 32 224 32C330 32 416 110.8 416 208zM416 576C321.9 576 243.6 513.9 227.2 432C347.2 430.5 451.5 345.1 463 229.3C546.3 248.5 608 317.6 608 400C608 439.6 593.7 476.2 569.6 505.6L605.2 572.8C610.1 582.1 608.4 593.5 601 601C593.6 608.5 582.1 610.2 572.8 605.2L491.2 562C468.1 571 442.7 576 416 576z"/></svg>
        </button>

        
      )}
    

    </div>
  );
}