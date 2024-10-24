'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IconButton, Tooltip, Fab } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import FileUpload from '../FileUpload/FileUpload';
import FileProcess from '../FileProcess/FileProcess';
import CorrelationMatrix from '../Charts/CorrelationMatrix';
import Bar from '../Charts/Bar';
import { useLocalStorage } from '../useLocalStorage/useLocalStorage';
import DbConnector from '../DBConnector/DbConnector';
import Visuals from '../Charts/Visuals';
import "./Chat.css";

const genAI = new GoogleGenerativeAI('AIzaSyC_IfQGhoWi03gsMAlhSJyCd1LXx8i_xbA');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function Chat({ username, sessionId, onLogout }) {
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const aiMessagesEndRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    if (isAiChatOpen) {
      scrollToBottom();
    }
  }, [aiMessages, isAiChatOpen]);

  const scrollToBottom = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        setConversation(prev => [...prev, { username, userMessage: userMessage.content, aiMessage: aiMessage.content }]);
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

  const toggleAiChat = () => {
    setIsAiChatOpen(!isAiChatOpen);
  };

  return (
    <div className="app-container">
      <header className="top-menu">
        <h1 className="app-title">VAC-Connect</h1>
        <div className="user-info">
          Logged in as: <span className="username">{username}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="feature-area">
          <p>my features</p>
          <div className="content-container">
            {selectedFile && (
              <>
                <div className="left-panel">
                  <FileProcess file={selectedFile} />
                </div>
                <div className="right-panel">
                  <CorrelationMatrix file={selectedFile} />
                </div>
              </>
            )}
            
           
           
          </div> {selectedFile && <Visuals file={selectedFile} />}
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* AI Chat Icon */}
        <Fab
          color="primary"
          aria-label="chat"
          className="ai-chat-fab"
          onClick={toggleAiChat}
        >
          <ChatIcon />
        </Fab>

        {/* AI Chat Container */}
        {isAiChatOpen && (
          <div className="ai-chat-container">
            <div className="ai-chat-header">
              <h3>AI Chat</h3>
              <Tooltip title="Download Conversation">
                <IconButton onClick={downloadConversation}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={toggleAiChat}>
                <CloseIcon />
              </IconButton>
            </div>
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

              <Tooltip title="Clear Chat">
                <IconButton onClick={clearAiChat}>
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}