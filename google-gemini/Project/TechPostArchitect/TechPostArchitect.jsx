import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, 
  Terminal, 
  Cpu, 
  MessageSquare, 
  Copy, 
  Check, 
  Code, 
  Briefcase, 
  Hash, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  FileText,
  Sparkles,
  ShieldAlert,
  Wand2,
  X,
  Upload,
  Image as ImageIcon,
  FileCode,
  Paperclip,
  Trash2,
  User,
  Download,
  Printer
} from 'lucide-react';

/* -------------------------------------------------------------------
  TECH CONTENT ARCHITECT
  A tool for generating authentic, high-quality technical LinkedIn posts.
  Features:
  - Gemini-powered Authenticity Audits
  - Technical Deep Dive Generation
  - Multi-modal Support (Images, PDFs, Markdown)
  - Personal Branding & Download Options (PDF/TXT)
  -------------------------------------------------------------------
*/

const TechPostArchitect = () => {
  const [apiKey, setApiKey] = useState(""); // Managed by environment
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  // New Features State
  const [auditResult, setAuditResult] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [strategyResult, setStrategyResult] = useState(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  
  // File Upload State
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    socialLink: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    postType: 'project_showcase',
    techStack: '',
    realityCheck: '',
    techInsight: '',
    audience: 'general_tech',
    tone: 'honest_raw',
    cta: 'feedback'
  });

  // Derived from the output
  const [activeTab, setActiveTab] = useState('main');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // --- FILE HANDLING ---
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/markdown', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
      setError("Unsupported file type. Please use Images, PDF, or Markdown.");
      return;
    }

    setError(null);
    
    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      
      let fileData = {
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        base64: null,
        text: null,
        previewUrl: null
      };

      if (file.type.startsWith('image/')) {
        fileData.base64 = result.split(',')[1];
        fileData.previewUrl = result;
      } else if (file.type === 'application/pdf') {
        fileData.base64 = result.split(',')[1];
      } else {
        // Text/Markdown
        const textReader = new FileReader();
        textReader.onload = (e) => {
           setAttachedFile({ ...fileData, text: e.target.result, base64: null }); 
        };
        textReader.readAsText(file);
        return;
      }
      
      setAttachedFile(fileData);
    };

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file); 
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- DOWNLOAD HANDLERS ---
  const handleDownloadTxt = () => {
    if (!generatedContent?.raw) return;
    const element = document.createElement("a");
    const file = new Blob([generatedContent.raw], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `linkedin_draft_${personalInfo.name.replace(/\s+/g, '_') || 'architect'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = () => {
    if (!generatedContent?.raw) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Please allow popups to download PDF");
        return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LinkedIn Post Strategy - ${personalInfo.name || 'Draft'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { margin-bottom: 30px; font-size: 0.9em; color: #555; background: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid #e4e4e7; }
            .content { white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e4e4e7; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .footer { margin-top: 40px; font-size: 0.8em; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            .label { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <h1>LinkedIn Content Strategy Draft</h1>
          <div class="meta">
            <p><span class="label">Author:</span> ${personalInfo.name || 'Not Provided'}</p>
            <p><span class="label">Social Link:</span> ${personalInfo.socialLink || 'Not Provided'}</p>
            <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
            <p><span class="label">Strategy Type:</span> ${formData.postType}</p>
          </div>
          <div class="content">${generatedContent.raw}</div>
          <div class="footer">Generated by TechPostArchitect</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const generatePost = async () => {
    setLoading(true);
    setError(null);
    setGeneratedContent(null);
    setAuditResult(null);
    setStrategyResult(null);

    try {
      const systemPrompt = `
        Act as a professional LinkedIn Technical Content Strategist with 10+ years of experience.
        Your goal is to write a REAL, PRACTICAL, TECH-FOCUSED post.
        
        STRICT RULES:
        - NO fake motivation ("You can do it too!").
        - NO "10x hustle" or "grindset" language.
        - NO emoji overload (max 2).
        - NO generic advice.
        - Focus on specific engineering details, tradeoffs, and lessons.
        - Tone must be: ${formData.tone.replace('_', ' ')}.

        MANDATORY STRUCTURE:
        1. Hook (1-2 lines, grounded/technical)
        2. Context (What I was working on)
        3. What I Built/Solved (Factual)
        4. Technical Insight (The non-obvious part)
        5. Lesson Learned (Practical)
        6. What's Next (Optional)
        7. Call-to-Action (${formData.cta})
        8. Hashtags (5-7 real tech tags)

        If the user provided their name (${personalInfo.name}) or social link (${personalInfo.socialLink}), subtly keep this in mind for the tone or the context, but do not clutter the post body with signatures unless it's a "Recruiter" version where a portfolio link might be useful.

        If an image or file is provided, analyze it deeply to extract specific metrics, code patterns, or architecture details to include in the post.

        After the main post, provide these variations separated by clearly defined headers:
        - SHORT_VERSION (For comments/quick reads)
        - RECRUITER_VERSION (Emphasizing impact and skills)
        - TECHNICAL_DEEP_DIVE (For other engineers)
      `;

      let userPrompt = `
        Here are the details for the post:
        
        1. Post Type: ${formData.postType}
        2. Tech Stack: ${formData.techStack}
        3. WHAT IS REAL (The Work): ${formData.realityCheck}
        4. KEY TECHNICAL INSIGHT: ${formData.techInsight}
        5. Target Audience: ${formData.audience}
        6. Author Info: ${personalInfo.name} (${personalInfo.socialLink})
      `;

      // Construct Payload
      const parts = [];
      
      // If there is a text file (Markdown/logs), append it to the prompt
      if (attachedFile && attachedFile.text) {
        userPrompt += `\n\n[ATTACHED FILE CONTENT (${attachedFile.name})]:\n${attachedFile.text}\n`;
      }

      parts.push({ text: userPrompt });

      // If there is a binary file (Image/PDF), add as inlineData
      if (attachedFile && attachedFile.base64) {
        parts.push({
          inlineData: {
            mimeType: attachedFile.type,
            data: attachedFile.base64
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: parts }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("No content generated.");
      
      setGeneratedContent({ raw: rawText });
      setStep(2);

    } catch (err) {
      setError(err.message || "Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW FEATURE: Fluff Detector Audit ---
  const runAuthenticityAudit = async () => {
    if (!generatedContent?.raw) return;
    setLoadingAudit(true);
    try {
      const systemPrompt = `
        You are a cynical Senior Staff Engineer who hates marketing fluff.
        Analyze the provided LinkedIn post draft.
        
        Output a JSON object with these fields:
        {
          "score": (number 0-100, where 100 is raw engineering logs and 0 is generic influencer fluff),
          "verdict": (Short 1-sentence summary of the tone),
          "flags": [Array of specific strings in the text that sound too 'salesy' or generic],
          "suggestion": (One specific technical detail to add to make it more credible)
        }
      `;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: generatedContent.raw }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );
      
      const data = await response.json();
      setAuditResult(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (e) {
      console.error(e);
      setError("Audit failed. Try again.");
    } finally {
      setLoadingAudit(false);
    }
  };

  // --- NEW FEATURE: Technical Comment Generator ---
  const generateDeepDiveStrategy = async () => {
    if (!generatedContent?.raw) return;
    setLoadingStrategy(true);
    try {
      const systemPrompt = `
        You are a technical mentor. Based on the user's post, generate 2 specific items they can post in the COMMENTS section to drive real engineering engagement.
        
        1. A CODE SNIPPET (Pseudo-code or real code) that demonstrates the core concept mentioned in the post.
        2. A "Hard Truth" or "Trade-off" comment that invites debate.
        
        Output JSON:
        {
          "codeSnippet": "...",
          "codeExplanation": "...",
          "controversialTake": "..."
        }
      `;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: generatedContent.raw }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );

      const data = await response.json();
      setStrategyResult(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (e) {
      console.error(e);
      setError("Strategy generation failed.");
    } finally {
      setLoadingStrategy(false);
    }
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100">
              TechPost<span className="text-indigo-400">Architect</span>
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            v1.3.0 // PERSONAL_BRAND
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold mb-4 text-white">
                Stop Posting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Fluff.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                I am your Technical Content Strategist. I don't write generic advice. 
                Answer these questions or upload your work (Diagrams, Code, Dashboards), 
                and I'll architect a LinkedIn post that engineers will actually respect.
              </p>
            </header>

            <div className="grid gap-8 max-w-3xl mx-auto">
              {/* Question 0: Personal Branding */}
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-sm border border-slate-700">00</div>
                  <h3 className="font-semibold text-slate-200">Personal Branding (Optional)</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Author Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Your Name"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 pl-10"
                        value={personalInfo.name}
                        onChange={(e) => handlePersonalChange('name', e.target.value)}
                      />
                      <User className="absolute left-3 top-3.5 text-slate-600" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Portfolio / LinkedIn URL</label>
                    <input 
                      type="text" 
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                      value={personalInfo.socialLink}
                      onChange={(e) => handlePersonalChange('socialLink', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Question 1: Context */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-sm border border-slate-700">01</div>
                  <h3 className="font-semibold text-slate-200">The Context</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Post Archetype</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        value={formData.postType}
                        onChange={(e) => handleInputChange('postType', e.target.value)}
                      >
                        <option value="project_showcase">Project Showcase</option>
                        <option value="dashboard_analytics">Dashboard / Analytics Result</option>
                        <option value="learning_struggle">Learning Update (The Struggle)</option>
                        <option value="problem_solution">Technical Problem → Solution</option>
                        <option value="architecture_breakdown">Architecture Breakdown</option>
                        <option value="debugging_story">Debugging War Story</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-3.5 text-slate-600 rotate-90 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Tech Stack</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, Supabase, AWS Lambda..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                      value={formData.techStack}
                      onChange={(e) => handleInputChange('techStack', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Question 2: The Meat (Text OR File) */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-sm border border-slate-700">02</div>
                  <h3 className="font-semibold text-slate-200">The Reality Check</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Text Input */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">What did you ACTUALLY do? (Be specific)</label>
                    <textarea 
                      rows={3}
                      placeholder="I migrated a 5TB database to Snowflake... I refactored a legacy class component..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 resize-none"
                      value={formData.realityCheck}
                      onChange={(e) => handleInputChange('realityCheck', e.target.value)}
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-semibold">AND / OR ATTACH PROOF</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,application/pdf,.md,.txt"
                    />
                    {!attachedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="text-indigo-400" size={20} />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Click to upload Evidence</p>
                        <p className="text-xs text-slate-500 mt-1">Images, PDF Diagrams, or Markdown Notes</p>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {attachedFile.type.startsWith('image/') ? (
                             <img src={attachedFile.previewUrl} alt="preview" className="w-10 h-10 rounded object-cover border border-slate-700" />
                          ) : attachedFile.type === 'application/pdf' ? (
                             <div className="w-10 h-10 rounded bg-red-900/20 border border-red-900/50 flex items-center justify-center">
                               <FileText className="text-red-400" size={20}/>
                             </div>
                          ) : (
                             <div className="w-10 h-10 rounded bg-blue-900/20 border border-blue-900/50 flex items-center justify-center">
                               <FileCode className="text-blue-400" size={20}/>
                             </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{attachedFile.name}</p>
                            <p className="text-xs text-slate-500">{attachedFile.size} • {attachedFile.type.startsWith('image/') ? 'Image' : attachedFile.type === 'application/pdf' ? 'PDF' : 'Text'}</p>
                          </div>
                        </div>
                        <button onClick={removeFile} className="p-2 hover:bg-slate-900 rounded-full text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles size={14} /> Key Technical Insight
                    </label>
                    <textarea 
                      rows={2}
                      placeholder="What surprised you? What's the non-obvious takeaway?"
                      className="w-full bg-slate-950 border border-indigo-900/50 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 resize-none"
                      value={formData.techInsight}
                      onChange={(e) => handleInputChange('techInsight', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Question 3: Strategy */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-mono text-sm border border-slate-700">03</div>
                  <h3 className="font-semibold text-slate-200">The Strategy</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Audience</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.audience}
                      onChange={(e) => handleInputChange('audience', e.target.value)}
                    >
                      <option value="general_tech">General Tech</option>
                      <option value="recruiters">Recruiters/Hiring Managers</option>
                      <option value="data_engineers">Data Engineers</option>
                      <option value="frontend_devs">Frontend Devs</option>
                      <option value="beginners">Beginners</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Tone</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                    >
                      <option value="honest_raw">Honest & Raw</option>
                      <option value="calm_professional">Calm & Professional</option>
                      <option value="technical_detailed">Highly Technical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Call to Action</label>
                     <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.cta}
                      onChange={(e) => handleInputChange('cta', e.target.value)}
                    >
                      <option value="feedback">Ask for Feedback</option>
                      <option value="hiring">Open to Work</option>
                      <option value="suggestions">Ask for Suggestions</option>
                      <option value="none">No CTA (Pure Value)</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-200">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={generatePost}
                disabled={loading || (!formData.realityCheck && !attachedFile)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                  ${loading || (!formData.realityCheck && !attachedFile)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.99]'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Architecting Post...
                  </>
                ) : (
                  <>
                    <PenTool size={20} /> Generate Draft
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button 
                onClick={() => setStep(1)}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ChevronRight className="rotate-180 w-4 h-4" /> Back to Inputs
              </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Gemini Tools & Modes */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* GEMINI POWER TOOLS SECTION */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={60} className="text-indigo-400" />
                   </div>
                   <h3 className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-4 flex items-center gap-2">
                     <Cpu size={14} /> AI Refinement Tools
                   </h3>
                   
                   <div className="space-y-3">
                     <button
                        onClick={runAuthenticityAudit}
                        disabled={loadingAudit}
                        className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white"
                     >
                       <div className="flex items-center gap-3">
                         <ShieldAlert size={16} className={auditResult ? "text-green-400" : "text-slate-500"} />
                         <span className="font-medium text-sm">Fluff Detector ✨</span>
                       </div>
                       {loadingAudit && <Loader2 size={14} className="animate-spin" />}
                     </button>

                     <button
                        onClick={generateDeepDiveStrategy}
                        disabled={loadingStrategy}
                        className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white"
                     >
                       <div className="flex items-center gap-3">
                         <Wand2 size={16} className={strategyResult ? "text-indigo-400" : "text-slate-500"} />
                         <span className="font-medium text-sm">Deep Dive Comment ✨</span>
                       </div>
                       {loadingStrategy && <Loader2 size={14} className="animate-spin" />}
                     </button>
                   </div>
                </div>

                {/* Show Results of Tools if they exist */}
                {auditResult && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-in slide-in-from-left-2">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-slate-200 text-sm">Audit Results</h4>
                      <button onClick={() => setAuditResult(null)}><X size={14} className="text-slate-500 hover:text-white"/></button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`text-2xl font-bold ${auditResult.score > 80 ? 'text-green-400' : auditResult.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {auditResult.score}/100
                      </div>
                      <div className="text-xs text-slate-400 leading-tight">Authenticity Score</div>
                    </div>

                    <p className="text-xs text-slate-300 italic mb-3">"{auditResult.verdict}"</p>
                    
                    {auditResult.flags?.length > 0 && (
                      <div className="mb-3">
                         <p className="text-[10px] uppercase text-red-400 font-bold mb-1">Flagged Phrases</p>
                         <div className="flex flex-wrap gap-1">
                           {auditResult.flags.map((flag, i) => (
                             <span key={i} className="text-xs bg-red-900/30 text-red-200 px-2 py-0.5 rounded border border-red-900/50">{flag}</span>
                           ))}
                         </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Fix Suggestion</p>
                      <p className="text-xs text-slate-400">{auditResult.suggestion}</p>
                    </div>
                  </div>
                )}

                {strategyResult && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-in slide-in-from-left-2">
                     <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-slate-200 text-sm">Comment Strategy</h4>
                      <button onClick={() => setStrategyResult(null)}><X size={14} className="text-slate-500 hover:text-white"/></button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1 flex items-center gap-1"><Code size={10}/> Code Snippet</p>
                        <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">{strategyResult.codeSnippet}</pre>
                      </div>

                      <div className="p-3 bg-slate-950 rounded border border-slate-800">
                        <p className="text-[10px] uppercase text-orange-400 font-bold mb-1">Hot Take</p>
                        <p className="text-xs text-slate-300">"{strategyResult.controversialTake}"</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(strategyResult.codeSnippet)}
                      className="mt-3 w-full py-1.5 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded border border-indigo-600/50 transition-colors"
                    >
                      Copy Snippet
                    </button>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">View Modes</h3>
                   <div className="flex flex-col gap-2">
                     {[
                       { id: 'main', label: 'Primary Post', icon: FileText },
                       { id: 'short', label: 'Short / Comment', icon: MessageSquare },
                       { id: 'recruiter', label: 'Recruiter Friendly', icon: Briefcase },
                       { id: 'technical', label: 'Technical Deep Dive', icon: Code },
                     ].map(mode => (
                       <button
                        key={mode.id}
                        onClick={() => setActiveTab(mode.id)}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                          activeTab === mode.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                       >
                         <mode.icon size={16} />
                         <span className="font-medium text-sm">{mode.label}</span>
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              {/* Right Column: The Output */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 h-full flex flex-col">
                  <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownloadTxt}
                        className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors"
                        title="Download as .txt"
                      >
                        <Download size={14} /> TXT
                      </button>
                      <button 
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors"
                        title="Download as PDF"
                      >
                        <Printer size={14} /> PDF
                      </button>
                      <div className="w-px h-4 bg-slate-700 mx-1"></div>
                      <button 
                        onClick={() => copyToClipboard(generatedContent.raw)}
                        className="flex items-center gap-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Copy size={14} /> Copy All
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-8 bg-slate-900 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {generatedContent.raw}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TechPostArchitect;
