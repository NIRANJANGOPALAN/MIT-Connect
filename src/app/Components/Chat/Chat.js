'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// For Floating bar


import FileUpload from '../FileUpload/FileUpload';
import FileProcess from '../FileProcess/FileProcess';
import Bar from '../Charts/Bar';
import "./Chat.css";

let socket;

// Initialize the Generative AI model
const genAI = new GoogleGenerativeAI('AIzaSyC_IfQGhoWi03gsMAlhSJyCd1LXx8i_xbA'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function Chat({ username, sessionId, onLogout }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const aiMessagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      query: { session_id: sessionId }
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('authenticate', { session_id: sessionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('authentication', (response) => {
      if (response.status === 'success') {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed:', response.message);
        onLogout();
      }
    });

    socket.on('initial messages', (initialMessages) => {
      setMessages(initialMessages);
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('authentication');
      socket.off('initial messages');
      socket.off('chat message');
      socket.disconnect();
    };
  }, [sessionId, onLogout]);

  useEffect(() => {
    scrollToBottom(activeTab);
  }, [messages, aiMessages, activeTab]);

  const scrollToBottom = (type) => {
    if (type === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected && socket) {
      const newMessage = { username, text: message };
      socket.emit('chat message', newMessage);
      setMessage('');
    }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (aiInput.trim()) {
      setIsAiLoading(true);
      const userMessage = { role: 'user', content: aiInput };
      setAiMessages(prev => [...prev, userMessage]);
      setAiInput('');
      try {
        const result = await model.generateContent(aiInput);
        const response = await result.response;
        const aiMessage = { role: 'ai', content: response.text() };
        setAiMessages(prev => [...prev, aiMessage]);

        // Update conversation state
        setConversation(prev => [
          ...prev,
          {
            username,
            userMessage: userMessage.content,
            aiMessage: aiMessage.content
          }
        ]);

      } catch (error) {
        console.error('Error:', error);
        const errorMessage = { role: 'ai', content: 'An error occurred while processing your request.' };
        setAiMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleLogout = () => {
    socket.disconnect();
    onLogout();
  };

  const clearAiChat = () => {
    setAiMessages([]);
    setConversation([]);
  };

  const downloadConversation = () => {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'conversation.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // For Floating bar
  

  return (
    <div className="app-container">
      <header className="top-menu">
        <h1 className="app-title">VAC-Connect</h1>
        <div className="user-info">
          Logged in as: <span className="username">{username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="main-content">
        {/* Left and Center area for future features */}
        <div className="feature-area">
          <Bar className="bar-feature" />
          <p>my features</p>
           {selectedFile && <FileProcess file={selectedFile} />}
          {/* Additional features can be added here */}
          
            <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Chat and AI container aligned to the right */}
        <div className="chat-container">
          <div className="tab-selector">
            <button
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="chat-content">
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.username === username ? 'own-message' : ''}`}>
                    <strong>{msg.username}: </strong>
                    <span>{msg.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                />
                <button type="submit" className="send-button" disabled={!isConnected}>Send</button>
              </form>
              {!isConnected && <div className="connection-status">Disconnected from server. Trying to reconnect...</div>}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="ai-content">
              <div className="ai-messages">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`ai-message ${msg.role}`}>
                    <strong>{msg.role === 'user' ? 'You:' : 'AI:'}</strong> {msg.content}
                  </div>
                ))}
                <div ref={aiMessagesEndRef} />
              </div>
              <form onSubmit={handleAiSubmit} className="ai-input-form">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI something..."
                  className="ai-input"
                />
                <button type="submit" className="ai-send-button" disabled={isAiLoading}>
                  {isAiLoading ? 'Processing...' : 'Ask AI'}
                </button>
                <Tooltip title="Download Conversation">
                  <IconButton onClick={downloadConversation} >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear Chat">
                  <IconButton onClick={clearAiChat}>
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}