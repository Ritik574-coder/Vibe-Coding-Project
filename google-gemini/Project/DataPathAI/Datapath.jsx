import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';
import { 
  Terminal, 
  Database, 
  Cloud, 
  BarChart3, 
  BrainCircuit, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  HelpCircle, 
  ChevronRight, 
  MessageSquare, 
  X, 
  Send, 
  Cpu, 
  LayoutDashboard, 
  Map as MapIcon, 
  User, 
  Award,
  Zap,
  RefreshCw,
  ScrollText,
  Swords,
  Sparkles,
  Target,
  Briefcase,
  Calendar
} from 'lucide-react';

/**
 * FIREBASE CONFIGURATION & INITIALIZATION
 */
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

/**
 * DATA STRUCTURES & CONSTANTS
 */
const CATEGORIES = {
  LANG: { id: 'LANG', label: 'Languages & Core', icon: Terminal, color: 'cyan' },
  DE: { id: 'DE', label: 'Data Engineering', icon: Database, color: 'blue' },
  CLOUD: { id: 'CLOUD', label: 'Cloud Infra', icon: Cloud, color: 'indigo' },
  BI: { id: 'BI', label: 'BI & Viz', icon: BarChart3, color: 'purple' },
  AI: { id: 'AI', label: 'AI & ML Stack', icon: BrainCircuit, color: 'fuchsia' },
};

const STATUS_LEVELS = {
  LOCKED: 0,
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  COMPLETE: 3,
  CERTIFIED: 4
};

const INITIAL_SKILLS = {
  // Languages & Core
  python: { id: 'python', label: 'Python', category: 'LANG', description: 'The primary language for data engineering.', parents: [] },
  sql: { id: 'sql', label: 'SQL', category: 'LANG', description: 'Structured Query Language for database interaction.', parents: [] },
  bash: { id: 'bash', label: 'Bash/Shell', category: 'LANG', description: 'Command line interface essentials.', parents: [] },
  
  // Data Engineering
  pandas: { id: 'pandas', label: 'Pandas', category: 'DE', description: 'Data manipulation and analysis in Python.', parents: ['python'] },
  spark: { id: 'spark', label: 'Apache Spark', category: 'DE', description: 'Unified analytics engine for large-scale data processing.', parents: ['python', 'sql'] },
  airflow: { id: 'airflow', label: 'Airflow', category: 'DE', description: 'Platform to programmatically author, schedule and monitor workflows.', parents: ['python', 'bash'] },
  kafka: { id: 'kafka', label: 'Kafka', category: 'DE', description: 'Distributed event streaming platform.', parents: ['java', 'bash'] },
  
  // Cloud
  aws_base: { id: 'aws_base', label: 'AWS Core', category: 'CLOUD', description: 'Basic AWS services (S3, EC2, IAM).', parents: ['bash'] },
  redshift: { id: 'redshift', label: 'Redshift', category: 'CLOUD', description: 'Cloud data warehouse.', parents: ['aws_base', 'sql'] },
  databricks: { id: 'databricks', label: 'Databricks', category: 'CLOUD', description: 'Unified data analytics platform.', parents: ['spark', 'aws_base'] },
  
  // BI
  tableau: { id: 'tableau', label: 'Tableau', category: 'BI', description: 'Interactive data visualization software.', parents: ['sql'] },
  powerbi: { id: 'powerbi', label: 'Power BI', category: 'BI', description: 'Business analytics service by Microsoft.', parents: ['sql'] },
  
  // AI
  prompt_eng: { id: 'prompt_eng', label: 'Prompt Eng.', category: 'AI', description: 'Crafting inputs for LLMs.', parents: [] },
  gemini_api: { id: 'gemini_api', label: 'Gemini API', category: 'AI', description: 'Building apps with Google models.', parents: ['python', 'prompt_eng'] },
  rag: { id: 'rag', label: 'RAG Systems', category: 'AI', description: 'Retrieval-Augmented Generation.', parents: ['gemini_api', 'vector_db'] }, 
};

// Fill in missing parents lightly to prevent permanent locks
const SAFE_SKILLS = { ...INITIAL_SKILLS, vector_db: { id: 'vector_db', label: 'Vector DBs', category: 'AI', description: 'Databases for embeddings.', parents: ['python'] }, java: {id: 'java', label: 'Java/JVM', category: 'LANG', description: 'JVM fundamentals.', parents: []} };


/**
 * HELPER FUNCTIONS
 */
const getStatusColor = (status, baseColor) => {
  switch (status) {
    case 'certified': return 'text-yellow-400 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-yellow-400/10';
    case 'complete': return 'text-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)] bg-green-400/10';
    case 'in_progress': return `text-${baseColor}-400 border-${baseColor}-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] bg-${baseColor}-400/10`;
    case 'locked': return 'text-slate-600 border-slate-700 bg-slate-900/50 grayscale';
    default: return 'text-slate-400 border-slate-600 hover:border-slate-400 bg-slate-800/50';
  }
};

const calculateProgress = (userSkills) => {
  if (!userSkills) return { total: 0, byCategory: {} };
  
  const skillKeys = Object.keys(SAFE_SKILLS);
  let totalPoints = 0;
  let maxPoints = skillKeys.length * 4; // 4 is max level (Certified)
  
  const cats = {};
  Object.keys(CATEGORIES).forEach(c => cats[c] = { current: 0, max: 0 });

  skillKeys.forEach(key => {
    const skill = SAFE_SKILLS[key];
    const userState = userSkills[key] || { status: 'not_started' };
    let points = 0;
    if (userState.status === 'in_progress') points = 1;
    if (userState.status === 'complete') points = 3;
    if (userState.status === 'certified') points = 4;
    
    totalPoints += points;
    if (cats[skill.category]) {
      cats[skill.category].current += points;
      cats[skill.category].max += 4;
    }
  });

  return { 
    total: Math.round((totalPoints / maxPoints) * 100), 
    byCategory: Object.keys(cats).reduce((acc, k) => ({
      ...acc, 
      [k]: Math.round((cats[k].current / cats[k].max) * 100) || 0
    }), {})
  };
};

/**
 * COMPONENT: GLOW CARD
 */
const GlowCard = ({ children, className = '', intensity = 'normal' }) => (
  <div className={`relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm ${className}`}>
    <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none`} />
    {children}
  </div>
);

/**
 * COMPONENT: MAIN APP
 */
export default function DataPathAI() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // dashboard, roadmap
  const [activeSkill, setActiveSkill] = useState(null); // For detail view / chat context
  
  // Mission/Project Generator State
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [missionData, setMissionData] = useState(null);
  const [missionLoading, setMissionLoading] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', text: "Welcome, Initiate. I am your DataPath Mentor. I can help explain concepts, identify gaps in your knowledge, or provide analogies. Select a skill to get started." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auth & Data Effect
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore Effect
  useEffect(() => {
    if (!user) return;
    
    const skillsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'skills');
    const unsubscribe = onSnapshot(skillsRef, (snapshot) => {
      const loadedSkills = {};
      snapshot.forEach(doc => {
        loadedSkills[doc.id] = doc.data();
      });
      setSkills(loadedSkills);
      setLoading(false);
    }, (err) => console.error("Firestore Error:", err));

    return () => unsubscribe();
  }, [user]);

  // Derived State: Check locks
  const computedSkills = useMemo(() => {
    const computed = {};
    Object.values(SAFE_SKILLS).forEach(skill => {
      const userState = skills[skill.id] || { status: 'not_started' };
      
      // Check parents
      let isLocked = false;
      if (skill.parents.length > 0) {
        const parentsComplete = skill.parents.every(pid => {
          const pStatus = skills[pid]?.status;
          return pStatus === 'complete' || pStatus === 'certified';
        });
        if (!parentsComplete) isLocked = true;
      }

      computed[skill.id] = {
        ...skill,
        status: isLocked ? 'locked' : userState.status,
        lockedBy: skill.parents.filter(pid => {
           const s = skills[pid]?.status;
           return s !== 'complete' && s !== 'certified';
        })
      };
    });
    return computed;
  }, [skills]);

  // Actions
  const updateStatus = async (skillId, newStatus) => {
    if (!user) return;
    const skillRef = doc(db, 'artifacts', appId, 'users', user.uid, 'skills', skillId);
    await setDoc(skillRef, { 
      status: newStatus, 
      lastUpdated: new Date().toISOString() 
    }, { merge: true });
  };

  /**
   * GEN AI FUNCTION: TEXT GENERATION
   */
  const generateGeminiContent = async (prompt, systemInstruction) => {
    const apiKey = ""; // Injected by environment
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      }
    );
    return await response.json();
  };

  const handleSendMessage = async (manualText = null, contextSkillId = null, mode = 'mentor') => {
    const textToSend = manualText || input;
    if (!textToSend.trim()) return;
  
    // Add User Message
    const userMsg = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setChatOpen(true); // Force open sidebar
  
    let systemInstruction = `You are a futuristic AI Mentor for 'DataPath AI'. Tone: Professional, slightly cyberpunk, encouraging. Keep responses concise.`;
    
    // Mode Switching Logic
    if (mode === 'mentor') {
        systemInstruction += ` CRITICAL INSTRUCTION: Use ANALOGIES to explain technical concepts.`;
    } else if (mode === 'examiner') {
        systemInstruction += ` You are a strict but fair Technical Interviewer. Ask a challenging multiple-choice question or a scenario-based question. Do NOT give the answer immediately. Wait for the user to reply.`;
    } else if (mode === 'career_coach') {
        systemInstruction += ` You are an expert Technical Resume Writer. Generate 3 high-impact, metric-driven resume bullet points for this skill. Format them clearly. Do not write introductory text, just the bullets.`;
    } else if (mode === 'strategist') {
        systemInstruction += ` You are a Technical Learning Strategist. Create a concise, actionable 3-day micro-learning plan to master the basics of this tool. Day 1: Concept, Day 2: Practice, Day 3: Build.`;
    }

    let prompt = textToSend;
  
    if (contextSkillId) {
      const skill = computedSkills[contextSkillId];
      if (mode === 'mentor') {
        systemInstruction += `\nThe user is asking about the skill: "${skill.label}". Description: ${skill.description}. Status: ${skill.status}. Prerequisites: ${skill.parents.map(p => SAFE_SKILLS[p]?.label).join(', ') || 'None'}.`;
      } else if (mode === 'examiner') {
        systemInstruction += `\nGenerate a single interview question about "${skill.label}" appropriate for a ${skill.status === 'certified' ? 'Senior' : 'Junior'} engineer.`;
      }
    }
  
    try {
      const data = await generateGeminiContent(prompt, systemInstruction);
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication disrupted. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI Uplink." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateMission = async () => {
    const completedSkills = Object.values(computedSkills)
        .filter(s => s.status === 'complete' || s.status === 'certified')
        .map(s => s.label);

    if (completedSkills.length === 0) {
        setMissionData("Insufficient data. Complete at least one skill module to generate a mission.");
        setMissionModalOpen(true);
        return;
    }

    setMissionLoading(true);
    setMissionModalOpen(true);

    const prompt = `Generate a creative "Synthetic Mission" (Coding Project) for a Data Engineer who knows these tools: ${completedSkills.join(', ')}. 
    Theme: Cyberpunk/Futuristic.
    Structure:
    1. CODENAME (Cool project name)
    2. BRIEFING (The scenario)
    3. OBJECTIVES (3 bullet points of technical tasks)
    4. STACK (The tools to use)
    `;

    try {
        const data = await generateGeminiContent(prompt, "You are a Mission Commander for a futuristic data agency.");
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mission generation failed.";
        setMissionData(text);
    } catch (e) {
        setMissionData("Error contacting mission control.");
    } finally {
        setMissionLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, chatOpen]);


  /**
   * RENDERERS
   */
  const renderSkillNode = (skillId) => {
    const skill = computedSkills[skillId];
    const isLocked = skill.status === 'locked';
    const statusColor = getStatusColor(skill.status, CATEGORIES[skill.category].color);
    
    return (
      <div 
        key={skillId}
        onClick={() => !isLocked && setActiveSkill(skill)}
        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 
          ${statusColor} 
          ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:bg-slate-800'}
        `}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{skill.label}</h3>
          {isLocked ? <Lock size={16} /> : 
           skill.status === 'certified' ? <Award size={18} className="text-yellow-400" /> :
           skill.status === 'complete' ? <CheckCircle2 size={18} className="text-green-400" /> :
           skill.status === 'in_progress' ? <PlayCircle size={18} /> :
           <div className="w-4 h-4 rounded-full border border-slate-600" />
          }
        </div>
        
        {/* Progress Bar (mini) */}
        <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              skill.status === 'certified' ? 'bg-yellow-400 w-full' :
              skill.status === 'complete' ? 'bg-green-400 w-full' :
              skill.status === 'in_progress' ? `bg-${CATEGORIES[skill.category].color}-400 w-1/2` :
              'w-0'
            }`} 
          />
        </div>

        {/* Hover Info (Desktop) */}
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center z-10 rounded-xl">
           {isLocked ? (
             <>
               <Lock className="text-red-400 mb-2" />
               <p className="text-xs text-red-300">Requires: {skill.lockedBy.map(pid => SAFE_SKILLS[pid].label).join(', ')}</p>
             </>
           ) : (
             <>
               <p className="text-xs text-slate-300 mb-2">{skill.description}</p>
               <button 
                 onClick={(e) => { e.stopPropagation(); setActiveSkill(skill); }}
                 className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-full"
               >
                 Open Details
               </button>
             </>
           )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const stats = calculateProgress(skills);
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlowCard className="p-6 flex items-center justify-between bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
             <div>
               <p className="text-slate-400 text-sm">Overall Sync</p>
               <h2 className="text-4xl font-bold text-cyan-400">{stats.total}%</h2>
             </div>
             <div className="h-16 w-16 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin-slow" style={{ transform: `rotate(${stats.total * 3.6}deg)`}}></div>
                <Cpu className="text-cyan-400" />
             </div>
          </GlowCard>
          
          <GlowCard className="p-6 col-span-1 md:col-span-2">
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" size={18} /> 
              Domain Mastery
            </h3>
            <div className="space-y-4">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className={`p-2 rounded bg-${cat.color}-500/10`}>
                    <cat.icon size={16} className={`text-${cat.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="text-slate-400">{stats.byCategory[key] || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${cat.color}-500 transition-all duration-1000`} 
                        style={{ width: `${stats.byCategory[key] || 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* AI Mission Generator */}
        <GlowCard className="p-6 border-cyan-500/30">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
                        <ScrollText className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                           Synthetic Missions <Sparkles className="text-yellow-400 w-4 h-4" />
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-md">
                            Generate a custom, AI-designed coding project based on your currently completed skills.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleGenerateMission}
                    className="group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25"
                >
                    <Target size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    Generate Mission
                </button>
             </div>
        </GlowCard>

        {/* Heatmap */}
        <GlowCard className="p-6">
          <h3 className="text-slate-200 font-semibold mb-6">Skill Matrix</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {Object.keys(CATEGORIES).map(catKey => (
               <div key={catKey} className="space-y-3">
                 <h4 className={`text-xs font-bold uppercase tracking-wider text-${CATEGORIES[catKey].color}-400`}>
                   {CATEGORIES[catKey].label}
                 </h4>
                 <div className="space-y-2">
                   {Object.values(computedSkills).filter(s => s.category === catKey).map(skill => (
                     <div key={skill.id} className="flex items-center gap-2 text-sm">
                       <div className={`w-2 h-2 rounded-full ${
                         skill.status === 'certified' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' :
                         skill.status === 'complete' ? 'bg-green-400' :
                         skill.status === 'in_progress' ? `bg-${CATEGORIES[catKey].color}-400` :
                         skill.status === 'locked' ? 'bg-red-900' :
                         'bg-slate-700'
                       }`} />
                       <span className={skill.status === 'locked' ? 'text-slate-600' : 'text-slate-300'}>
                         {skill.label}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </GlowCard>
      </div>
    );
  };

  const renderRoadmap = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-white">Skill Topology</h2>
         <div className="flex gap-4 text-xs text-slate-400">
           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded-full"/> Locked</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-400 rounded-full"/> Active</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"/> Done</span>
         </div>
       </div>

       {Object.keys(CATEGORIES).map(catKey => {
         const categorySkills = Object.values(computedSkills).filter(s => s.category === catKey);
         if (categorySkills.length === 0) return null;

         const CategoryIcon = CATEGORIES[catKey].icon;

         return (
           <div key={catKey} className="relative">
              {/* Category Header */}
              <div className={`flex items-center gap-2 mb-4 text-${CATEGORIES[catKey].color}-400`}>
                <CategoryIcon size={20} />
                <h3 className="font-bold uppercase tracking-widest">{CATEGORIES[catKey].label}</h3>
                <div className={`h-[1px] flex-1 bg-gradient-to-r from-${CATEGORIES[catKey].color}-900 to-transparent`} />
              </div>

              {/* Grid of Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categorySkills.map(skill => renderSkillNode(skill.id))}
              </div>
           </div>
         );
       })}
    </div>
  );

  const renderSkillDetailModal = () => {
    if (!activeSkill) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveSkill(null)}>
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50">
             <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {activeSkill.label}
                  {activeSkill.status === 'certified' && <Award className="text-yellow-400" />}
                </h2>
                <p className="text-slate-400 mt-1">{activeSkill.description}</p>
             </div>
             <button onClick={() => setActiveSkill(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><X size={20}/></button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
             {/* Status Control */}
             <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Status</h3>
               <div className="flex flex-wrap gap-2">
                 {Object.entries(STATUS_LEVELS).map(([key, val]) => {
                   if (key === 'LOCKED') return null;
                   const statusKey = key.toLowerCase();
                   const isActive = activeSkill.status === statusKey;
                   
                   return (
                     <button
                       key={key}
                       onClick={() => updateStatus(activeSkill.id, statusKey)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                         isActive 
                           ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' 
                           : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                       }`}
                     >
                       {key.replace('_', ' ')}
                     </button>
                   );
                 })}
               </div>
             </div>

             {/* Prerequisites Map */}
             {activeSkill.parents.length > 0 && (
               <div>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisites</h3>
                 <div className="flex gap-2">
                    {activeSkill.parents.map(pid => (
                      <span key={pid} className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">
                        {SAFE_SKILLS[pid]?.label || pid}
                      </span>
                    ))}
                 </div>
               </div>
             )}
             
             {/* AI Actions Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Mentor (Default) */}
                <button 
                  onClick={() => {
                    handleSendMessage(`Explain ${activeSkill.label} to me simply using an analogy.`, activeSkill.id, 'mentor');
                    setActiveSkill(null); 
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500 text-left p-4 rounded-xl group transition-all"
                >
                    <div className="flex justify-between items-start mb-2">
                         <BrainCircuit className="text-cyan-400 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded uppercase font-bold">Mentor</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">Explain This</h4>
                    <p className="text-xs text-slate-400">Get a simple analogy for this concept.</p>
                </button>

                {/* 2. Quiz (Default) */}
                <button 
                  onClick={() => {
                    handleSendMessage(`Test my knowledge on ${activeSkill.label}.`, activeSkill.id, 'examiner');
                    setActiveSkill(null); 
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-yellow-500 text-left p-4 rounded-xl group transition-all"
                >
                     <div className="flex justify-between items-start mb-2">
                         <Swords className="text-yellow-400 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded uppercase font-bold">✨ Quiz</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">Protocol Test</h4>
                    <p className="text-xs text-slate-400">Face a tough interview question.</p>
                </button>

                {/* 3. Resume Architect (Shows only if Certified) */}
                {activeSkill.status === 'certified' && (
                    <button 
                        onClick={() => {
                          handleSendMessage(`Generate resume bullets for ${activeSkill.label}.`, activeSkill.id, 'career_coach');
                          setActiveSkill(null); 
                        }}
                        className="col-span-1 md:col-span-2 bg-gradient-to-r from-emerald-900/50 to-slate-900 hover:from-emerald-900 border border-emerald-700/50 hover:border-emerald-500 text-left p-4 rounded-xl group transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Briefcase className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded uppercase font-bold">✨ Career Ops</span>
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">Resume Architect</h4>
                        <p className="text-xs text-slate-400">Generate metric-driven bullet points for this skill.</p>
                    </button>
                )}

                {/* 4. Study Planner (Shows only if In Progress or Not Started) */}
                {(activeSkill.status === 'in_progress' || activeSkill.status === 'not_started') && (
                    <button 
                        onClick={() => {
                          handleSendMessage(`Draft a study plan for ${activeSkill.label}.`, activeSkill.id, 'strategist');
                          setActiveSkill(null); 
                        }}
                        className="col-span-1 md:col-span-2 bg-gradient-to-r from-violet-900/50 to-slate-900 hover:from-violet-900 border border-violet-700/50 hover:border-violet-500 text-left p-4 rounded-xl group transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Calendar className="text-violet-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded uppercase font-bold">✨ Tactical Ops</span>
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">Micro-Strategy</h4>
                        <p className="text-xs text-slate-400">Generate a 3-day rapid learning schedule.</p>
                    </button>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMissionModal = () => {
      if (!missionModalOpen) return null;
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setMissionModalOpen(false)}>
            <div className="bg-slate-900 border border-cyan-500/50 w-full max-w-3xl rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 bg-gradient-to-r from-cyan-900/50 to-slate-900 border-b border-cyan-500/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ScrollText className="text-cyan-400 animate-pulse" />
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Mission Briefing</h2>
                    </div>
                    <button onClick={() => setMissionModalOpen(false)} className="text-slate-400 hover:text-white"><X/></button>
                </div>

                <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 bg-slate-950/50">
                    {missionLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <RefreshCw className="animate-spin text-cyan-400" size={32} />
                            <p className="text-cyan-500 animate-pulse">CONTACTING COMMAND NODE...</p>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">
                            {missionData}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2">
                    <button onClick={() => setMissionModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Close</button>
                    <button onClick={handleGenerateMission} className="px-4 py-2 bg-cyan-900/50 hover:bg-cyan-900 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all">Regenerate</button>
                </div>
            </div>
        </div>
      );
  };

  /**
   * MAIN RENDER
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm tracking-widest animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 z-40 hidden md:flex">
         <div className="mb-8 p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
           <Cpu className="text-cyan-400" size={24} />
         </div>

         <div className="flex flex-col gap-6 w-full px-2">
           <button 
             onClick={() => setView('dashboard')}
             className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
           >
             <LayoutDashboard size={20} />
           </button>
           <button 
             onClick={() => setView('roadmap')}
             className={`p-3 rounded-xl transition-all ${view === 'roadmap' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
           >
             <MapIcon size={20} />
           </button>
         </div>

         <div className="mt-auto">
            <button className="p-3 text-slate-500 hover:text-slate-300">
               <User size={20} />
            </button>
         </div>
      </nav>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4">
         <div className="flex items-center gap-2 font-bold text-cyan-400">
           <Cpu size={20} /> DataPath AI
         </div>
         <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className={`p-2 rounded ${view === 'dashboard' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}><LayoutDashboard size={20}/></button>
            <button onClick={() => setView('roadmap')} className={`p-2 rounded ${view === 'roadmap' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}><MapIcon size={20}/></button>
         </div>
      </div>

      {/* Main Content */}
      <main className="md:pl-20 pt-20 md:pt-0 min-h-screen">
        <header className="px-8 py-6 flex justify-between items-end border-b border-slate-800/50 bg-slate-950/50 backdrop-blur sticky top-0 z-30">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {view === 'dashboard' ? 'Command Center' : 'Skill Topology'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, Engineer. Systems nominal.
            </p>
          </div>
          <button 
             onClick={() => setChatOpen(!chatOpen)}
             className="md:hidden p-3 bg-cyan-600 text-white rounded-full shadow-lg"
          >
             <MessageSquare size={20} />
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {view === 'dashboard' ? renderDashboard() : renderRoadmap()}
        </div>
      </main>

      {/* AI Sidebar (Slide-over) */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         {/* Sidebar Toggle (Desktop) */}
         <button 
           onClick={() => setChatOpen(!chatOpen)}
           className={`absolute -left-12 top-1/2 -translate-y-1/2 bg-slate-800 border-y border-l border-slate-600 p-3 rounded-l-xl text-cyan-400 hover:text-white transition-all hidden md:block ${!chatOpen ? 'opacity-50 hover:opacity-100 hover:-translate-x-1' : ''}`}
         >
            {chatOpen ? <ChevronRight /> : <MessageSquare />}
         </button>

         {/* Chat Header */}
         <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <BrainCircuit size={20} />
              <span>AI Mentor</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="md:hidden p-1 text-slate-400"><X/></button>
         </div>

         {/* Chat Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                   m.role === 'user' 
                     ? 'bg-cyan-600 text-white rounded-br-none' 
                     : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                 }`}>
                   {m.role === 'model' && <div className="text-xs text-cyan-400 font-bold mb-1 uppercase tracking-wider">System</div>}
                   {m.text}
                 </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-slate-800 rounded-2xl rounded-bl-none p-3 border border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Chat Input */}
         <div className="p-4 bg-slate-800 border-t border-slate-700">
           <form 
             onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
             className="relative"
           >
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask for help or analogies..."
               className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
             />
             <button 
               type="submit"
               disabled={!input.trim() || isTyping}
               className="absolute right-2 top-2 p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
             >
               <Send size={18} />
             </button>
           </form>
         </div>
      </div>

      {renderSkillDetailModal()}
      {renderMissionModal()}
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[100px] rounded-full" />
         <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

    </div>
  );
}
