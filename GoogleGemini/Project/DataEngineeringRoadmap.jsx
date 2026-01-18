import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Clock, 
  Database, 
  Layout, 
  Server, 
  Code, 
  Cloud, 
  BarChart2, 
  Cpu, 
  Box, 
  ChevronDown, 
  ChevronRight, 
  Bot, 
  X,
  Loader2,
  Save,
  TrendingUp,
  Award,
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
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

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Curriculum Data ---
const CURRICULUM = [
  {
    id: 'python',
    title: 'Python for Data Engineering',
    icon: Code,
    color: 'text-yellow-500',
    topics: [
      { id: 'py_basic', name: 'Basic Syntax & Variables', level: 'Easy' },
      { id: 'py_struct', name: 'Data Structures (Lists, Dicts, Sets)', level: 'Easy' },
      { id: 'py_file', name: 'File Handling (CSV, JSON, Parquet)', level: 'Medium' },
      { id: 'py_oop', name: 'OOP Concepts', level: 'Medium' },
      { id: 'py_pandas', name: 'Pandas & NumPy', level: 'Medium' },
      { id: 'py_func', name: 'Functional Programming (Lambda, Map)', level: 'Advanced' },
      { id: 'py_perf', name: 'Writing Efficient Code & Profiling', level: 'Advanced' },
      { id: 'py_test', name: 'Unit Testing & Debugging', level: 'Advanced' },
    ]
  },
  {
    id: 'sql',
    title: 'Advanced SQL',
    icon: Database,
    color: 'text-blue-500',
    topics: [
      { id: 'sql_basic', name: 'Basic Queries (SELECT, WHERE)', level: 'Easy' },
      { id: 'sql_joins', name: 'Joins (Inner, Left, Cross, Self)', level: 'Medium' },
      { id: 'sql_agg', name: 'Aggregations & Group By', level: 'Medium' },
      { id: 'sql_win', name: 'Window Functions (RANK, LEAD, LAG)', level: 'Advanced' },
      { id: 'sql_cte', name: 'CTEs & Recursive Queries', level: 'Advanced' },
      { id: 'sql_opt', name: 'Query Optimization & Indexing', level: 'Advanced' },
      { id: 'sql_proc', name: 'Stored Procedures & Triggers', level: 'Advanced' },
    ]
  },
  {
    id: 'warehouse',
    title: 'Data Warehousing',
    icon: Layout,
    color: 'text-indigo-500',
    topics: [
      { id: 'dw_concept', name: 'OLAP vs OLTP', level: 'Easy' },
      { id: 'dw_arch', name: 'Data Warehouse Architecture', level: 'Medium' },
      { id: 'dw_schema', name: 'Star & Snowflake Schemas', level: 'Medium' },
      { id: 'dw_dim', name: 'Slowly Changing Dimensions (SCD)', level: 'Advanced' },
      { id: 'dw_col', name: 'Columnar Storage Formats', level: 'Advanced' },
    ]
  },
  {
    id: 'pyspark',
    title: 'PySpark & Distributed Computing',
    icon: Zap,
    color: 'text-orange-500',
    topics: [
      { id: 'spark_intro', name: 'Spark Architecture (Driver/Worker)', level: 'Easy' },
      { id: 'spark_df', name: 'DataFrames & RDD Basics', level: 'Medium' },
      { id: 'spark_trans', name: 'Transformations vs Actions', level: 'Medium' },
      { id: 'spark_sql', name: 'SparkSQL', level: 'Medium' },
      { id: 'spark_opt', name: 'Performance Tuning (Catalyst, Tungsten)', level: 'Advanced' },
      { id: 'spark_part', name: 'Partitioning & Bucketing Strategy', level: 'Advanced' },
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud Platforms (AWS/GCP/Azure)',
    icon: Cloud,
    color: 'text-sky-500',
    topics: [
      { id: 'cloud_iam', name: 'IAM & Security Basics', level: 'Easy' },
      { id: 'cloud_store', name: 'Object Storage (S3/GCS)', level: 'Medium' },
      { id: 'cloud_cw', name: 'Cloud Data Warehouses (Redshift/BigQuery)', level: 'Medium' },
      { id: 'cloud_serv', name: 'Serverless Functions (Lambda/Cloud Functions)', level: 'Advanced' },
      { id: 'cloud_iac', name: 'Infrastructure as Code (Terraform)', level: 'Advanced' },
    ]
  },
  {
    id: 'modeling',
    title: 'Data Modeling',
    icon: Box,
    color: 'text-purple-500',
    topics: [
      { id: 'mod_er', name: 'ER Diagrams', level: 'Easy' },
      { id: 'mod_norm', name: 'Normalization (1NF, 2NF, 3NF)', level: 'Medium' },
      { id: 'mod_dim', name: 'Dimensional Modeling', level: 'Advanced' },
      { id: 'mod_nosql', name: 'NoSQL Schema Design', level: 'Advanced' },
    ]
  },
  {
    id: 'etl',
    title: 'ETL & Orchestration',
    icon: Server,
    color: 'text-green-500',
    topics: [
      { id: 'etl_strat', name: 'Extract Strategies (Full vs Incremental)', level: 'Easy' },
      { id: 'etl_load', name: 'Loading Techniques (Upsert, Merge)', level: 'Medium' },
      { id: 'etl_airflow', name: 'Airflow DAGs & Operators', level: 'Advanced' },
      { id: 'etl_kafka', name: 'Real-time Streaming (Kafka)', level: 'Advanced' },
      { id: 'etl_dq', name: 'Data Quality Checks', level: 'Advanced' },
    ]
  },
  {
    id: 'viz',
    title: 'Data Visualization',
    icon: BarChart2,
    color: 'text-pink-500',
    topics: [
      { id: 'viz_type', name: 'Chart Types & Use Cases', level: 'Easy' },
      { id: 'viz_tool', name: 'Tools (Tableau, PowerBI, Looker)', level: 'Medium' },
      { id: 'viz_story', name: 'Data Storytelling', level: 'Advanced' },
    ]
  }
];

// Helper icon component
function Zap(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}

// --- Status Colors ---
const STATUS_STYLES = {
  'not-started': 'bg-slate-100 text-slate-500 border-slate-200',
  'in-progress': 'bg-blue-50 text-blue-600 border-blue-200',
  'completed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

const STATUS_ICONS = {
  'not-started': Circle,
  'in-progress': Clock,
  'completed': CheckCircle,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  
  // Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [capstoneModalOpen, setCapstoneModalOpen] = useState(false);
  
  // Data States
  const [activeTopic, setActiveTopic] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [capstoneData, setCapstoneData] = useState(null);
  
  // Loading States
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all'); 

  // --- Auth & Data Loading ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'tracker');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data().progress || {});
      }
    }, (error) => {
      console.error("Error fetching progress:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Actions ---
  const updateProgress = async (topicId, status) => {
    const newProgress = { ...progress, [topicId]: status };
    setProgress(newProgress);
    
    if (user) {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'tracker');
      try {
        await setDoc(docRef, { progress: newProgress }, { merge: true });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // --- AI Logic ---

  const generateAiGuidance = async (topicName, sectionName) => {
    setAiLoading(true);
    const apiKey = ""; 
    const prompt = `You are an expert Data Engineering Tutor. Provide a concise guide for the topic "${topicName}" within the domain of "${sectionName}". 
    
    Structure your response exactly like this:
    1. **Concept**: A 2-sentence explanation of what this is.
    2. **Why it matters**: One sentence on why a Data Engineer needs this.
    3. **Key Concepts**: 3 bullet points of specific sub-skills or keywords to learn.
    4. **Practice Idea**: A simple project idea (e.g., "Build a pipeline that...").
    
    Keep the tone encouraging and professional. Use markdown formatting.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        setAiResponse(data.candidates[0].content.parts[0].text);
      } else {
        setAiResponse("I'm currently resting. Please try asking again in a moment.");
      }
    } catch (error) {
      setAiResponse("Failed to connect to the AI tutor. Please check your connection.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateQuiz = async (topicName) => {
    setAiLoading(true);
    setQuizData(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    
    const apiKey = "";
    const prompt = `Create a quiz with 3 multiple-choice questions about '${topicName}' for a data engineering student. 
    Return a raw JSON array (no markdown code blocks) where each object has: 
    'question' (string), 
    'options' (array of 4 strings), 
    'correctIndex' (integer 0-3), 
    'explanation' (string).`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        setQuizData(JSON.parse(cleanText));
      }
    } catch (error) {
      console.error("Quiz gen error", error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateCapstone = async () => {
    setAiLoading(true);
    setCapstoneData(null);
    
    const activeSkills = CURRICULUM.flatMap(s => s.topics)
      .filter(t => progress[t.id] === 'completed' || progress[t.id] === 'in-progress')
      .map(t => t.name);

    if (activeSkills.length === 0) {
      setAiLoading(false);
      setCapstoneData({ error: "Start some topics first to get a project idea!" });
      return;
    }

    const apiKey = "";
    const prompt = `Design a Data Engineering Capstone Project using these skills: ${activeSkills.join(', ')}. 
    Return raw JSON (no markdown) with fields: 
    'title' (string), 
    'summary' (string), 
    'architecture_steps' (array of strings, logical flow), 
    'technologies' (array of strings), 
    'bonus_challenge' (string).`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        setCapstoneData(JSON.parse(cleanText));
      }
    } catch (error) {
      console.error("Capstone gen error", error);
    } finally {
      setAiLoading(false);
    }
  };

  // --- Handlers ---
  const openAiTutor = (topic, sectionTitle) => {
    setActiveTopic({ ...topic, sectionTitle });
    setAiResponse('');
    setAiModalOpen(true);
    generateAiGuidance(topic.name, sectionTitle);
  };

  const openQuiz = (topic) => {
    setActiveTopic(topic);
    setQuizModalOpen(true);
    generateQuiz(topic.name);
  };

  const openCapstone = () => {
    setCapstoneModalOpen(true);
    generateCapstone();
  };

  const handleQuizOptionSelect = (qIndex, oIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  // --- Computed Stats ---
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    
    CURRICULUM.forEach(section => {
      section.topics.forEach(topic => {
        total++;
        const status = progress[topic.id];
        if (status === 'completed') completed++;
        if (status === 'in-progress') inProgress++;
      });
    });

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, inProgress, percent };
  }, [progress]);

  // --- Components ---
  
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                DataEngTracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-slate-500">
                <span className="mr-2">Overall Progress:</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                <span className="ml-2 font-medium text-slate-700">{stats.percent}%</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Skills" value={stats.total} icon={BookOpen} color="text-slate-600" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="text-emerald-600" />
          <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="text-blue-600" />
          <StatCard label="Remaining" value={stats.total - stats.completed - stats.inProgress} icon={Circle} color="text-orange-500" />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Learning Roadmap</h2>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Capstone Generator Button */}
            <button
              onClick={openCapstone}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="font-semibold">Generate Capstone Project ✨</span>
            </button>

            <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              {['all', 'not-started', 'in-progress', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Curriculum Sections */}
        <div className="space-y-6">
          {CURRICULUM.map((section) => {
            const visibleTopics = section.topics.filter(topic => {
              const status = progress[topic.id] || 'not-started';
              if (filter === 'all') return true;
              return status === filter;
            });

            if (visibleTopics.length === 0 && filter !== 'all') return null;

            const sectionCompleted = section.topics.filter(t => progress[t.id] === 'completed').length;
            const sectionTotal = section.topics.length;
            const sectionPercent = Math.round((sectionCompleted / sectionTotal) * 100);
            const isExpanded = expandedSections[section.id];

            return (
              <div key={section.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 flex items-center justify-between"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-opacity-10 ${section.color.replace('text-', 'bg-')}`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{section.title}</h3>
                      <p className="text-sm text-slate-500">
                        {sectionCompleted}/{sectionTotal} Topics Completed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${sectionPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{ width: `${sectionPercent}%` }} 
                        />
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{sectionPercent}%</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Topics List */}
                {(isExpanded || filter !== 'all') && (
                  <div className="divide-y divide-slate-100 bg-slate-50/50">
                    {visibleTopics.map((topic) => {
                      const status = progress[topic.id] || 'not-started';
                      const StatusIcon = STATUS_ICONS[status];
                      
                      return (
                        <div key={topic.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white transition-colors gap-4">
                          <div className="flex items-start sm:items-center space-x-3 flex-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border 
                              ${topic.level === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 
                                topic.level === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                                'bg-red-50 text-red-700 border-red-100'}`}>
                              {topic.level}
                            </span>
                            <span className="font-medium text-slate-700">{topic.name}</span>
                          </div>

                          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-2">
                            
                            {/* Quiz Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openQuiz(topic);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-violet-600 bg-violet-50 hover:bg-violet-100 text-xs font-semibold transition-colors border border-violet-100"
                            >
                              <BrainCircuit className="w-3.5 h-3.5" />
                              <span>Quiz Me ✨</span>
                            </button>

                            {/* AI Tutor Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAiTutor(topic, section.title);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold transition-colors border border-indigo-100"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Ask AI</span>
                            </button>

                            {/* Status Dropdown */}
                            <div className="relative group">
                              <button className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${STATUS_STYLES[status]}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span>{STATUS_LABELS[status]}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                              </button>
                              
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden hidden group-hover:block z-10">
                                {Object.keys(STATUS_LABELS).map((key) => (
                                  <button
                                    key={key}
                                    onClick={() => updateProgress(topic.id, key)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center space-x-2
                                      ${status === key ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}
                                    `}
                                  >
                                    {key === 'completed' && <CheckCircle className="w-3 h-3" />}
                                    {key === 'in-progress' && <Clock className="w-3 h-3" />}
                                    {key === 'not-started' && <Circle className="w-3 h-3" />}
                                    <span>{STATUS_LABELS[key]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* --- AI Tutor Modal --- */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-indigo-50/50 rounded-t-2xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Bot className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">AI Learning Assistant</h3>
                  <p className="text-sm text-slate-500">
                    Topic: <span className="font-semibold text-indigo-600">{activeTopic?.name}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-slate-700 leading-relaxed">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-slate-500 font-medium animate-pulse">Consulting the knowledge base...</p>
                </div>
              ) : (
                <div className="prose prose-slate prose-indigo max-w-none">
                  {aiResponse.split('\n').map((line, i) => {
                    if (line.startsWith('**')) return <h4 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                    if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-indigo-400">{line.replace('* ', '')}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    if (line.match(/^\d\./)) return <p key={i} className="font-bold text-indigo-700 mt-3">{line}</p>
                    return <p key={i} className="mb-2">{line}</p>;
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setAiModalOpen(false)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Quiz Modal --- */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-violet-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <BrainCircuit className="w-6 h-6 text-violet-600" />
                <h3 className="text-xl font-bold text-slate-900">Skill Check: {activeTopic?.name}</h3>
              </div>
              <button onClick={() => setQuizModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Generating a unique quiz for you...</p>
                </div>
              ) : quizData ? (
                <div className="space-y-8">
                  {quizData.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <p className="font-semibold text-lg text-slate-800 mb-4">{idx + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[idx] === oIdx;
                          const isCorrect = q.correctIndex === oIdx;
                          let btnClass = "w-full text-left p-3 rounded-lg border transition-all ";
                          
                          if (quizSubmitted) {
                            if (isCorrect) btnClass += "bg-emerald-100 border-emerald-300 text-emerald-800 font-medium";
                            else if (isSelected) btnClass += "bg-red-50 border-red-200 text-red-700";
                            else btnClass += "bg-white border-slate-200 opacity-60";
                          } else {
                            if (isSelected) btnClass += "bg-violet-100 border-violet-300 text-violet-800 font-medium";
                            else btnClass += "bg-white border-slate-200 hover:border-violet-200 hover:bg-violet-50";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizOptionSelect(idx, oIdx)}
                              className={btnClass}
                              disabled={quizSubmitted}
                            >
                              <div className="flex justify-between items-center">
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check className="w-5 h-5 text-emerald-600" />}
                                {quizSubmitted && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-red-500">Failed to load quiz. Try again.</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end space-x-3">
              {!quizSubmitted && quizData && (
                <button 
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length !== quizData.length}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  Submit Answers
                </button>
              )}
              {quizSubmitted && (
                <button 
                  onClick={() => { setQuizModalOpen(false); setQuizSubmitted(false); }}
                  className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold"
                >
                  Close Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Capstone Modal --- */}
      {capstoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Your Custom Capstone Project</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Based on your completed skills</p>
                </div>
              </div>
              <button onClick={() => setCapstoneModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Analyzing your skills & designing a project...</p>
                </div>
              ) : capstoneData ? (
                capstoneData.error ? (
                  <div className="text-center py-10">
                    <p className="text-lg text-slate-600 mb-4">{capstoneData.error}</p>
                    <button onClick={() => setCapstoneModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Go learn some things!</button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{capstoneData.title}</h2>
                      <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">{capstoneData.summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                          <Cpu className="w-4 h-4 mr-2" /> Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {capstoneData.technologies.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                        <h4 className="flex items-center text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">
                          <Award className="w-4 h-4 mr-2" /> Bonus Challenge
                        </h4>
                        <p className="text-purple-900 font-medium">{capstoneData.bonus_challenge}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Architecture & Implementation</h3>
                      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
                        {capstoneData.architecture_steps.map((step, i) => (
                          <div key={i} className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
                            <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                              <span className="font-bold text-indigo-600 mr-2">Step {i + 1}:</span>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-red-500">Failed to generate project. Try again later.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setCapstoneModalOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-colors"
              >
                Close Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
