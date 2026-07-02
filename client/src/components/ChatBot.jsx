import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BsChatDotsFill, BsX, BsSend, BsRobot, BsMic, BsMicMute, BsTrash, BsFilePerson } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthModal from './AuthModel';
import './ChatBot.css';

const QUICK_REPLIES = [
  { label: "Tell me about yourself", value: "Tell me about yourself" },
  { label: "Strengths & Weaknesses", value: "What are your greatest strengths and weaknesses?" },
  { label: "Why should we hire you?", value: "Why should we hire you?" },
  { label: "Salary negotiation", value: "How do I negotiate salary?" },
  { label: "Resume tips", value: "Give me tips to improve my resume" },
  { label: "Common questions", value: "List common interview questions" }
];

const STORAGE_KEY = 'interviewiq_chat_history';

function ChatBot({ showResumeButton }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
      } catch (e) {
        // If parsing fails, use default welcome message
        setMessages([getWelcomeMessage()]);
      }
    } else {
      setMessages([getWelcomeMessage()]);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  function getWelcomeMessage() {
    return {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your AI Interview Assistant. I can help you with:\n\n• Interview preparation tips\n• Resume advice\n• Career guidance\n• Mock interview practice\n\nHow can I help you today?",
      timestamp: new Date()
    };
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  };

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        ServerUrl + '/api/interview/chat',
        { message: textToSend },
        { withCredentials: true }
      );

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMsg = getWelcomeMessage();
    setMessages([welcomeMsg]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="chatbot-window"
          >
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-avatar">
                  <BsRobot size={20} />
                </div>
                <div>
                  <h3>Interview Assistant</h3>
                  <span>AI Powered Helper</span>
                </div>
              </div>
              <div className="chatbot-header-right">
                <button 
                  className="chatbot-clear-btn"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <BsTrash size={16} />
                </button>
                <button 
                  className="chatbot-close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>

            {/* Quick Reply Buttons */}
            <div className="chatbot-quick-replies">
              {QUICK_REPLIES.map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleSend(reply.value)}
                  disabled={isLoading}
                >
                  {reply.label}
                </button>
              ))}
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-content">
                    {msg.content}
                  </div>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant-message">
                  <div className="message-content typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              <button 
                className={`chatbot-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleVoiceInput}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? <BsMicMute size={18} /> : <BsMic size={18} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about interviews..."
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="chatbot-send-btn"
              >
                <BsSend size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Builder Button - Only shown on home page */}
      {showResumeButton && (
        <motion.button
          onClick={() => {
            if (!userData) {
              setShowAuth(true);
              return;
            }
            navigate("/resume");
          }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="resume-builder-btn"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: '9998'
          }}
        >
          <BsFilePerson size={22} />
          <span>Resume Builder</span>
        </motion.button>
      )}

      <motion.button
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 90 : 0 }}
      >
        {isOpen ? <BsX size={24} /> : <BsChatDotsFill size={24} />}
      </motion.button>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

export default ChatBot;

