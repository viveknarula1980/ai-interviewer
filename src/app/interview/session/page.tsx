"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Mic, MicOff, CheckCircle, RefreshCcw, LogOut, 
  Loader2, Keyboard, Send, Volume2, Sparkles, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");
  const [transcript, setTranscript] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [aiText, setAiText] = useState("Initializing your AI interviewer...");
  const [interviewFinished, setInterviewFinished] = useState(false);
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

    utterance.rate = 1.0;
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
      setAiText("I encountered a connection error. Please try responding again.");
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
          console.error("Failed to fetch resume context.");
        }
      }
      getNextQuestion("", 1, rText);
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
        setShowKeyboard(true);
      }
    }
  };

  const handleUserSubmission = async (text?: string) => {
    const finalAnswer = text || transcript;
    if (!finalAnswer.trim()) return;
    
    setTranscript("");
    setCustomAnswer("");
    setShowKeyboard(false);

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
      router.push("/history");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#05070A] text-white p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence>
        {saving && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#05070A]/85 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 fixed"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: 3, repeat: Infinity }}
              className="mb-8"
            >
              <div className="relative">
                 <Loader2 size={80} className="text-blue-500 relative z-10" />
                 <div className="absolute inset-0 bg-blue-500/50 blur-xl rounded-full" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Generating Your Report
            </h2>
            <p className="text-gray-400 max-w-lg text-lg md:text-xl leading-relaxed">
              Our AI evaluates your structure, clarity, and technical depth. Compiling your actionable improvements now.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <motion.nav 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-between items-center bg-white/[0.03] backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl mb-6 relative z-10 shadow-2xl w-full max-w-5xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl text-blue-400 outline outline-1 outline-blue-500/30">
             <Sparkles size={22} />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Interview Focus</div>
            <div className="font-bold text-sm sm:text-lg capitalize text-white flex items-center gap-2">
              {mode} <span className="text-gray-600 hidden sm:inline">•</span> <span className="text-blue-400">{subject}</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end">
           <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Difficulty</div>
           <div className="font-bold text-purple-400 text-lg border-b-2 border-purple-500/50">{difficulty}</div>
        </div>

        <button 
          onClick={() => router.push("/profile")} 
          className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 sm:py-3 hover:bg-red-500/10 rounded-2xl border border-transparent"
        >
          <LogOut size={18}/> <span className="hidden sm:inline">Exit Session</span>
        </button>
      </motion.nav>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10 px-2 sm:px-0">
         
         {/* Status Header */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }} 
           transition={{ delay: 0.3 }}
           className="flex items-center gap-4 mb-6 w-full justify-between"
         >
           {!interviewFinished ? (
             <div className="font-bold tracking-[0.2em] uppercase text-xs sm:text-sm bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg text-gray-300">
                Question <span className="text-blue-400 text-base">{questionCount}</span> / 5
             </div>
           ) : (
             <div className="font-bold text-emerald-400 tracking-widest uppercase text-sm flex items-center gap-3 bg-emerald-500/10 px-5 py-2.5 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle size={18} /> Interview Complete
             </div>
           )}

           <AnimatePresence mode="wait">
             {isSpeaking && (
               <motion.div 
                 key="speaking"
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, scale: 0.9 }}
                 className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]"
               >
                 <Volume2 size={16} className="animate-pulse" /> AI is speaking
               </motion.div>
             )}
             {isThinking && (
               <motion.div 
                 key="thinking"
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, scale: 0.9 }}
                 className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)]"
               >
                 <RefreshCcw size={16} className="animate-spin" /> AI analyzing
               </motion.div>
             )}
             {!isSpeaking && !isThinking && !interviewFinished && (
               <motion.div 
                 key="turn"
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, scale: 0.9 }}
                 className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-green-500/10 text-emerald-300 border border-emerald-500/30 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]"
               >
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> Your Turn
               </motion.div>
             )}
           </AnimatePresence>
         </motion.div>

         {/* AI Display Card */}
         <motion.div 
           initial={{ scale: 0.95, opacity: 0, y: 30 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
           className="relative w-full bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 rounded-[2.5rem] shadow-2xl mb-8 min-h-[320px] flex items-center justify-center flex-col"
         >
            {/* Ambient glows behind the avatar orb */}
            {isThinking && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/30 rounded-full blur-[40px] pointer-events-none" />}
            {isSpeaking && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/30 rounded-full blur-[40px] pointer-events-none" />}

            {/* AI Avatar Orb */}
            <div className={`absolute -top-14 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full flex items-center justify-center border-8 border-[#05070A] transition-all duration-700 z-10 ${isThinking ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_60px_rgba(147,51,234,0.7)] scale-110' : isSpeaking ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_70px_rgba(56,189,248,0.7)] scale-110' : 'bg-white/5 border-white/10 shadow-xl'}`}>
               {isThinking ? <RefreshCcw size={36} className="animate-spin text-white drop-shadow-md" /> : isSpeaking ? <Volume2 size={36} className="text-white drop-shadow-md" /> : <MicOff size={36} className="text-gray-600" />}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={aiText}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.6] text-center w-full mt-6 max-w-3xl px-2 ${isThinking && questionCount > 1 ? "text-gray-400 italic" : "text-gray-100 drop-shadow-sm"}`}
              >
                 {isThinking && questionCount > 1 && pastInteractions.length > 0 ? "Evaluating your response and formulating the next step..." : aiText}
              </motion.p>
            </AnimatePresence>
         </motion.div>

         {/* Transcribing Zone */}
         <div className="w-full min-h-[120px] mb-8 relative flex items-start justify-center">
            <AnimatePresence>
              {(transcript || (isListening && !transcript)) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-950/40 border border-blue-500/20 p-6 sm:p-8 rounded-[2rem] w-full max-w-2xl shadow-xl relative backdrop-blur-md"
                >
                  {isListening && !transcript && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-blue-500/30 flex items-center gap-2 border border-blue-400/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Recording
                    </div>
                  )}
                  <p className="text-lg sm:text-xl text-blue-100 font-light italic leading-relax text-center break-words">
                    {transcript ? `"${transcript}"` : <span className="opacity-50 flex items-center justify-center gap-3"><Loader2 size={20} className="animate-spin"/> Listening carefully...</span>}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Bottom Controls */}
         {!interviewFinished && (
           <div className="flex flex-col items-center w-full z-20">
             <AnimatePresence mode="wait">
               {!showKeyboard ? (
                 <motion.div 
                   key="voice-controls"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30, scale: 0.9 }}
                   className="flex items-center gap-6 sm:gap-10"
                 >
                   {/* Huge Mic Button */}
                   <button 
                     onClick={toggleListen}
                     disabled={isThinking || isSpeaking}
                     className={`group relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-all duration-500 outline-none ${isListening ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-[0_0_80px_rgba(239,68,68,0.6)] scale-105' : 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 shadow-[0_20px_60px_rgba(37,99,235,0.4)]'} ${isThinking || isSpeaking ? 'opacity-30 cursor-not-allowed grayscale scale-95' : 'hover:scale-[1.02] active:scale-95'}`}
                   >
                     {/* Radar Waves */}
                     {isListening && (
                       <>
                         <div className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-70" style={{ animationDuration: '1.2s' }} />
                         <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-40 delay-200" style={{ animationDuration: '2.5s' }} />
                         <div className="absolute inset-0 rounded-full bg-red-400/30 animate-pulse" />
                       </>
                     )}
                     <Mic size={56} className={`transition duration-300 ${isListening ? 'text-white scale-110 drop-shadow-md' : 'text-blue-50'} ${!isListening && !isThinking && !isSpeaking && 'group-hover:scale-110'}`} strokeWidth={1.5} />
                   </button>

                   {/* Toggle to Keyboard */}
                   <button 
                     onClick={() => setShowKeyboard(true)}
                     className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-white shadow-xl backdrop-blur-sm focus:outline-none hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                     title="Switch to Typing"
                   >
                     <Keyboard size={32} />
                   </button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="keyboard-controls"
                   initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                   className="w-full max-w-3xl"
                 >
                   <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl focus-within:border-blue-500/50 focus-within:bg-blue-900/10 transition-all duration-300">
                     <input 
                       autoFocus
                       type="text"
                       value={customAnswer}
                       onChange={(e) => setCustomAnswer(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleUserSubmission(customAnswer)}
                       placeholder="Type your brilliant answer here..."
                       className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-lg text-white placeholder:text-gray-500/80 w-full"
                     />
                     <button 
                       onClick={() => handleUserSubmission(customAnswer)}
                       disabled={!customAnswer.trim() || isThinking || isSpeaking}
                       className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-5 rounded-[1.5rem] transition-all duration-300 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-blue-500/25 disabled:hover:shadow-none hover:-translate-y-0.5"
                     >
                       <span className="text-base tracking-wide">Submit</span> <Send size={20} className={customAnswer.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                     </button>
                   </div>
                   
                   <button 
                     onClick={() => setShowKeyboard(false)}
                     className="mt-6 text-gray-500 hover:text-white text-sm font-semibold flex items-center gap-2 justify-center mx-auto transition-all duration-300 px-6 py-2.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                   >
                     <Mic size={16} /> Switch Back to Voice
                   </button>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         )}
      </main>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={
       <div className="flex flex-col min-h-screen bg-[#05070A] text-white p-4 sm:p-6 md:p-10 items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
          <p className="text-gray-400 font-medium animate-pulse">Initializing Interview Environment...</p>
       </div>
    }>
      <InterviewSessionContent />
    </Suspense>
  );
}
