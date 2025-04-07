'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/avatar';
import { ChatSettings } from '@/components/ChatSettings';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'file';
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface Conversation {
  id: string;
  clientName: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if user is not a coach
    if (user && user.role !== 'coach' && user.role !== 'admin') {
      router.push('/client/messages');
    }
  }, [user, router]);

  // If no user or loading, you might want to show a loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      clientName: 'Patrick Smith',
      avatar: undefined,
      lastMessage: 'Hey! there I\'m available',
      timestamp: new Date('2024-04-07T18:45:00'),
      unreadCount: 0,
      status: 'online'
    },
    {
      id: '2',
      clientName: 'Doris Johnson',
      avatar: undefined,
      lastMessage: 'Nice to meet you',
      timestamp: new Date('2024-04-07T18:30:00'),
      unreadCount: 0,
      status: 'offline',
      lastSeen: new Date('2024-04-07T17:30:00')
    },
    {
      id: '3',
      clientName: 'Emily Wilson',
      avatar: undefined,
      lastMessage: 'Next meeting tomorrow 10:00AM',
      timestamp: new Date('2024-04-07T17:30:00'),
      unreadCount: 1,
      status: 'away'
    },
    {
      id: '4',
      clientName: 'Steve Brown',
      avatar: undefined,
      lastMessage: 'Admin-A.zip',
      timestamp: new Date('2024-04-07T16:30:00'),
      unreadCount: 0,
      status: 'online'
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! there I\'m available',
      senderId: 'client1',
      timestamp: new Date('2024-04-07T18:30:00'),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      content: 'Wow that\'s great',
      senderId: 'coach1',
      timestamp: new Date('2024-04-07T18:32:00'),
      type: 'text',
      status: 'read'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);

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
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: 'coach1',
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
              fallback={conv.clientName}
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
          <h1 className="text-white font-semibold mb-4">Chats</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages or users"
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
              <div className="relative">
                <Avatar
                  src={conv.avatar}
                  fallback={conv.clientName.charAt(0)}
                  className="h-8 w-8 rounded-full"
                />
                {conv.status === 'online' && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#2B2D31]" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-gray-200 truncate">
                  {conv.clientName}
                </p>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-[#313338]">
          {/* Chat Header */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-[#1E1F22]">
            <div className="flex items-center gap-2">
              <Avatar
                src={conversations.find(c => c.id === selectedConversation)?.avatar}
                fallback={conversations.find(c => c.id === selectedConversation)?.clientName.charAt(0) || ''}
                className="h-7 w-7 rounded-full"
              />
              <h2 className="text-white font-medium">
                {conversations.find(c => c.id === selectedConversation)?.clientName}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-200">
                <PhoneIcon className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-200">
                <VideoCameraIcon className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-200">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.senderId === 'coach1' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.senderId !== 'coach1' && (
                  <Avatar
                    src={conversations.find(c => c.id === selectedConversation)?.avatar}
                    fallback={conversations.find(c => c.id === selectedConversation)?.clientName.charAt(0) || ''}
                    className="h-8 w-8 rounded-full mt-1"
                  />
                )}
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    {message.senderId !== 'coach1' && (
                      <span className="text-sm font-medium text-blue-400">
                        {conversations.find(c => c.id === selectedConversation)?.clientName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-200">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex items-center gap-2 bg-[#383A40] rounded-lg p-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-[#2B2D31]"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={() => {}}
                multiple
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button className="p-2 text-gray-400 hover:text-gray-200">
                <GifIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-200">
                <FaceSmileIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#313338] text-gray-400">
          <p>Select a conversation to start messaging</p>
        </div>
      )}

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
                name: user?.name || 'Coach',
                role: user?.role || 'coach',
                avatar: user?.image,
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