'use client';

import { useChat } from '@ai-sdk/react';

export default function AskPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat', 
  });

  return (
    <div className="bg-gray-50 flex-grow">
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-200px)] bg-black"> 
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Ask VitalLink AI</h1>
        
        <div className="flex-grow overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-md border">
          {messages.length > 0
            ? messages.map(m => (
                <div key={m.id} className={`whitespace-pre-wrap my-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl p-3 rounded-lg shadow ${m.role === 'user' ? 'bg-theme-500 text-black' : 'bg-gray-200 text-gray-800'}`}>
                    <strong className="font-semibold">{m.role === 'user' ? 'You' : 'VitalLink AI'}:</strong>
                    <p className="mt-1">{m.content}</p>
                  </div>
                </div>
              ))
            : (
              <div className="text-center text-gray-500 flex flex-col justify-center h-full">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-100 mb-4">
                    <svg className="h-6 w-6 text-theme-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
                <p>Have a question about the organ donation process? Ask away!</p>
                <p className="mt-4 text-sm">Examples: "Who can be a donor?", "Is there a cost?", "Which religions support donation?"</p>
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center bg-black rounded-lg">
          <input
            className="flex-grow p-3 border border-gray-700 bg-black text-white placeholder-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
            value={input}
            placeholder="Ask a question about organ donation..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-theme-500 text-white font-semibold p-3 rounded-r-lg disabled:bg-theme-300 hover:bg-theme-600 transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}