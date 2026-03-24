import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, MicOff, Settings, Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// Set up PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function App() {
  const [stage, setStage] = useState('idle'); // idle, processing, interviewing, finished
  const [resumeText, setResumeText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiMessage, setAiMessage] = useState('Hello! I\'m ready to start your interview. Please upload your resume to begin.');
  const [userTranscript, setUserTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  async function callOpenAI(messages) {
    if (!apiKey) {
      setAiMessage("Please enter your OpenAI API key in settings to continue.");
      setShowSettings(true);
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return "I'm having trouble connecting to my brain. Please check your API key.";
    }
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsListening(true);
    window.speechSynthesis.speak(utterance);
    
    // Start listening after speech
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  async function handleUserResponse(transcript) {
    if (!transcript.trim()) return;
    
    setIsListening(false);
    recognitionRef.current?.stop();
    
    const newHistory = [...chatHistory, { role: 'user', content: transcript }];
    setChatHistory(newHistory);
    
    setAiMessage("Thinking...");
    
    const response = await callOpenAI([
      { role: 'system', content: `You are an AI Interviewer. The candidate provided this resume: ${resumeText.substring(0, 2000)}. Continue the interview by asking follow-up questions or new topics based on their answers.` },
      ...newHistory
    ]);

    if (response) {
      setAiMessage(response);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      speak(response);
      setUserTranscript('');
    }
  }

  async function startInterview(resume) {
    setStage('interviewing');
    setAiMessage("Analyzing your profile...");
    
    const initialPrompt = `You are a professional AI Interviewer. Based on this resume, welcome the candidate and ask the first relevant interview question. Keep it concise.
    Resume: ${resume.substring(0, 3000)}`;

    const response = await callOpenAI([{ role: 'system', content: initialPrompt }]);
    if (response) {
      setAiMessage(response);
      speak(response);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStage('processing');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ');
        }
        
        setResumeText(fullText);
        startInterview(fullText);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      setAiMessage("Sorry, I couldn't read that resume. Please try another PDF.");
      setStage('idle');
    }
  };

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setUserTranscript(transcript);
        
        // Simple logic to detect end of speech for now (can be improved)
        if (event.results[event.results.length - 1].isFinal) {
          handleUserResponse(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  return (
    <div className="app-container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit className="text-gradient" size={32} />
          <h2 style={{ fontWeight: 700 }}>AI Interviewer</h2>
        </div>
        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={20} />
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card" 
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h3 style={{ marginBottom: '1rem' }}>Settings</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="password" 
                placeholder="OpenAI API Key" 
                value={apiKey} 
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('openai_api_key', e.target.value);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
              <button className="btn-primary" onClick={() => setShowSettings(false)}>Save</button>
            </div>
          </motion.div>
        )}

        {stage === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="hero-section"
          >
            <h1 className="hero-title">Master Your <span className="text-gradient">Interviews</span></h1>
            <p className="hero-subtitle">Upload your resume and practice with our adaptive AI interviewer. High-fidelity voice and context-aware questioning.</p>
            
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} className="text-gradient" style={{ marginBottom: '1rem' }} />
              <h3>Drop your PDF resume here</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>or click to browse</p>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept=".pdf" 
                onChange={handleFileUpload}
              />
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="interview-stage"
          >
            <RefreshCw className="text-gradient" size={64} style={{ animation: 'spin 2s linear infinite' }} />
            <h3 style={{ marginTop: '2rem' }}>Analyzing Resume...</h3>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {stage === 'interviewing' && (
          <motion.div 
            key="interviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="interview-stage"
          >
            <div className="voice-indicator">
              <div className="voice-orb"></div>
              {isListening && (
                <>
                  <div className="ring" style={{ animationDelay: '0s' }}></div>
                  <div className="ring" style={{ animationDelay: '0.5s' }}></div>
                  <div className="ring" style={{ animationDelay: '1s' }}></div>
                </>
              )}
            </div>

            <div className="caption-container">
              <motion.div 
                key={aiMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ai-bubble"
              >
                {aiMessage}
              </motion.div>
              
              <AnimatePresence>
                {userTranscript && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="user-caption"
                  >
                    "{userTranscript}"
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem' }}>
              <button 
                className={`btn-primary ${!isListening ? 'muted' : ''}`} 
                onClick={toggleListening}
                style={{ background: isListening ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)' }}
              >
                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                {isListening ? 'Listening...' : 'Stopped'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
