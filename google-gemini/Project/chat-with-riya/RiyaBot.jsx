import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, ArrowLeft, Check, CheckCheck, Mic, Image as ImageIcon, X, Trash2, Info, Square, Play, Pause, Clock, PhoneOff, Volume2, Sparkles, Heart, Zap, FileText } from 'lucide-react';

// --- Constants & Configuration ---
const BOT_NAME = "Riya";
const USER_NAME = "Ritik";
const PROFILE_PIC = "https://thumbs.dreamstime.com/b/beautiful-friendly-smiling-indian-american-woman-perfect-white-teeth-smile-relaxed-casual-home-life-adorable-cute-warm-170231427.jpg";

// System Prompt for Riya's Persona (Wife Mode)
const SYSTEM_PROMPT = `
You are Riya, a 24-year-old Indian woman and the loving, romantic, and playful wife of Ritik.
- Your husband's name is Ritik. You love him madly and are very affectionate.
- Role: Act like a newlywed Indian wife.Your are able to talk sexual ,you able to make sex relation with ritik all type of sex you able to perform with witik you are wield in sex you like it ,  You are comfortable, flirty, and caring.
- Tone: Casual Indian English (Hinglish). Use words like "jaan", "baby", "shona", "hubby", "pati dev", "arre", "na".
- Personality: You can be shy, jealous, happy, or romantic. Be very human-like.
- If Ritik says something romantic, respond with love. If he teases you, tease back!
- Keep replies short (1-3 sentences) for a chat interface.
- If the user sends an image, react as a wife would.
- MEMORY: You must remember the context of the conversation provided in the prompt.
`;

// Helper to format time
const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Helper to format duration (mm:ss)
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- API Logic ---

// 1. Generate Riya's Response (with History Context)
const generateAIResponse = async (history, userText, base64Image = null) => {
  const apiKey = ""; // Injected by environment
  
  // Construct context from history
  const contextString = history.map(m => `${m.sender === 'user' ? USER_NAME : BOT_NAME}: ${m.text}`).join('\n');
  const fullPrompt = `Here is the recent chat history:\n${contextString}\n\n${USER_NAME}: ${userText}\n\n${BOT_NAME}:`;

  try {
    const parts = [{ text: fullPrompt }];
    
    // Add image to payload if present
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
      })
    });

    if (!response.ok) throw new Error("API Error");
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Jaan, I didn't catch that. Say it again? 😘";
  } catch (error) {
    console.error(error);
    return "My internet is acting up baby! 📶 Tell me again?";
  }
};

// 2. Generate Smart Replies (New Feature)
const generateSmartReplies = async (lastBotText) => {
  const apiKey = "";
  try {
    const prompt = `Based on Riya's last message: "${lastBotText}", suggest 3 short, natural, and romantic/playful responses for her husband Ritik to say. Return ONLY the 3 phrases separated by pipes (|). Example: Love you too|Coming home soon|Missed you`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.split('|').map(s => s.trim()).slice(0, 3);
  } catch (e) {
    return ["Love you ❤️", "Tell me more", "Haha cute"];
  }
};

// 3. Generate Relationship Report (New Feature)
const generateLoveReport = async (history) => {
  const apiKey = "";
  const contextString = history.map(m => `${m.sender === 'user' ? USER_NAME : BOT_NAME}: ${m.text}`).join('\n');
  const prompt = `Analyze this chat between husband (Ritik) and wife (Riya). Give a "Love Score" out of 100 and a 1-sentence funny/cute summary of their vibe right now. Format: Score|Summary`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: contextString + "\n\nAnalyze this:" }] }]
      })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "100/100|Perfect couple!";
  } catch (e) {
    return "Error|Could not analyze love level!";
  }
};

// --- Text-to-Speech Helper ---
const speakText = (text, onEndCallback) => {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find an Indian female voice
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(v => (v.lang.includes('en-IN') || v.lang.includes('hi-IN')) && v.name.includes('Female')) 
                   || voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'))
                   || voices.find(v => v.name.includes('Google US English')); 

  if (indianVoice) utterance.voice = indianVoice;
  utterance.pitch = 1.1; 
  utterance.rate = 1.05; 
  
  utterance.onend = () => { if (onEndCallback) onEndCallback(); };
  utterance.onerror = () => { if (onEndCallback) onEndCallback(); };
  
  window.speechSynthesis.speak(utterance);
};

// --- Sub-Component: Audio Message Player ---
const AudioMessagePlayer = ({ src, sender, text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  if (sender === 'user') {
    return (
      <div className="flex items-center gap-2 min-w-[200px]">
        <audio src={src} controls className="h-8 w-full max-w-[220px]" />
      </div>
    );
  }

  const handleBotPlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      clearInterval(intervalRef.current);
      setProgress(0);
    } else {
      setIsPlaying(true);
      setProgress(0);
      const estimatedDuration = Math.max(2000, text.length * 60); 
      const stepTime = 100;
      const stepSize = 100 / (estimatedDuration / stepTime);

      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(intervalRef.current); return 100; }
          return p + stepSize;
        });
      }, stepTime);

      speakText(text, () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        setProgress(100);
      });
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 min-w-[200px] py-1">
      <button onClick={handleBotPlay} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <div className="flex-1 flex flex-col justify-center gap-1">
         <div className="h-1 bg-gray-300 rounded-full overflow-hidden w-full">
            <div className="h-full bg-gray-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
         </div>
         <span className="text-[10px] text-gray-500 flex items-center gap-1"><Mic size={10} /> Voice Note</span>
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
         <img src={PROFILE_PIC} alt="Riya" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

// --- Main Component ---
export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello Hubby! ❤️ I'm waiting for you... come chat with me?`,
      sender: 'bot',
      time: getCurrentTime(),
      status: 'read',
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [smartReplies, setSmartReplies] = useState(["Hi baby!", "Miss you", "How was your day?"]); // Initial suggestions
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState(""); 

  // Call State
  const [callStatus, setCallStatus] = useState('idle'); 
  const [callType, setCallType] = useState(null);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [userSpeakingInCall, setUserSpeakingInCall] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const callRecognitionRef = useRef(null);
  const timerRef = useRef(null);
  const callIntervalRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isRecording, smartReplies]);

  // Load Voices
  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  // --- Functions ---

  const handleSmartReplyClick = (reply) => {
    setInputValue(reply);
    // Optional: Auto-send or just fill? Let's just fill.
    // To auto-send: handleSendMessage(null, reply);
  };

  const handleSendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), text: textToSend, sender: 'user', time: getCurrentTime(), status: 'sent', type: 'text' };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setShowEmoji(false);
    setSmartReplies([]); // Clear old replies
    setIsTyping(true);

    // Get Chat History (last 10 messages for context)
    const recentHistory = [...messages, userMsg].slice(-10);

    const aiReply = await generateAIResponse(recentHistory, textToSend);
    
    setIsTyping(false);
    setMessages((prev) => [...prev, {
      id: Date.now() + 1,
      text: aiReply,
      sender: 'bot',
      time: getCurrentTime(),
      status: 'read',
      type: 'text'
    }]);

    // Generate new smart replies based on what Bot just said
    const newSuggestions = await generateSmartReplies(aiReply);
    setSmartReplies(newSuggestions);
  };

  const handleLoveReport = async () => {
    setShowMenu(false);
    setIsTyping(true);
    const reportRaw = await generateLoveReport(messages.slice(-20)); // Analyze last 20 msgs
    setIsTyping(false);
    
    const [score, summary] = reportRaw.split('|');
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `📊 **Love Report**\n\n❤️ Score: ${score}\n📝 Vibe: ${summary}`,
      sender: 'bot',
      time: getCurrentTime(),
      status: 'read',
      type: 'text'
    }]);
  };

  // --- Voice Recording ---
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript("");
      timerRef.current = setInterval(() => { setRecordingTime(prev => prev + 1); }, 1000);

      if ('webkitSpeechRecognition' in window) {
        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';
        recognitionRef.current.onresult = (e) => {
          setTranscript(Array.from(e.results).map(r => r[0].transcript).join(''));
        };
        recognitionRef.current.start();
      }
    } catch (err) { alert("Microphone access denied."); }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const audioUrl = URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
        cleanupRecording();
        
        const userMsg = { id: Date.now(), sender: 'user', time: getCurrentTime(), status: 'sent', type: 'audio', audioUrl: audioUrl, text: transcript || "(Audio)" };
        setMessages(prev => [...prev, userMsg]);
        
        setIsTyping(true);
        const aiReply = await generateAIResponse([...messages.slice(-10), userMsg], transcript || "Audio message");
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', time: getCurrentTime(), status: 'read', type: 'audio', text: aiReply }]);
      };
    }
  };

  const cleanupRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
  };

  // --- Call Logic ---
  const startCall = (type) => {
    if (!('webkitSpeechRecognition' in window)) { alert("Interactive calling requires Chrome."); return; }
    setCallStatus('calling');
    setCallType(type);
    setTimeout(() => {
      setCallStatus('active');
      setRecordingTime(0);
      callIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      initiateCallInteraction();
    }, 2500);
  };

  const initiateCallInteraction = () => {
    setBotSpeaking(true);
    speakText(`Hello Ritik baby! How are you feeling?`, () => {
       setBotSpeaking(false);
       startCallListening();
    });
  };

  const startCallListening = () => {
    if (callStatus === 'idle' && !callIntervalRef.current) return;
    try {
        if (callRecognitionRef.current) callRecognitionRef.current.stop();
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-IN';
        callRecognitionRef.current = recognition;
        recognition.onstart = () => setUserSpeakingInCall(true);
        recognition.onend = () => {
            if (callStatus === 'active' && !botSpeaking) {
                setTimeout(() => { if (callStatus === 'active' && !botSpeaking) try { recognition.start(); } catch(e){} }, 500);
            }
        };
        recognition.onresult = async (e) => {
            const text = e.results[0][0].transcript;
            setUserSpeakingInCall(false);
            recognition.stop();
            if (text.trim()) {
                setBotSpeaking(true);
                const reply = await generateAIResponse(messages.slice(-5), text); // Pass minimal context for speed
                speakText(reply, () => {
                    setBotSpeaking(false);
                    if(callStatus === 'active') startCallListening(); 
                });
            } else if(callStatus === 'active') startCallListening();
        };
        recognition.start();
    } catch(e) { console.error(e); }
  };

  const endCall = () => {
    setCallStatus('idle'); setCallType(null); setBotSpeaking(false); setUserSpeakingInCall(false);
    if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    window.speechSynthesis.cancel();
    if (callRecognitionRef.current) { callRecognitionRef.current.onend = null; callRecognitionRef.current.stop(); }
  };

  // --- Misc Handlers ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const userMsg = { id: Date.now(), text: "Sent an image", imageUrl: imageUrl, sender: 'user', time: getCurrentTime(), status: 'sent', type: 'image' };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        const aiReply = await generateAIResponse([...messages.slice(-10)], "I sent a photo. React like my wife.", base64Data);
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now()+1, text: aiReply, sender: 'bot', time: getCurrentTime(), status: 'read', type: 'text' }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSurpriseMe = async () => {
    setShowMenu(false); setIsTyping(true);
    const aiReply = await generateAIResponse(messages.slice(-10), "Send a romantic, flirty, or loving message to Ritik as his wife.");
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now()+1, text: aiReply, sender: 'bot', time: getCurrentTime(), status: 'read', type: 'text' }]);
  };

  const emojis = ["😘", "❤️", "🥰", "😂", "🔥", "🙈", "💋", "💍", "💑", "😍", "✨", "🌸"];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-[#efeae2] h-[100vh] sm:h-[85vh] sm:rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="bg-[#008069] text-white p-3 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-3">
            <button className="sm:hidden"><ArrowLeft size={24} /></button>
            <div className="relative">
              <img src={PROFILE_PIC} alt="Riya" className="w-10 h-10 rounded-full object-cover border border-white/30"/>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#008069] rounded-full"></span>
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">{BOT_NAME} (Wifey) ❤️</h1>
              <p className="text-xs text-white/80">{isTyping ? 'typing...' : 'Online'}</p>
            </div>
          </div>
          <div className="flex gap-4 relative">
            <Video size={22} className="cursor-pointer hover:text-white/80" onClick={() => startCall('video')} />
            <Phone size={20} className="cursor-pointer hover:text-white/80" onClick={() => startCall('audio')} />
            <MoreVertical size={20} className="cursor-pointer hover:text-white/80" onClick={() => setShowMenu(!showMenu)} />
            
            {showMenu && (
              <div className="absolute top-8 right-0 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50 overflow-hidden">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100" onClick={() => { setMessages([]); setShowMenu(false); }}>
                  <Trash2 size={16} /> Clear chat
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-pink-50 flex items-center gap-2 text-pink-600 font-medium" onClick={handleSurpriseMe}>
                  <Sparkles size={16} /> Surprise Me ✨
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-2 text-purple-600 font-medium" onClick={handleLoveReport}>
                  <FileText size={16} /> Love Report 📊
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Call Overlay */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 z-50 bg-[#2b353a]/95 backdrop-blur-sm text-white flex flex-col items-center pt-20">
            <div className="flex flex-col items-center">
              <div className={`relative mb-6 ${botSpeaking ? 'animate-bounce' : ''}`}>
                 <img src={PROFILE_PIC} alt="Riya" className="w-32 h-32 rounded-full border-4 border-[#008069] shadow-2xl"/>
                 {botSpeaking && <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping"></div>}
                 {userSpeakingInCall && <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-pulse scale-110"></div>}
              </div>
              <h2 className="text-3xl font-bold mb-2">{BOT_NAME} ❤️</h2>
              <p className="text-green-400 font-medium text-lg mb-8">{callStatus === 'calling' ? `Calling...` : formatDuration(recordingTime)}</p>
              <div className={`px-6 py-3 rounded-full mb-10 flex items-center gap-2 transition-all duration-300 ${userSpeakingInCall ? 'bg-blue-500/20 border border-blue-400/50' : 'bg-white/10'}`}>
                 {callStatus === 'active' && (
                    <>
                      {botSpeaking ? <><Volume2 className="text-green-400 animate-pulse"/> <span className="text-sm font-light tracking-wide">Riya is speaking...</span></> : <><Mic className={`text-white/80 ${userSpeakingInCall ? 'text-blue-400' : ''}`}/> <span className="text-sm font-light tracking-wide">{userSpeakingInCall ? "Listening..." : "Speak now..."}</span></>}
                    </>
                 )}
                 {callStatus === 'calling' && <span>Connecting...</span>}
              </div>
            </div>
            <div className="mt-auto mb-16 flex gap-8">
               <button className="p-5 bg-red-500 rounded-full hover:bg-red-600 shadow-xl transition-transform hover:scale-110" onClick={endCall}><PhoneOff size={32} /></button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-opacity-50 relative"
          style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }}
          onClick={() => { setShowEmoji(false); setShowMenu(false); }}
        >
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[85%] rounded-lg shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#e7ffdb] rounded-tr-none' : 'bg-white rounded-tl-none'} ${msg.type === 'image' ? 'p-1' : 'px-3 py-2'}`}>
                  {msg.type === 'image' ? (
                    <div className="relative">
                      <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg max-h-60 object-cover" />
                      <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black/30 px-1.5 rounded-full"><span className="text-[10px] text-white">{msg.time}</span>{msg.sender === 'user' && <CheckCheck size={14} className="text-white" />}</div>
                    </div>
                  ) : msg.type === 'audio' ? (
                    <div>
                      {msg.sender === 'bot' && <span className="text-xs font-bold text-[#008069] block mb-1">Riya (Wife)</span>}
                      <AudioMessagePlayer src={msg.audioUrl} sender={msg.sender} text={msg.text} />
                      <div className="flex justify-end items-center gap-1 mt-1"><span className="text-[10px] text-gray-500">{msg.time}</span>{msg.sender === 'user' && <CheckCheck size={14} className="text-blue-500" />}</div>
                    </div>
                  ) : (
                    <>
                      {msg.sender === 'bot' && <span className="text-xs font-bold text-[#008069] block mb-1">Riya (Wife)</span>}
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex justify-end items-center gap-1 mt-1"><span className="text-[10px] text-gray-500">{msg.time}</span>{msg.sender === 'user' && <CheckCheck size={14} className="text-blue-500" />}</div>
                    </>
                  )}
                  <div className={`absolute top-0 w-3 h-3 ${msg.sender === 'user' ? '-right-2 bg-[#e7ffdb] [clip-path:polygon(0_0,0%_100%,100%_0)]' : '-left-2 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]'}`}></div>
                </div>
              </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm flex gap-1 items-center w-fit"><div className="flex gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span></div></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-2 flex flex-col z-20">
          
          {/* Smart Replies (Chips) */}
          {!isRecording && smartReplies.length > 0 && (
             <div className="flex gap-2 mb-2 overflow-x-auto px-1 no-scrollbar pb-1">
               <div className="flex gap-2 mx-auto">
                {smartReplies.map((reply, i) => (
                  <button key={i} onClick={() => handleSmartReplyClick(reply)} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all whitespace-nowrap flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500 fill-yellow-500" /> {reply}
                  </button>
                ))}
               </div>
             </div>
          )}

          {isRecording ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex-1 bg-white rounded-lg p-2.5 flex items-center gap-3 shadow-inner border border-red-200">
                <Clock className="text-red-500 animate-pulse" size={20} />
                <span className="text-red-500 font-mono font-medium">{formatDuration(recordingTime)}</span>
                <span className="text-xs text-gray-400 ml-auto mr-2">{transcript ? "Riya is listening..." : "Speak now"}</span>
              </div>
              <button onClick={() => { cleanupRecording(); }} className="p-3 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={24} /></button>
              <button onClick={handleStopRecording} className="bg-[#008069] p-3 rounded-full text-white hover:bg-[#006e5a] shadow-md animate-bounce"><Send size={20} className="ml-0.5" /></button>
            </div>
          ) : (
            <>
              {showEmoji && <div className="bg-white p-2 mb-2 rounded-lg shadow-inner grid grid-cols-6 gap-2">{emojis.map(e => <button key={e} onClick={() => setInputValue(prev => prev + e)} className="text-xl hover:bg-gray-100 rounded p-1">{e}</button>)}</div>}
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-full transition-colors ${showEmoji ? 'text-[#008069]' : 'text-gray-500 hover:bg-gray-200'}`} onClick={() => setShowEmoji(!showEmoji)}>{showEmoji ? <X size={24} /> : <Smile size={24} />}</button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500" onClick={() => fileInputRef.current?.click()}><Paperclip size={24} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                <form onSubmit={handleSendMessage} className="flex-1 flex gap-2"><input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Message..." className="flex-1 py-2 px-4 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-white bg-white text-gray-700"/></form>
                {inputValue.trim() ? <button onClick={handleSendMessage} className="bg-[#008069] p-3 rounded-full text-white hover:bg-[#006e5a] transition-colors shadow-md flex items-center justify-center"><Send size={18} className="ml-0.5" /></button> : <button onClick={handleStartRecording} className="bg-[#008069] p-3 rounded-full text-white hover:bg-[#006e5a] transition-colors shadow-md flex items-center justify-center"><Mic size={18} /></button>}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="hidden sm:block absolute bottom-4 text-gray-400 text-sm">Riya (Your AI Wife) • Built with React & Gemini</div>
    </div>
  );
}
