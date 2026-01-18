import React, { useState, useRef, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, AlertTriangle, Droplets, Globe, Info, 
  ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, Sparkles, MessageSquare, 
  FileText, Play, Mic, Send, Loader, Volume2, StopCircle, User, Github, Linkedin, 
  Twitter, Instagram, ExternalLink
} from 'lucide-react';

// --- DATA PROCESSING & SIMULATION ---

// 1. Snapshot Data (2026 Projections based on "Economy info.csv")
const currentEconomyData = [
  { country: "United States", gdpNominal: 30.62, gdpPPP: 31.82, growth: 2.0, debt: 120.8, inflation: 2.2, reserves: 910, military: 997, cpi: 69, population: 349, sector: "Services" },
  { country: "China", gdpNominal: 19.40, gdpPPP: 43.49, growth: 4.8, debt: 102.3, inflation: 1.5, reserves: 3456, military: 314, cpi: 42, population: 1410, sector: "Industry" },
  { country: "Germany", gdpNominal: 5.01, gdpPPP: 6.55, growth: 0.2, debt: 66.0, inflation: 2.2, reserves: 377, military: 88.5, cpi: 78, population: 84, sector: "Industry" },
  { country: "Japan", gdpNominal: 4.28, gdpPPP: 6.76, growth: 1.1, debt: 260.0, inflation: 2.1, reserves: 1200, military: 50.0, cpi: 73, population: 123, sector: "Services" },
  { country: "India", gdpNominal: 4.13, gdpPPP: 17.71, growth: 6.6, debt: 83.0, inflation: 4.5, reserves: 640, military: 81.0, cpi: 40, population: 1440, sector: "Services" },
  { country: "United Kingdom", gdpNominal: 3.96, gdpPPP: 4.45, growth: 1.3, debt: 98.0, inflation: 2.3, reserves: 180, military: 68.0, cpi: 73, population: 68, sector: "Services" },
  { country: "France", gdpNominal: 3.36, gdpPPP: 4.53, growth: 0.7, debt: 110.0, inflation: 2.4, reserves: 240, military: 56.0, cpi: 71, population: 66, sector: "Services" },
  { country: "Russia", gdpNominal: 2.54, gdpPPP: 7.14, growth: 0.6, debt: 21.0, inflation: 7.2, reserves: 580, military: 100.0, cpi: 29, population: 145, sector: "Energy" },
  { country: "Brazil", gdpNominal: 2.23, gdpPPP: 4.97, growth: 2.4, debt: 85.0, inflation: 4.1, reserves: 360, military: 24.0, cpi: 38, population: 218, sector: "Agriculture" },
  { country: "Canada", gdpNominal: 2.28, gdpPPP: 2.40, growth: 1.2, debt: 106.0, inflation: 2.1, reserves: 119, military: 27.2, cpi: 76, population: 40, sector: "Services" },
  { country: "Italy", gdpNominal: 2.54, gdpPPP: 3.20, growth: 0.5, debt: 140.0, inflation: 1.9, reserves: 220, military: 32.0, cpi: 60, population: 59, sector: "Services" },
];

// 2. Historical/Projected Data (Extracted from country specific CSVs)
const timeSeriesData = {
  "United States": [
    { year: 2000, gdp: 10.25, growth: 4.1, pppPerCap: 36000 },
    { year: 2010, gdp: 14.99, growth: 2.7, pppPerCap: 48000 },
    { year: 2020, gdp: 21.06, growth: -2.2, pppPerCap: 63000 },
    { year: 2024, gdp: 28.10, growth: 2.5, pppPerCap: 82000 },
    { year: 2026, gdp: 30.62, growth: 2.0, pppPerCap: 92883 },
    { year: 2030, gdp: 36.81, growth: 1.8, pppPerCap: 105499 }
  ],
  "China": [
    { year: 2000, gdp: 1.21, growth: 8.5, pppPerCap: 2800 },
    { year: 2010, gdp: 6.08, growth: 10.6, pppPerCap: 9300 },
    { year: 2020, gdp: 14.68, growth: 2.2, pppPerCap: 17000 },
    { year: 2024, gdp: 18.20, growth: 5.0, pppPerCap: 24000 },
    { year: 2026, gdp: 20.65, growth: 4.2, pppPerCap: 31023 },
    { year: 2030, gdp: 26.33, growth: 3.4, pppPerCap: 38986 }
  ],
  "India": [
    { year: 2000, gdp: 0.46, growth: 3.8, pppPerCap: 1890 },
    { year: 2010, gdp: 1.70, growth: 8.5, pppPerCap: 4200 },
    { year: 2020, gdp: 2.67, growth: -5.8, pppPerCap: 6500 },
    { year: 2024, gdp: 3.90, growth: 7.2, pppPerCap: 9800 },
    { year: 2026, gdp: 4.50, growth: 6.2, pppPerCap: 12964 },
    { year: 2030, gdp: 6.62, growth: 6.5, pppPerCap: 17278 }
  ],
  "Germany": [
    { year: 2000, gdp: 1.95, growth: 2.9, pppPerCap: 32037 },
    { year: 2010, gdp: 3.40, growth: 4.2, pppPerCap: 40000 },
    { year: 2020, gdp: 3.89, growth: -3.8, pppPerCap: 56000 },
    { year: 2024, gdp: 4.80, growth: 0.3, pppPerCap: 65000 },
    { year: 2026, gdp: 5.32, growth: 0.9, pppPerCap: 75480 },
    { year: 2030, gdp: 6.01, growth: 0.7, pppPerCap: 84291 }
  ]
};

// 3. Resource Reserves (Oil, Gas, Coal, Water)
const resourceData = [
  { country: "Venezuela", oil: 299, gas: 201, coal: 0.8, water: 40 },
  { country: "Saudi Arabia", oil: 266, gas: 303, coal: 0, water: 2.3 },
  { country: "Russia", oil: 80, gas: 1688, coal: 176, water: 190 },
  { country: "United States", oil: 35, gas: 322, coal: 254, water: 97 },
  { country: "China", oil: 25, gas: 184, coal: 149, water: 138 },
  { country: "Iran", oil: 157, gas: 1183, coal: 1.2, water: 11 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// --- COMPONENTS ---

const Card = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
        <Icon size={20} />
      </div>
    </div>
    {subtext && (
      <div className="mt-4 flex items-center text-sm">
        {trend === 'up' ? <ArrowUpRight size={16} className="text-emerald-500 mr-1" /> : trend === 'down' ? <ArrowDownRight size={16} className="text-red-500 mr-1" /> : null}
        <span className={trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}>{subtext}</span>
      </div>
    )}
  </div>
);

const InsightBox = ({ title, children }) => (
  <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
    <h4 className="flex items-center text-blue-400 font-semibold mb-2">
      <Info size={18} className="mr-2" /> {title}
    </h4>
    <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
  </div>
);

const SocialLink = ({ href, icon: Icon, label, color }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`flex items-center p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:bg-slate-700 transition-all group ${color}`}
  >
    <div className="mr-4 p-2 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-semibold text-slate-200 group-hover:text-white">{label}</h4>
      <p className="text-xs text-slate-400 flex items-center">
        View Profile <ExternalLink size={10} className="ml-1" />
      </p>
    </div>
  </a>
);

// --- GEMINI API HELPER FUNCTIONS ---

const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL_NAME = "gemini-2.5-flash-preview-tts";

const callGemini = async (systemInstruction, userQuery) => {
  const apiKey = ""; // Provided by environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I am unable to connect to the global economic database at this moment.";
  }
};

const callTTS = async (text) => {
  const apiKey = ""; // Provided by environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL_NAME}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Fenrir" } 
        }
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`TTS API Error: ${response.status}`);
    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      return `data:audio/wav;base64,${audioData}`; 
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Helper to convert raw PCM to WAV (simple implementation for 24kHz mono)
function pcmToWav(base64PCM) {
  const binaryString = window.atob(base64PCM);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // channel count (1 for mono)
  view.setUint16(22, 1, true);
  // sample rate (24000 for Gemini TTS usually)
  view.setUint32(24, 24000, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 24000 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, len, true);

  // Write PCM samples
  const bytes = new Uint8Array(buffer, 44);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


// --- MAIN DASHBOARD ---

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  
  // AI State
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    { role: 'model', text: 'Hello, Director. I am your AI Economic Analyst. Ask me anything about the global risk outlook, debt ratios, or growth forecasts for 2026.' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // --- DERIVED DATA & CALCULATIONS ---

  const riskData = currentEconomyData.map(c => ({
    ...c,
    riskScore: ((c.debt / 300) * 50) + (c.inflation * 5) + ((100 - c.cpi) * 0.5), 
    stability: c.cpi
  })).sort((a, b) => b.riskScore - a.riskScore);

  // --- AI HANDLERS ---

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMessage = { role: 'user', text: aiChatInput };
    setAiChatHistory(prev => [...prev, userMessage]);
    setAiChatInput('');
    setIsAiLoading(true);

    const context = `
      You are an AI Economic Analyst embedded in a dashboard.
      Current Date: Jan 2026.
      
      DATASET:
      ${JSON.stringify(currentEconomyData)}
      
      RISK SCORES (Calculated):
      ${JSON.stringify(riskData.map(c => ({ country: c.country, riskScore: c.riskScore.toFixed(1) })))}
      
      INSTRUCTIONS:
      - Answer concisely.
      - Use bold text for key figures.
      - If asked about risk, refer to the calculated Risk Scores.
      - Maintain a professional, executive tone.
    `;

    const responseText = await callGemini(context, aiChatInput);
    
    setAiChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setIsAiLoading(false);
  };

  const generateBriefing = async (type) => {
    setIsAiLoading(true);
    setGeneratedReport(null);
    
    const context = `
      You are a Chief Economist. Generate a ${type} Briefing for the Board of Directors.
      Use the following data: ${JSON.stringify(currentEconomyData)}.
      Focus on the top 3 outliers or key trends.
      Format neatly with Markdown-like headers.
      Keep it under 150 words.
    `;
    
    const prompt = `Generate a ${type} executive summary.`;
    const report = await callGemini(context, prompt);
    setGeneratedReport(report);
    setIsAiLoading(false);
  };

  const readReportAloud = async () => {
    if (!generatedReport) return;
    setIsAiLoading(true);
    try {
      const cleanText = generatedReport.replace(/\*/g, '');
      const audioUrl = await callTTS(cleanText); 
      if (audioUrl) {
         const base64 = audioUrl.split(',').pop(); 
         const wavUrl = pcmToWav(base64);
         
         if (audioRef.current) {
             audioRef.current.src = wavUrl;
             audioRef.current.play();
             setIsPlayingAudio(true);
             audioRef.current.onended = () => setIsPlayingAudio(false);
         }
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
    setIsAiLoading(false);
  };

  const stopAudio = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card title="Global GDP (Nominal)" value="$112.5 T" subtext="+3.2% vs 2024" icon={Globe} trend="up" />
              <Card title="Avg Global Inflation" value="4.8%" subtext="-1.2% Cooling Down" icon={TrendingUp} trend="down" />
              <Card title="Highest Growth" value="India (6.6%)" subtext="Major Economy" icon={Activity} trend="up" />
              <Card title="Energy Transition" value="18.2%" subtext="Renewable Share" icon={Droplets} trend="up" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top 10 Economies (Nominal vs PPP)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentEconomyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="country" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Bar dataKey="gdpNominal" name="GDP Nominal ($T)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gdpPPP" name="GDP PPP ($T)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Global Reserve Distribution</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentEconomyData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="reserves"
                        nameKey="country"
                        label
                      >
                        {currentEconomyData.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-slate-400 text-sm mt-2">Foreign Exchange Reserves (USD Billions)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Economic Structure by Sector</h3>
                  <InsightBox title="Sector Analysis">
                    Advanced economies like the US and UK rely heavily on <strong>Services</strong> ({'>'}70%). 
                    Developing giants like China and India still have massive <strong>Industrial</strong> and <strong>Agricultural</strong> bases, 
                    though they are rapidly transitioning.
                  </InsightBox>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Country</th>
                          <th className="px-4 py-3">Primary Sector</th>
                          <th className="px-4 py-3">Growth (2025/26)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEconomyData.map((c, i) => (
                          <tr key={c.country} className="border-b border-slate-700 hover:bg-slate-700/20">
                            <td className="px-4 py-3 font-medium text-white">{c.country}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs ${c.sector === 'Services' ? 'bg-blue-500/20 text-blue-400' : c.sector === 'Industry' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {c.sector}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">{c.growth}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
               
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-white mb-4">Population vs GDP Potential</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="population" name="Population" unit="M" stroke="#94a3b8" label={{ value: 'Population (Millions)', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
                      <YAxis type="number" dataKey="gdpPPP" name="GDP PPP" unit="$T" stroke="#94a3b8" label={{ value: 'GDP PPP ($T)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                      <Scatter name="Countries" data={currentEconomyData} fill="#8884d8">
                        {currentEconomyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-500 mt-2">Bubble size indicates market potential. High population + Low GDP = Emerging Market.</p>
               </div>
            </div>
          </div>
        );

      case 'growth':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-slate-400">Select Economy:</span>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.keys(timeSeriesData).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">GDP Nominal Trajectory (Historical & Projected)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData[selectedCountry]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                      <Area type="monotone" dataKey="gdp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGdp)" name="GDP ($T)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Purchasing Power Parity Per Capita</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData[selectedCountry]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                      <Legend />
                      <Line type="monotone" dataKey="pppPerCap" stroke="#10b981" strokeWidth={3} dot={{r: 6}} name="Income Per Capita (PPP)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <InsightBox title="Growth Analysis">
              The data for <strong>{selectedCountry}</strong> shows a {timeSeriesData[selectedCountry][5].gdp > timeSeriesData[selectedCountry][2].gdp ? "strong upward trend" : "stagnation"} post-2020. 
              The dip in 2020 reflects the global pandemic impact, followed by recovery. By 2030, nominal GDP is projected to reach 
              ${timeSeriesData[selectedCountry][5].gdp} Trillion.
            </InsightBox>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-6">
            <InsightBox title="Risk Methodology">
              This dashboard calculates risk based on <strong>Debt-to-GDP Ratio</strong>, <strong>Inflation Rate</strong>, and <strong>Corruption Perception Index (CPI)</strong>.
              <br/>• High Debt ({'>'}100% GDP) = <span className="text-red-400">High Risk</span>
              <br/>• High CPI Score (closer to 100) = <span className="text-emerald-400">Low Risk/High Stability</span>
            </InsightBox>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Matrix: Debt vs Inflation</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" dataKey="debt" name="Debt % GDP" unit="%" stroke="#94a3b8" label={{ value: 'Debt (% of GDP)', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
                        <YAxis type="number" dataKey="inflation" name="Inflation" unit="%" stroke="#94a3b8" label={{ value: 'Inflation Rate (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <ZAxis type="number" dataKey="riskScore" range={[100, 500]} name="Risk Score" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter name="Countries" data={riskData} fill="#ef4444">
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.debt > 100 ? '#ef4444' : entry.inflation > 5 ? '#f59e0b' : '#10b981'} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Highest Risk Profiles</h3>
                  <div className="space-y-4">
                    {riskData.slice(0, 5).map((country, idx) => (
                      <div key={country.country} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-slate-400 font-mono mr-3 text-lg">#{idx + 1}</span>
                          <div>
                            <p className="text-white font-medium">{country.country}</p>
                            <p className="text-xs text-slate-400">Debt: {country.debt}% | Inf: {country.inflation}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${country.riskScore > 40 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {country.riskScore > 40 ? 'CRITICAL' : 'WARNING'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">Stability Index (Corruption Perception & HDI)</h3>
               <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                    <YAxis dataKey="country" type="category" stroke="#94a3b8" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Bar dataKey="cpi" name="Corruption Perception Index (Higher is Better)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'reserves':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card title="Global Oil Reserves" value="1.7 T" subtext="Barrels Proven" icon={Droplets} trend="neutral" />
              <Card title="Natural Gas" value="6.9 Q" subtext="Cubic Feet" icon={TrendingUp} trend="neutral" />
              <Card title="Fresh Water Stress" value="High" subtext="Middle East & N. Africa" icon={AlertTriangle} trend="down" />
              <Card title="Coal Dependency" value="Declining" subtext="Shift to Green" icon={TrendingUp} trend="down" />
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Reserves Comparison</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="country" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend />
                    <Bar dataKey="oil" name="Oil (Billion Barrels)" fill="#f59e0b" />
                    <Bar dataKey="gas" name="Gas (Trillion Cu Ft / 10)" fill="#3b82f6" />
                    <Bar dataKey="coal" name="Coal (Billion Tons)" fill="#64748b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <h3 className="text-lg font-semibold text-white mb-4">Strategic Resource Radar</h3>
               <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resourceData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="country" stroke="#94a3b8" />
                      <PolarRadiusAxis stroke="#475569" />
                      <Radar name="Oil Reserves" dataKey="oil" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.1} />
                      <Radar name="Gas Reserves" dataKey="gas" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.1} />
                      <Legend />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-center text-slate-400 mt-4">Comparing Oil vs Gas dominance. Russia and Iran dominate Gas; Venezuela and Saudis dominate Oil.</p>
            </div>
          </div>
        );

      case 'ai-analyst':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            {/* Left Col: Instant Reports */}
            <div className="space-y-6 flex flex-col">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Sparkles className="text-yellow-400 mr-2" /> 
                  Automated Executive Briefing
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Select a domain to generate an instant, data-driven report using the latest Gemini Pro models.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => generateBriefing('Risk Assessment')}
                    className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-all"
                  >
                    <ShieldAlert className="text-red-400 mb-2" />
                    <span className="font-semibold text-white block">Risk Assessment</span>
                    <span className="text-xs text-slate-400">Debt & Inflation outlook</span>
                  </button>
                  <button 
                    onClick={() => generateBriefing('Growth Opportunities')}
                    className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-all"
                  >
                    <TrendingUp className="text-emerald-400 mb-2" />
                    <span className="font-semibold text-white block">Growth Opps</span>
                    <span className="text-xs text-slate-400">Emerging markets & GDP</span>
                  </button>
                </div>

                {/* Report Output Area */}
                <div className="flex-1 bg-slate-900 rounded-lg p-4 border border-slate-800 overflow-y-auto relative">
                  {isAiLoading && !generatedReport && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                      <Loader className="animate-spin text-blue-500" size={32} />
                      <span className="ml-3 text-blue-400 animate-pulse">Consulting Gemini...</span>
                    </div>
                  )}
                  
                  {generatedReport ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                       <React.Fragment>
                         {generatedReport.split('\n').map((line, i) => (
                           <p key={i} className="mb-2">{line}</p>
                         ))}
                       </React.Fragment>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <FileText size={48} className="mb-4" />
                      <p>Report content will appear here</p>
                    </div>
                  )}
                </div>

                {/* Report Actions */}
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={readReportAloud}
                    disabled={!generatedReport || isAiLoading}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center font-medium transition-colors ${
                      !generatedReport ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                      isPlayingAudio ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isAiLoading ? <Loader className="animate-spin mr-2" size={18} /> : 
                     isPlayingAudio ? <StopCircle className="mr-2" size={18} /> : 
                     <Volume2 className="mr-2" size={18} />}
                    {isPlayingAudio ? "Stop Reading" : "Read Briefing Aloud"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Chat */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <MessageSquare className="text-blue-400 mr-2" />
                  Ask the Economist
                </h3>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                  Powered by Gemini 2.5
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {aiChatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAiLoading && !generatedReport && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleAiChat} className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="relative">
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Ask about specific countries, risks, or comparisons..."
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    disabled={!aiChatInput.trim() || isAiLoading}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
            
            {/* Hidden Audio Element */}
            <audio ref={audioRef} className="hidden" />
          </div>
        );

      case 'creator':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                 <span className="text-4xl font-bold text-white">R</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Ritik</h2>
              <p className="text-blue-400 font-medium mb-6">BI Developer & Data Analyst</p>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Specializing in economic risk analysis, growth modeling, and interactive dashboard design. 
                Leveraging advanced data visualization to drive business decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                 <SocialLink href="https://github.com/Ritik574-coder" icon={Github} label="GitHub" color="hover:text-white" />
                 <SocialLink href="https://www.linkedin.com/in/ritik-kumar-b81b32375/" icon={Linkedin} label="LinkedIn" color="hover:text-blue-400" />
                 <SocialLink href="https://public.tableau.com/app/profile/ritik.sky" icon={Activity} label="Tableau Public" color="hover:text-orange-400" />
                 <SocialLink href="https://x.com/KarlX279873" icon={Twitter} label="X (Twitter)" color="hover:text-sky-400" />
                 <SocialLink href="https://www.instagram.com/ritik_sky1/?__pwa=1" icon={Instagram} label="Instagram" color="hover:text-pink-500" />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            EconVision
          </span>
        </div>

        <nav className="space-y-2">
          <SidebarItem icon={Globe} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={TrendingUp} label="Growth & Trends" active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
          <SidebarItem icon={ShieldAlert} label="Risk Analysis" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
          <SidebarItem icon={Droplets} label="Reserves" active={activeTab === 'reserves'} onClick={() => setActiveTab('reserves')} />
          
          <div className="pt-4 pb-2">
            <div className="h-px bg-slate-800 mx-2"></div>
          </div>
          
          <SidebarItem icon={Sparkles} label="AI Analyst" active={activeTab === 'ai-analyst'} onClick={() => setActiveTab('ai-analyst')} isSpecial />
          <SidebarItem icon={User} label="Creator Profile" active={activeTab === 'creator'} onClick={() => setActiveTab('creator')} />
        </nav>

        <div className="mt-auto pt-8 px-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Analyst Note</h4>
            <p className="text-xs text-slate-500">
              Data updated for 2026 Fiscal projections. Inflation metrics adjusted for post-crisis stabilization.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize flex items-center">
              {activeTab === 'ai-analyst' && <Sparkles className="mr-2 text-yellow-400" size={24} />}
              {activeTab === 'ai-analyst' ? 'AI Economic Analyst' : activeTab === 'creator' ? 'Creator Profile' : `${activeTab} Dashboard`}
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === 'ai-analyst' 
                ? 'Powered by Google Gemini 2.5 Flash • Real-time Data Synthesis' 
                : activeTab === 'creator'
                ? 'Meet the developer behind the insights'
                : 'Real-time economic indicators and predictive analytics'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Source: World Bank / IMF / Gemini
            </span>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, isSpecial }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? isSpecial 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/50 border border-purple-500/50' 
          : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : isSpecial 
          ? 'text-purple-300 hover:bg-slate-800 hover:text-white' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} className={!active && isSpecial ? "text-purple-400 animate-pulse" : ""} />
    <span className="font-medium">{label}</span>
  </button>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl">
        <p className="font-bold text-white mb-1">{payload[0].payload.country}</p>
        <p className="text-sm text-slate-300">Debt: {payload[0].payload.debt}%</p>
        <p className="text-sm text-slate-300">Inflation: {payload[0].payload.inflation}%</p>
        <p className="text-sm text-slate-300">Risk Score: {payload[0].payload.riskScore.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};
