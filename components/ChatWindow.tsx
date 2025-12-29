import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Phone, MoreVertical } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserRole: UserRole;
  peerName: string;
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserRole,
  peerName,
  onSendMessage,
  onBack
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold text-lg border-2 border-blue-300">
              {peerName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{peerName}</h3>
              <p className="text-[10px] text-blue-200">Online</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="hover:bg-blue-700 p-2 rounded-full">
            <Phone size={20} />
          </button>
          <button className="hover:bg-blue-700 p-2 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-24 bg-[#e5ddd5]">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          const isSystem = msg.sender === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full shadow-sm font-medium">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-xl shadow-sm relative ${
                  isMe
                    ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className="text-[10px] text-gray-500 text-right mt-1 opacity-70">
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t sticky bottom-0 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};