"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Mic, MicOff, CheckCircle, RefreshCcw, LogOut, 
  Loader2, Keyboard, Send, Volume2, Sparkles, AlertCircle, Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "subject";
  const subject = searchParams.get("subject") || "General";
  const difficulty = searchParams.get("difficulty") || "Intermediate";

  const [questionCount, setQuestionCount] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [aiText, setAiText] = useState("Initializing your AI interviewer...");
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [pastInteractions, setPastInteractions] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [qaPairs, setQaPairs] = useState<{question: string, transcript: string, orderIndex: number}[]>([]);
  const [saving, setSaving] = useState(false);

  const recognitionRef = useRef<any>(null);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")) && 
      v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const getNextQuestion = useCallback(async (currentTranscript?: string, currentCount?: number, activeResumeText?: string) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: currentTranscript || "",
          pastInteractions: pastInteractions,
          subject,
          difficulty,
          mode,
          resumeText: activeResumeText || resumeText,
          questionNumber: currentCount || questionCount,
          totalQuestions: 5,
        }),
      });

      const data = await res.json();
      setAiText(data.reply);
      speakText(data.reply);
      
      setPastInteractions(prev => [
        ...prev, 
        ...(currentTranscript ? [{ role: 'user' as const, text: currentTranscript }] : []),
        { role: 'ai' as const, text: data.reply }
      ]);

      if (currentTranscript && currentCount) {
        setQaPairs(prev => [
          ...prev,
          { 
            question: pastInteractions[pastInteractions.length - 1]?.text || "Opening Question", 
            transcript: currentTranscript, 
            orderIndex: currentCount - 1 
          }
        ]);
      }

    } catch (err) {
      toast.error("I encountered a connection error. Please check your internet.");
      setAiText("Connection problem. Please try responding again.");
    } finally {
      setIsThinking(false);
    }
  }, [pastInteractions, mode, subject, difficulty, questionCount, resumeText]);

  useEffect(() => {
    const initInterview = async () => {
      let rText = "";
      if (mode === "resume") {
        try {
          const res = await fetch("/api/resume/get");
          const data = await res.json();
          if (data.resumeText) {
            setResumeText(data.resumeText);
            rText = data.resumeText;
          }
        } catch (e) {
          toast.error("Could not load your resume for contextual questions.");
        }
      }
      const introMsg = `Hello! I am your AI interviewer, and I will be conducting your ${mode === "resume" ? "interview" : subject + " interview"} today. Please click Continue when you are ready to begin.`;
      setAiText(introMsg);
      speakText(introMsg);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    initInterview();

    if (typeof window !== "undefined" && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
    }
    
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
         window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      handleUserSubmission();
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        toast.error("Microphone access denied or not supported.");
      }
    }
  };

  const handleUserSubmission = async (text?: string) => {
    const finalAnswer = text || transcript;
    if (!finalAnswer.trim()) return;
    
    setTranscript("");

    if (questionCount < 5) {
      setQuestionCount(prev => prev + 1);
      getNextQuestion(finalAnswer, questionCount + 1);
    } else {
      setIsThinking(true);
      setInterviewFinished(true);
      setSaving(true);
      
      const finalQaPairs = [
        ...qaPairs,
        { 
          question: pastInteractions[pastInteractions.length - 1]?.text, 
          transcript: finalAnswer, 
          orderIndex: questionCount 
        }
      ];

      setAiText("Finalizing your feedback report. Please don't close the browser...");
      speakText("Thank you. I am now processing your report. Please hold for a moment.");
      
      saveSession(finalQaPairs);
    }
  };

  const saveSession = async (finalPairs: any[]) => {
    try {
      const res = await fetch("/api/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qaPairs: finalPairs,
          subject,
          difficulty,
          mode
        }),
      });
      const data = await res.json();
      if (data.sessionId) {
        router.push(`/report/${data.sessionId}`);
      } else {
        throw new Error("Report generation failed.");
      }
    } catch (err) {
      toast.error("AI report generation timed out. Your results were saved to history.");
      router.push("/history");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-slate-700/50">
      {/* Refined Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-blue-600/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-gradient-radial from-slate-600/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {saving && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 fixed"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: 2.5, repeat: Infinity }}
              className="mb-8"
            >
              <div className="relative">
                 <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400" />
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-4 text-slate-100">
              Generating Your Report
            </h2>
            <p className="text-slate-400 max-w-md text-base leading-relaxed font-light">
              Analyzing your responses and compiling personalized insights
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center mb-8 relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
             <Sparkles size={20} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium mb-1">Mode</div>
            <div className="font-light text-sm text-slate-100 flex items-center gap-3">
              <span className="capitalize">{mode}</span> 
              <span className="text-slate-600">—</span> 
              <span className="text-blue-400 font-medium">{subject}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push("/profile")} 
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 px-4 py-2.5 hover:bg-slate-800/40 rounded-lg border border-slate-800/50 transition-all duration-300"
        >
          <LogOut size={16} strokeWidth={1.5} /> 
          <span className="hidden sm:inline">Exit</span>
        </button>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full relative z-10">
         
        {/* Progress & Status */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="w-full mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-400 tracking-wide">
              Question <span className="text-blue-400 font-semibold">{questionCount}</span> of 5
            </div>
            <AnimatePresence mode="wait">
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-xs font-medium text-cyan-400"
                >
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /> 
                  AI Speaking
                </motion.div>
              )}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400"
                >
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-spin" /> 
                  Analyzing
                </motion.div>
              )}
              {!isSpeaking && !isThinking && !interviewFinished && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-xs font-medium text-emerald-400"
                >
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> 
                  Your Turn
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(questionCount / 5) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            />
          </div>
        </motion.div>

        {/* AI Message Card */}
        <motion.div 
          initial={{ scale: 0.98, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-8 sm:p-12 rounded-2xl mb-8 min-h-[320px] flex flex-col items-center justify-center"
        >
          {/* AI Avatar */}
          <div className={`mb-6 w-16 h-16 rounded-full flex items-center justify-center border border-slate-600/50 transition-all duration-500 ${
            isThinking ? 'bg-slate-700/60 shadow-lg shadow-slate-500/20' : 
            isSpeaking ? 'bg-slate-700/60 shadow-lg shadow-blue-500/20' : 
            'bg-slate-800/40'
          }`}>
            {isThinking ? (
              <RefreshCcw size={24} className="text-slate-300 animate-spin" strokeWidth={1.5} />
            ) : isSpeaking ? (
              <Volume2 size={24} className="text-blue-400" strokeWidth={1.5} />
            ) : (
              <Sparkles size={24} className="text-slate-400" strokeWidth={1.5} />
            )}
          </div>

          {/* AI Text */}
          <AnimatePresence mode="wait">
            <motion.p 
              key={aiText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-lg sm:text-xl leading-relaxed text-center text-slate-100 font-light max-w-3xl"
            >
              {isThinking && questionCount > 1 ? "Analyzing your response..." : aiText}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Transcript Display */}
        <AnimatePresence>
          {(transcript || (isListening && !transcript)) && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="w-full max-w-2xl mb-8 p-6 bg-slate-800/40 border border-blue-500/30 rounded-xl backdrop-blur-sm"
            >
              <p className="text-base text-slate-200 font-light text-center break-words">
                {transcript ? `"${transcript}"` : (
                  <span className="flex items-center justify-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Listening...
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {!interviewFinished && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-20 flex flex-col items-center gap-6 w-full max-w-sm"
          >
            {isIntroPhase ? (
              <button
                onClick={() => {
                  setIsIntroPhase(false);
                  getNextQuestion("", 1, resumeText);
                }}
                disabled={isSpeaking}
                className="w-full px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40"
              >
                Start Interview
              </button>
            ) : (
              <>
                <button 
                  onClick={toggleListen}
                  disabled={isThinking || isSpeaking}
                  className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 font-medium shadow-lg ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30 scale-100' 
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 hover:scale-105'
                  } ${(isThinking || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening && (
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-red-400 opacity-60"
                    />
                  )}
                  <Mic size={28} strokeWidth={1.5} className="relative z-10" />
                </button>
                <p className="text-xs font-medium text-slate-400 text-center">
                  {isListening ? "Click to stop" : "Click to record"}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Interview Complete Message */}
        {interviewFinished && !saving && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-light text-slate-100 mb-2">Interview Complete</h3>
            <p className="text-slate-400 font-light">Preparing your personalized report...</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={
       <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 2.5, repeat: Infinity }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400" />
          </motion.div>
          <p className="text-slate-400 font-light tracking-wide mt-4">Setting up interview environment</p>
       </div>
    }>
      <InterviewSessionContent />
    </Suspense>
  );
}
