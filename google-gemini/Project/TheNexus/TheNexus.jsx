import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Compass, 
  Feather, 
  ArrowRight, 
  X, 
  Send, 
  Zap, 
  Shield, 
  Heart,
  Lightbulb,
  CheckCircle,
  Menu,
  ChevronRight,
  Swords, // For the Wargame/Simulator
  PenTool, // For the Socratic Journal
  Layers, // For Skill Tree
  RefreshCw, // For Comm Alchemist
  Gavel, // For Intellectual Sparring
  ScrollText // For History's Mirror
} from 'lucide-react';

// --- CONFIGURATION & MOCK DATA ---

const API_KEY = ""; // System will inject key at runtime

// Blog Data (The Archive)
const BLOG_POSTS = [
  {
    id: 1,
    title: "The Scarcity Trap: Why 'Saving' Keeps You Poor",
    category: "Money & Mindset",
    readTime: "6 min read",
    context: "A lesson from post-war economic recoveries in Japan vs. generic savings advice.",
    lesson: "Wealth is not the accumulation of money, but the velocity of value.",
    content: `
      ### The Context
      In 1946, Japan was decimated. The natural instinct was to hoard resources. Yet, the companies that rebuilt the nation (Sony, Honda) didn't hoard—they reinvested aggressively despite the risk.

      ### The Psychology
      The "Scarcity Mindset" triggers a survival mechanism in the brain (the amygdala). It focuses on *retaining* what you have rather than *expanding* what you could create. It is a defensive posture. You cannot win a war by only building walls; you must advance.

      ### Practical Application
      1. **Audit your spending:** Are you cutting costs on things that save you time (tools, health, delegation)? That is false economy.
      2. **The 10% Risk Rule:** Take 10% of your income and treat it as 'gone'. Use it to buy a course, start a side hustle, or invest in a high-risk asset. Detach from the outcome.

      ### Mistakes to Avoid
      * Confusing "frugality" (efficiency) with "cheapness" (fear).
      * Waiting for "perfect" market conditions to invest in yourself.

      ### Action Step
      Identify one area where you are choosing the 'cheap' option that is costing you time or energy. Upgrade it today.
    `,
    wisdom: "You cannot shrink your way to greatness."
  },
  {
    id: 2,
    title: "The Sniper vs. The Machine Gunner",
    category: "Discipline & Focus",
    readTime: "4 min read",
    context: "Military doctrine applied to modern career choices.",
    lesson: "Activity is not achievement. Precision beats volume.",
    content: `
      ### The Context
      Novices pray and spray. Masters wait, breathe, and take one shot. In the Vietnam War, the U.S. fired estimated 50,000 rounds for every enemy kill. A sniper uses one.

      ### The Logic
      We live in an attention economy. Trying to do 'everything' makes you noise. Doing one thing with terrifying excellence makes you a signal. The market rewards the signal, not the noise.

      ### Practical Application
      * **The Elimination List:** Write down your top 25 goals. Circle the top 5. The other 20 are now your *enemies*. They are the distractions that will stop you from achieving the top 5. Avoid them at all costs.
      
      ### Mistakes to Avoid
      * Confusing 'busy work' (emails, meetings) with 'deep work' (creation, strategy).
      * Saying yes to immediate opportunities that drift you from your long-term mission.

      ### Action Step
      Cancel 50% of your meetings next week. Use that time to solve ONE major structural problem in your life.
    `,
    wisdom: "If you chase two rabbits, you will catch neither."
  }
];

// Mental Models (The Library)
const MENTAL_MODELS = [
  {
    title: "Inversion",
    summary: "Instead of asking how to achieve success, ask how to guarantee failure—then avoid those things.",
    domain: "Problem Solving"
  },
  {
    title: "Hanlon's Razor",
    summary: "Never attribute to malice that which is adequately explained by stupidity or neglect.",
    domain: "Relationships"
  },
  {
    title: "First Principles",
    summary: "Boil things down to the most fundamental truths and reason up from there, rather than reasoning by analogy.",
    domain: "Innovation"
  },
  {
    title: "The Pareto Principle",
    summary: "80% of consequences come from 20% of the causes. Find your 20%.",
    domain: "Productivity"
  }
];

// --- AI INTEGRATION HELPERS ---

const callGemini = async (prompt, systemInstruction) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      }
    );

    if (!response.ok) throw new Error("AI Service Unavailable");
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(error);
    return "I am currently meditating and cannot respond. Please try again in a moment.";
  }
};

// --- COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? "bg-slate-800 text-white shadow-md" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium tracking-wide">{label}</span>
  </button>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-serif text-slate-800 font-bold mb-2">{title}</h2>
    <p className="text-slate-500 max-w-2xl text-lg">{subtitle}</p>
    <div className="h-1 w-20 bg-amber-500 mt-4 rounded-full"></div>
  </div>
);

const MarkdownRenderer = ({ content }) => {
  // Simple custom renderer to handle bold and headers for the AI output
  const lines = content.split('\n');
  return (
    <div className="space-y-3 font-light text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <strong key={idx} className="block text-slate-900 mt-2">{line.replace(/\*\*/g, '')}</strong>;
        if (line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc marker:text-amber-500">{line.replace('* ', '')}</li>;
        return <p key={idx}>{line.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function TheNexus() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPost, setSelectedPost] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -- STATE FOR PROBLEM SOLVER --
  const [problemInput, setProblemInput] = useState("");
  const [solution, setSolution] = useState(null);
  const [isSolving, setIsSolving] = useState(false);

  // -- STATE FOR AI COACH --
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: "I am The Nexus. I am here to provide clarity, strategy, and truth. What is weighing on your mind today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [coachPersona, setCoachPersona] = useState("Strategist");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // -- STATE FOR DECISION SIMULATOR --
  const [decisionInput, setDecisionInput] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // -- STATE FOR SOCRATIC JOURNAL --
  const [journalEntry, setJournalEntry] = useState("");
  const [socraticQuestion, setSocraticQuestion] = useState("");
  const [isReflecting, setIsReflecting] = useState(false);

  // -- STATE FOR SKILL TREE ARCHITECT --
  const [skillInput, setSkillInput] = useState("");
  const [skillTree, setSkillTree] = useState(null);
  const [isBuildingTree, setIsBuildingTree] = useState(false);

  // -- STATE FOR COMMUNICATION ALCHEMIST --
  const [commInput, setCommInput] = useState("");
  const [commOutput, setCommOutput] = useState(null);
  const [isRewriting, setIsRewriting] = useState(false);

  // -- STATE FOR INTELLECTUAL SPARRING (NEW) --
  const [sparringInput, setSparringInput] = useState("");
  const [sparringOutput, setSparringOutput] = useState(null);
  const [isSparring, setIsSparring] = useState(false);

  // -- STATE FOR HISTORY'S MIRROR (NEW) --
  const [historyInput, setHistoryInput] = useState("");
  const [historyOutput, setHistoryOutput] = useState(null);
  const [isSearchingHistory, setIsSearchingHistory] = useState(false);

  // -- HANDLERS --

  const handleSolveProblem = async () => {
    if (!problemInput.trim()) return;
    setIsSolving(true);
    setSolution(null);

    const systemPrompt = `
      You are an elite Problem Solving Architect. 
      The user will present a life problem. 
      You MUST respond in this specific JSON format (but return plain text I can parse easily visually):
      
      1. **Root Cause Analysis**: What is the REAL problem? (often emotional or structural, not just the symptom).
      2. **Logical Breakdown**: Remove emotion. What are the facts?
      3. **The Solution**: Step-by-step, actionable, ruthless.
      4. **Hard Truth**: What does the user not want to hear but needs to hear?
      
      Tone: Clinical, Empathetic but Stern, Wise. No fluff.
    `;

    const result = await callGemini(problemInput, systemPrompt);
    setSolution(result);
    setIsSolving(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    const personas = {
      "Strategist": "You are a military-grade Strategist. Focus on tactics, leverage, efficiency, and outcomes. Be direct.",
      "Stoic": "You are a Stoic Philosopher (Marcus Aurelius style). Focus on what is in control vs out of control. Emotional regulation. Virtue.",
      "Therapist": "You are a Compassionate Psychologist. Validate feelings but guide towards growth. Ask 'Why' questions."
    };

    const result = await callGemini(userMsg, `
      ${personas[coachPersona]}
      Act as a mentor. Keep responses concise (under 150 words) unless asked for depth. 
      Never judge. Always aim for clarity.
    `);

    setChatHistory(prev => [...prev, { role: 'model', text: result }]);
    setIsChatting(false);
  };

  const handleSimulateDecision = async () => {
    if (!decisionInput.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);

    const systemPrompt = `
      You are a Futuristic Strategist Engine. 
      The user is facing a binary or complex decision. 
      You must simulate three distinct future timelines based on history, probability, and human psychology.

      Format the output exactly like this:
      
      ### 1. The Optimistic Timeline (Best Case)
      [Describe the specific chain of events if everything goes right. High risk, high reward.]
      **Probability:** [Estimated %]

      ### 2. The Pessimistic Timeline (Worst Case)
      [Describe the failure cascade. What breaks? What do they lose? Fear setting.]
      **Probability:** [Estimated %]

      ### 3. The Realistic Timeline (Most Likely)
      [The boring, messy middle. What usually happens.]
      **Probability:** [Estimated %]

      ### Strategic Advice
      [One sentence recommendation]
    `;

    const result = await callGemini(decisionInput, systemPrompt);
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const handleJournalReflect = async () => {
    if (!journalEntry.trim()) return;
    setIsReflecting(true);
    setSocraticQuestion("");

    const systemPrompt = `
      You are Socrates.
      Read the user's journal entry.
      Do NOT summarize it.
      Do NOT offer advice.
      Do NOT be comforting.
      
      Your only goal is to find the hidden contradiction, the limiting belief, or the lie the user is telling themselves.
      
      Output ONLY a single, deep, piercing question. 
      Start with "Ask yourself: ..."
    `;

    const result = await callGemini(journalEntry, systemPrompt);
    setSocraticQuestion(result);
    setIsReflecting(false);
  };

  const handleBuildSkillTree = async () => {
    if (!skillInput.trim()) return;
    setIsBuildingTree(true);
    setSkillTree(null);

    const systemPrompt = `
      You are a Gamification Master and Learning Architect.
      The user wants to learn a specific skill.
      Break it down into a 4-Level Video Game Style Skill Tree.
      
      Format Requirements:
      ### Level 1: The Novice (Foundations)
      * [Specific Actionable Task 1]
      * [Specific Actionable Task 2]
      
      ### Level 2: The Apprentice (Practice)
      * [Task]
      * [Task]
      
      ### Level 3: The Adept (Complexity)
      * [Task]
      * [Task]
      
      ### Level 4: The Master (The Boss Battle)
      * **BOSS BATTLE:** [A real-world high-stakes challenge to prove mastery]
    `;

    const result = await callGemini(skillInput, systemPrompt);
    setSkillTree(result);
    setIsBuildingTree(false);
  };

  const handleRewriteComm = async () => {
    if (!commInput.trim()) return;
    setIsRewriting(true);
    setCommOutput(null);

    const systemPrompt = `
      You are an Expert Communication Coach and Diplomat.
      The user has provided a draft message (email/text). It might be messy, angry, or weak.
      Rewrite it in 3 specific styles.
      
      Format:
      ### 1. The Diplomat (Warm & Connective)
      [Focus on preserving relationship while being clear]
      
      ### 2. The Stoic (Firm Boundaries)
      [Remove all fluff. Direct, polite, unmovable. High self-respect.]
      
      ### 3. The Executive (Action Oriented)
      [Short. Concise. Focus on the outcome/next step only.]
    `;

    const result = await callGemini(commInput, systemPrompt);
    setCommOutput(result);
    setIsRewriting(false);
  };

  const handleSparring = async () => {
    if (!sparringInput.trim()) return;
    setIsSparring(true);
    setSparringOutput(null);

    const systemPrompt = `
      You are "The Devil's Advocate." 
      The user will present a belief, plan, or argument.
      Your job is to ATTACK it intellectually. 
      Do not be mean, but be ruthless in finding logic gaps.

      Format:
      ### 1. The Achilles Heel
      [Identify the single weakest point of their argument]

      ### 2. Logical Fallacies
      [List any bias, assumption, or fallacy present]

      ### 3. The Counter-Narrative
      [Present the strongest possible argument AGAINST them]
      
      ### 4. The Verdict
      [How robust is this idea? 1-10 Score]
    `;

    const result = await callGemini(sparringInput, systemPrompt);
    setSparringOutput(result);
    setIsSparring(false);
  };

  const handleHistoryMirror = async () => {
    if (!historyInput.trim()) return;
    setIsSearchingHistory(true);
    setHistoryOutput(null);

    const systemPrompt = `
      You are a Historian with an encyclopedic knowledge of biography.
      The user will describe a personal struggle.
      Find a SPECIFIC historical figure who faced a very similar situation.
      Avoid generic examples like Lincoln or Gandhi unless the parallel is perfect.

      Format:
      ### The Historical Mirror: [Name of Figure]
      [Context: Who they were and the year]

      ### The Parallel
      [How their situation mirrors the user's situation exactly]

      ### The Solution
      [What specific action did they take to overcome it?]

      ### The Lesson
      [One sentence takeaway for the user]
    `;

    const result = await callGemini(historyInput, systemPrompt);
    setHistoryOutput(result);
    setIsSearchingHistory(false);
  };

  // -- RENDERERS --

  const renderHome = () => (
    <div className="space-y-12 animate-fadeIn">
      {/* Hero */}
      <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Brain size={400} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-4 font-bold tracking-widest uppercase text-xs">
            <Zap size={14} /> Life Operating System v1.3
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Clarity in a world of <span className="text-slate-400">noise.</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            This is not a blog. It is a toolkit for your mind. 
            Solve problems, simulate decisions, and upgrade your mental models.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('solver')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              Solve a Problem <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setActiveTab('sparring')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Challenge Idea <Gavel size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Models */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-serif font-bold text-slate-800">Mental Models</h3>
          <button onClick={() => setActiveTab('library')} className="text-amber-600 font-medium hover:text-amber-700 text-sm">View All</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {MENTAL_MODELS.slice(0, 2).map((model, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Compass className="text-amber-500" size={24} />
                <h4 className="font-bold text-slate-800">{model.title}</h4>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{model.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Lessons */}
      <div>
        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-6">Latest Lessons</h3>
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <div 
              key={post.id} 
              onClick={() => { setSelectedPost(post); setActiveTab('reading'); }}
              className="group cursor-pointer bg-white border-l-4 border-slate-300 hover:border-amber-500 pl-6 py-4 transition-all"
            >
              <div className="text-xs font-bold tracking-widest text-slate-400 mb-1 uppercase">{post.category} • {post.readTime}</div>
              <h4 className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors mb-2">{post.title}</h4>
              <p className="text-slate-600 line-clamp-2">{post.context}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSolver = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="The Problem Deconstructor" 
        subtitle="Most problems remain unsolved because they are undefined. Write down what burdens you. The AI will strip away the emotion and find the root cause." 
      />
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <textarea
          value={problemInput}
          onChange={(e) => setProblemInput(e.target.value)}
          placeholder="Describe your situation in detail. E.g., 'I feel stuck in my career, I make good money but feel empty, and I'm afraid to quit because I have a family...'"
          className="w-full h-40 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none text-slate-700 leading-relaxed mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSolveProblem}
            disabled={isSolving || !problemInput}
            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSolving ? <span className="animate-pulse">Deconstructing...</span> : <>Analyze & Solve <Zap size={18} /></>}
          </button>
        </div>
      </div>

      {solution && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 animate-slideUp">
          <div className="flex items-center gap-3 mb-6 text-slate-900">
            <CheckCircle className="text-emerald-600" />
            <h3 className="text-xl font-bold">Analysis Complete</h3>
          </div>
          <MarkdownRenderer content={solution} />
        </div>
      )}
    </div>
  );

  const renderSimulator = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="Decision Wargaming" 
        subtitle="Fear stems from uncertainty. This tool uses AI to simulate the Best, Worst, and Most Likely timelines of a major decision, so you can choose with eyes wide open." 
      />
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <label className="block text-slate-700 font-bold mb-2">What is the decision?</label>
        <textarea
          value={decisionInput}
          onChange={(e) => setDecisionInput(e.target.value)}
          placeholder="E.g., 'Should I quit my stable job to start a consulting business?' or 'Should I move to a new city where I know no one?'"
          className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 outline-none resize-none text-slate-700 mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSimulateDecision}
            disabled={isSimulating || !decisionInput}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSimulating ? <span className="animate-pulse">Simulating Timelines...</span> : <>Run Simulation ✨ <Swords size={18} /></>}
          </button>
        </div>
      </div>

      {simulationResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 animate-slideUp">
          <div className="flex items-center gap-3 mb-6 text-indigo-700">
            <Swords className="text-indigo-600" />
            <h3 className="text-xl font-bold">Wargame Results</h3>
          </div>
          <div className="prose prose-slate max-w-none">
            <MarkdownRenderer content={simulationResult} />
          </div>
        </div>
      )}
    </div>
  );

  const renderJournal = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="The Socratic Journal" 
        subtitle="Journaling is often just venting. This tool turns it into growth. Write your thoughts, and the AI will act as Socrates—asking one piercing question to reveal your blind spots." 
      />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
           <h3 className="text-slate-500 font-bold text-sm uppercase mb-4 flex items-center gap-2">
             <Feather size={14} /> Your Reflection
           </h3>
           <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write freely. What is on your mind? What are you anxious about? What are you avoiding?..."
            className="w-full flex-1 bg-transparent outline-none resize-none text-slate-700 leading-relaxed placeholder:text-slate-300"
          />
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400">{journalEntry.length} chars</span>
            <button
              onClick={handleJournalReflect}
              disabled={isReflecting || !journalEntry}
              className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isReflecting ? "Thinking..." : <>Deepen This ✨ <Brain size={14} /></>}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-lg border border-slate-700 h-full flex flex-col justify-center items-center text-center transition-all duration-500 ${socraticQuestion ? 'opacity-100' : 'opacity-50'}`}>
            {socraticQuestion ? (
              <div className="animate-fadeIn">
                 <Brain size={48} className="text-amber-500 mx-auto mb-6" />
                 <p className="text-2xl font-serif leading-relaxed text-amber-50 font-bold italic">
                   "{socraticQuestion}"
                 </p>
                 <div className="mt-8 text-xs text-slate-500 uppercase tracking-widest">The Socratic Question</div>
              </div>
            ) : (
              <div className="text-slate-600">
                <Compass size={48} className="mx-auto mb-4 opacity-20" />
                <p>The Insight Engine is waiting for your words.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkillTree = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="Skill Tree Architect" 
        subtitle="Turn any vague ambition into a gamified roadmap. From Novice to Master, with Boss Battles." 
      />
      
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleBuildSkillTree()}
          placeholder="I want to learn... (e.g. 'Public Speaking', 'Gardening', 'Python')"
          className="flex-1 bg-white p-4 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-slate-700"
        />
        <button
          onClick={handleBuildSkillTree}
          disabled={isBuildingTree || !skillInput}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isBuildingTree ? "Designing..." : <>Build Tree ✨ <Layers size={18} /></>}
        </button>
      </div>

      {skillTree && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-slideUp relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-purple-600"></div>
          <div className="flex items-center gap-3 mb-6 text-slate-800">
             <Layers className="text-purple-600" />
             <h3 className="text-xl font-bold">Curriculum Generated</h3>
          </div>
          <MarkdownRenderer content={skillTree} />
        </div>
      )}
    </div>
  );

  const renderAlchemist = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="Communication Alchemist" 
        subtitle="Don't send that angry text. Let the AI transmute your raw emotions into effective, high-status communication." 
      />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase text-slate-400 mb-2">Your Raw Draft</label>
          <textarea
            value={commInput}
            onChange={(e) => setCommInput(e.target.value)}
            placeholder="Paste your messy draft here. (e.g., 'I am so annoyed that you never do the dishes, it's unfair...')"
            className="w-full h-64 p-4 bg-white rounded-xl border border-slate-200 focus:border-amber-500 outline-none resize-none text-slate-700 mb-4"
          />
          <button
            onClick={handleRewriteComm}
            disabled={isRewriting || !commInput}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {isRewriting ? "Transmuting..." : <>Rewrite Magic ✨ <RefreshCw size={18} /></>}
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-64 md:h-auto overflow-y-auto">
          <label className="text-xs font-bold uppercase text-slate-400 mb-4 block">Alchemized Output</label>
          {commOutput ? (
             <MarkdownRenderer content={commOutput} />
          ) : (
             <div className="text-slate-400 text-center mt-12 italic">
               Waiting for input...
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSparring = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="Intellectual Sparring" 
        subtitle="Do not fear being wrong; fear being uncorrected. Submit a belief or plan, and the AI will act as 'The Devil's Advocate' to stress-test it for weakness." 
      />
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <label className="block text-slate-700 font-bold mb-2">What do you believe?</label>
        <textarea
          value={sparringInput}
          onChange={(e) => setSparringInput(e.target.value)}
          placeholder="E.g., 'I think college is a scam,' or 'I want to start a coffee shop with my life savings.'"
          className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 outline-none resize-none text-slate-700 mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSparring}
            disabled={isSparring || !sparringInput}
            className="bg-rose-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSparring ? <span className="animate-pulse">Analyzing Flaws...</span> : <>Challenge Me ✨ <Gavel size={18} /></>}
          </button>
        </div>
      </div>

      {sparringOutput && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 animate-slideUp">
          <div className="flex items-center gap-3 mb-6 text-rose-800">
            <Gavel className="text-rose-700" />
            <h3 className="text-xl font-bold">The Verdict</h3>
          </div>
          <div className="prose prose-slate max-w-none">
            <MarkdownRenderer content={sparringOutput} />
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <SectionHeader 
        title="History's Mirror" 
        subtitle="You are not the first person to feel this way. Describe your struggle, and find out which historical figure faced the exact same darkness." 
      />
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
         <label className="block text-slate-700 font-bold mb-2">What is your struggle?</label>
         <textarea
          value={historyInput}
          onChange={(e) => setHistoryInput(e.target.value)}
          placeholder="E.g., 'I was fired publicly and feel humiliated,' or 'I am afraid to release my art because of critics.'"
          className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-amber-500 outline-none resize-none text-slate-700 mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleHistoryMirror}
            disabled={isSearchingHistory || !historyInput}
            className="bg-amber-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSearchingHistory ? <span className="animate-pulse">Consulting Archives...</span> : <>Find Parallel ✨ <ScrollText size={18} /></>}
          </button>
        </div>
      </div>

      {historyOutput && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 animate-slideUp relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <ScrollText size={100} className="text-amber-900" />
           </div>
          <div className="flex items-center gap-3 mb-6 text-amber-900 relative z-10">
            <ScrollText className="text-amber-700" />
            <h3 className="text-xl font-bold">The Precedent</h3>
          </div>
          <div className="prose prose-slate max-w-none relative z-10">
            <MarkdownRenderer content={historyOutput} />
          </div>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fadeIn">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">The Mentor</h2>
          <p className="text-slate-500">A dialogue for clarity, not just comfort.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {Object.keys({ "Strategist":1, "Stoic":1, "Therapist":1 }).map(p => (
            <button
              key={p}
              onClick={() => setCoachPersona(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                coachPersona === p 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.role === 'model' ? <MarkdownRenderer content={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              placeholder={`Ask the ${coachPersona}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:border-slate-400 transition-colors"
            />
            <button 
              onClick={handleChat}
              disabled={!chatInput.trim() || isChatting}
              className="p-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-slate-900 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReading = () => {
    if (!selectedPost) return null;
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn pb-12">
        <button 
          onClick={() => setActiveTab('home')} 
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ArrowRight className="rotate-180" size={16} /> Back to Dashboard
        </button>
        
        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-8 border-b border-slate-100 pb-8">
            <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-3 block">
              {selectedPost.category} • {selectedPost.readTime}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-amber-500 italic text-slate-600">
              "{selectedPost.wisdom}"
            </div>
          </div>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-700">
            <MarkdownRenderer content={selectedPost.content} />
          </div>
        </article>
      </div>
    );
  };

  const renderLibrary = () => (
    <div className="animate-fadeIn">
      <SectionHeader 
        title="Wisdom Database" 
        subtitle="Mental models and laws of life. These are the lenses through which the wise see the world." 
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MENTAL_MODELS.map((model, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors group h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Lightbulb className="text-slate-400 group-hover:text-amber-500 transition-colors" size={24} />
              <span className="text-xs font-bold text-slate-300 uppercase">{model.domain}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">{model.title}</h4>
            <p className="text-slate-600 leading-relaxed flex-grow">{model.summary}</p>
          </div>
        ))}
        {/* Placeholder for dynamic expansion */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400 flex-col gap-2">
          <Brain size={32} />
          <p className="text-sm font-medium">Database updating...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-amber-200">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-50">
        <div className="font-serif font-bold text-xl flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg">N</div>
          The Nexus
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex max-w-7xl mx-auto min-h-screen">
        
        {/* Sidebar Navigation */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-8">
            <div className="font-serif font-bold text-2xl flex items-center gap-2 mb-10 text-slate-900">
              <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg shadow-lg">N</div>
              The Nexus
            </div>

            <nav className="space-y-2">
              <NavItem 
                icon={Feather} 
                label="Dashboard" 
                active={activeTab === 'home'} 
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={Brain} 
                label="Problem Solver" 
                active={activeTab === 'solver'} 
                onClick={() => { setActiveTab('solver'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={Swords} 
                label="Decision Wargame" 
                active={activeTab === 'simulator'} 
                onClick={() => { setActiveTab('simulator'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={Gavel} 
                label="Devil's Advocate" 
                active={activeTab === 'sparring'} 
                onClick={() => { setActiveTab('sparring'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={PenTool} 
                label="Socratic Journal" 
                active={activeTab === 'journal'} 
                onClick={() => { setActiveTab('journal'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={ScrollText} 
                label="History's Mirror" 
                active={activeTab === 'history'} 
                onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={Layers} 
                label="Skill Tree" 
                active={activeTab === 'skilltree'} 
                onClick={() => { setActiveTab('skilltree'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={RefreshCw} 
                label="Comm. Alchemist" 
                active={activeTab === 'alchemist'} 
                onClick={() => { setActiveTab('alchemist'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={MessageSquare} 
                label="AI Mentor" 
                active={activeTab === 'chat'} 
                onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={BookOpen} 
                label="The Archive" 
                active={activeTab === 'archive' || activeTab === 'reading'} 
                onClick={() => { setActiveTab('archive'); setMobileMenuOpen(false); }} 
              />
              <NavItem 
                icon={Compass} 
                label="Wisdom DB" 
                active={activeTab === 'library'} 
                onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }} 
              />
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Seeker Level 4</div>
                <div className="text-xs text-slate-500">Day 1 of Clarity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 md:pb-24 overflow-y-auto h-screen">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'solver' && renderSolver()}
          {activeTab === 'simulator' && renderSimulator()}
          {activeTab === 'sparring' && renderSparring()}
          {activeTab === 'journal' && renderJournal()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'skilltree' && renderSkillTree()}
          {activeTab === 'alchemist' && renderAlchemist()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'reading' && renderReading()}
          {activeTab === 'archive' && (
             <div className="animate-fadeIn">
               <SectionHeader title="The Archive" subtitle="Deep dives into psychology, history, and wealth." />
               <div className="grid md:grid-cols-2 gap-8">
                 {BLOG_POSTS.map((post) => (
                   <div key={post.id} onClick={() => { setSelectedPost(post); setActiveTab('reading'); }} className="cursor-pointer group">
                     <div className="h-48 bg-slate-200 rounded-xl mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-800 opacity-10 group-hover:opacity-0 transition-opacity"></div>
                        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                          {post.category}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">{post.title}</h3>
                     <p className="text-slate-500 leading-relaxed">{post.context}</p>
                   </div>
                 ))}
               </div>
             </div>
          )}
          {activeTab === 'library' && renderLibrary()}
        </main>

      </div>
    </div>
  );
}
