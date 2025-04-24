'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  GifIcon,
  PlusIcon,
  Cog8ToothIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/avatar';
import { ChatSettings } from '@/components/ChatSettings';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    coachName: 'Coach Sarah',
    lastMessage: 'Great progress this week!',
    timestamp: new Date('2024-04-07T18:45:00'),
    unreadCount: 0,
    status: 'online'
  }
];

// Mock messages data
const mockMessages = [
  {
    id: '1',
    content: 'Hi David! I noticed your great progress in this week\'s check-in. Your nutrition compliance is improving nicely.',
    senderId: 'coach1',
    timestamp: new Date('2024-04-07T18:30:00'),
    type: 'text',
    status: 'read'
  },
  {
    id: '2',
    content: 'Thanks! Yes, I\'ve been focusing on hitting my protein targets consistently.',
    senderId: 'client1',
    timestamp: new Date('2024-04-07T18:32:00'),
    type: 'text',
    status: 'read'
  },
  {
    id: '3',
    content: 'That\'s excellent! I can see it reflecting in your progress photos too. Keep it up! 💪',
    senderId: 'coach1',
    timestamp: new Date('2024-04-07T18:35:00'),
    type: 'text',
    status: 'read'
  }
];

export default function ClientMessagesPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, 'HH:mm');
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: 'client1',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1F22]">
      {/* Quick Access Sidebar */}
      <div className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-4 gap-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setSelectedConversation(conv.id)}
            className={`relative group w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              selectedConversation === conv.id 
                ? 'bg-blue-500 rounded-[16px]' 
                : 'hover:bg-blue-500 hover:rounded-[16px]'
            }`}
          >
            <Avatar
              src={conv.avatar}
              fallback={conv.coachName}
              status={conv.status}
              size="md"
            />
            {conv.unreadCount > 0 && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {conv.unreadCount}
              </div>
            )}
          </button>
        ))}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-500 hover:rounded-[16px] transition-all mt-auto mb-4"
        >
          <Cog8ToothIcon className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="w-60 bg-[#2B2D31] flex flex-col">
        <div className="p-4">
          <h1 className="text-white font-semibold mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-1 bg-[#1E1F22] rounded text-sm text-gray-200 placeholder-gray-400 focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full p-2 flex items-center gap-3 hover:bg-[#35373C] ${
                selectedConversation === conv.id ? 'bg-[#35373C]' : ''
              }`}
            >
              <Avatar
                src={conv.avatar}
                fallback={conv.coachName}
                status={conv.status}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {conv.coachName}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(conv.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                  {conv.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#313338] flex flex-col">
        {selectedConversation && (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={conversations.find(c => c.id === selectedConversation)?.avatar}
                  fallback={conversations.find(c => c.id === selectedConversation)?.coachName || ''}
                  status={conversations.find(c => c.id === selectedConversation)?.status}
                  size="sm"
                />
                <div>
                  <h2 className="text-white font-medium">
                    {conversations.find(c => c.id === selectedConversation)?.coachName}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {conversations.find(c => c.id === selectedConversation)?.status === 'online'
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white">
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'client1' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === 'client1'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="h-16 border-t border-gray-700 p-2">
              <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2">
                <button className="text-gray-400 hover:text-white">
                  <PlusIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                />
                <button className="text-gray-400 hover:text-white">
                  <GifIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <PhotoIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="text-blue-500 hover:text-blue-400"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <ChatSettings
              user={{
                name: 'David Rodriguez',
                role: 'client',
                status: 'online'
              }}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}