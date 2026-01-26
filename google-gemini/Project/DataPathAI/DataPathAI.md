
# 🚀 DataPath AI - Interactive Skill Tracker

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **A cyberpunk-themed learning companion for aspiring Data Engineers**  
> Track your skills, unlock learning paths, and get AI-powered mentorship—all in one place.

![Banner](https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=00FFEA&center=true&vCenter=true&width=600&lines=Built+with+Vibe+Coding;Track+Skills+%7C+AI+Mentor+%7C+Generate+Projects)

---

## 📖 About This Project

**DataPath AI** helps data engineering students track their learning journey through an interactive, gamified interface. It features skill dependency trees, real-time progress tracking, and an AI mentor powered by Google Gemini.

### ✨ Key Features

- **🎯 Skill Tracking**: 15+ data engineering skills with status progression (Not Started → Certified)
- **🔒 Smart Dependencies**: Skills unlock automatically when prerequisites are completed
- **🤖 AI Mentor Chat**: Get explanations, analogies, quiz questions, and career advice
- **🎮 Mission Generator**: AI creates custom coding projects based on your completed skills
- **📊 Visual Dashboard**: Progress analytics with beautiful cyberpunk design
- **☁️ Cloud Sync**: Real-time data synchronization via Firebase

---

## 🎨 Screenshots

<div align="center">

### Command Center Dashboard
*Track your overall progress and domain mastery*
[Data Path AI Link](https://gemini.google.com/share/cbb76e29d9b6)
---
![Command Center](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/DataPathAI/DataPath_Image/Command%20Center.png)

### Skill Topology Roadmap
*Visual skill tree with dependency mapping*

![Skill Matrix1](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/DataPathAI/DataPath_Image/Kill%20topology.png)

![Skill Matrix3](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/DataPathAI/DataPath_Image/Skill%20Topology2.png)

![Skill Matrix4](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/DataPathAI/DataPath_Image/Skill%20Topology3.png)

### AI Mentor Sidebar
*Real-time AI conversations for learning support*

![Skill Matrix2](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/DataPathAI/DataPath_Image/Skill%20Matrix.png)

</div>

---

## 🛠️ Tech Stack

```
Frontend:  React 18 + Tailwind CSS + Lucide Icons
Backend:   Firebase (Auth + Firestore)
AI:        Google Gemini 2.5 Flash API
Tooling:   Vite + ESLint
```

---

## 💡 My Story: Built with "Vibe Coding"

### 👨‍💻 About Me

Hi! I'm **Ritik Kumar**, a Data Engineering student from **Patna, Bihar**. Before this project, I had:

- ✅ **Experience in**: Python, SQL, Power BI, Pandas
- ❌ **Zero experience in**: React, web development, Firebase, frontend frameworks

### 🌟 What is Vibe Coding?

**Vibe coding** is my approach to learning: **build first, learn as you go, with AI as your pair programmer.**

Instead of spending months in tutorials, I:
1. Started with a clear vision (track my skills)
2. Used **Claude AI** as my coding mentor
3. Built component-by-component, debugging in real-time
4. Learned React, Firebase, and Tailwind in just **2 weeks**

**Total Development Time**: ~40 hours over 2 weeks

### 🎯 What I Learned

| Skill | How I Learned | Time |
|-------|---------------|------|
| React Hooks | Needed state management → Asked Claude → Implemented | 2h |
| Firebase Setup | Required database → Got config from Claude → Debugged auth | 4h |
| Tailwind CSS | Wanted cyberpunk UI → Explored utilities → Styled iteratively | 6h |
| Gemini API | Needed AI chat → Read docs → Claude helped with errors | 3h |

### 💪 Key Challenges

1. **React Component Lifecycle** - Solved with `useEffect` and Firestore listeners
2. **Skill Dependency Logic** - Used `useMemo` for efficient computation
3. **API Rate Limiting** - Added loading states and debouncing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account (free)
- Google AI Studio API key (free)

### Installation

```bash
# Clone repository
git clone https://github.com/Ritik574-coder/datapath-ai.git
cd datapath-ai

# Install dependencies
npm install

# Configure environment
# Create .env file with:
# VITE_FIREBASE_API_KEY=your_key
# VITE_GEMINI_API_KEY=your_key

# Run development server
npm run dev
```

---

## 🎮 How to Use

1. **Open the app** - Anonymous login enabled automatically
2. **Explore Dashboard** - View progress metrics and skill heatmap
3. **Navigate Roadmap** - See all skills organized by category
4. **Click a Skill** - Update status and access AI features:
   - 🧠 **Explain This**: Get simple analogies
   - ⚔️ **Protocol Test**: Practice interview questions
   - 💼 **Resume Bullets**: Generate career-focused achievements (if certified)
   - 📅 **Study Plan**: Get a 3-day learning roadmap (if learning)
5. **Chat with AI** - Ask questions anytime via the sidebar
6. **Generate Missions** - Create coding projects from completed skills

---

## 🤖 AI Features

### 4 AI Modes Powered by Gemini 2.5

| Mode | Purpose | Example |
|------|---------|---------|
| 🧠 **Mentor** | Explain concepts with analogies | "Explain Apache Kafka using a highway analogy" |
| ⚔️ **Examiner** | Interview prep questions | "Ask me a SQL optimization question" |
| 💼 **Career Coach** | Resume bullet generation | Creates metric-driven achievements |
| 📅 **Strategist** | 3-day micro-learning plans | Day-by-day skill mastery roadmap |

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- Core skill tracking system
- AI mentor with 4 interaction modes
- Mission generator
- Firebase integration
- Responsive cyberpunk UI

### 🔄 Coming Next (v1.1)
- [ ] User profiles and avatars
- [ ] Learning streak tracking
- [ ] Export progress as PDF
- [ ] Skill notes and resources

### 🎯 Future Vision (v2.0+)
- [ ] Collaborative features (study groups, leaderboards)
- [ ] Mobile app (React Native)
- [ ] Integration with LinkedIn/GitHub
- [ ] AI-generated flashcards

---

## 🤝 Contributing

I'm actively looking for contributors! Ways to help:

- 🐛 **Report bugs** - Open an issue
- 💡 **Suggest features** - Share your ideas
- 📝 **Improve docs** - Fix typos or add clarity
- 💻 **Submit PRs** - Add features or fix bugs

**Good First Issues:**
- Add tooltips to skill cards
- Improve mobile responsiveness
- Add more skill categories (DevOps, Security)
- Write unit tests

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 📞 Connect with Me

**Ritik Kumar** - Data Engineering Student & Founder of RitSky Global

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ritik%20Kumar-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/ritik-kumar-b81b32375/)
[![GitHub](https://img.shields.io/badge/GitHub-Ritik574--coder-181717?style=flat-square&logo=github)](https://github.com/Ritik574-coder)
[![Email](https://img.shields.io/badge/Email-ritsky%40zohomail.in-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:ritsky@zohomail.in)
[![Tableau](https://img.shields.io/badge/Tableau-Ritik%20Sky-E97627?style=flat-square&logo=tableau&logoColor=white)](https://public.tableau.com/app/profile/ritik.sky)

**Based in**: Patna, Bihar, India 🇮🇳

---

## 🙏 Acknowledgments

- **Claude AI (Anthropic)** - My vibe coding partner
- **Google Gemini** - Powerful free AI API
- **Firebase** - Generous free tier
- **Tailwind CSS** - Beautiful utility-first styling
- **Data Engineering Community** - Constant inspiration

---

## 💬 My Advice for Beginners

> **"Don't wait to be ready. Start building today with AI as your mentor."**

**Key Lessons from This Project:**
1. ✅ You don't need to master everything before starting
2. ✅ AI tools (Claude, ChatGPT, Copilot) are learning accelerators, not cheating
3. ✅ Build something you actually need—it's the best motivation
4. ✅ Break big projects into tiny features—learn one thing at a time
5. ✅ Version 1 doesn't need to be perfect. Ship it and iterate.

**My Timeline:**
- Week 1: Python + SQL basics
- Week 2: Power BI dashboards
- Week 3: Learned React via vibe coding (this project!)
- Week 4: Deployed and shared with the world

**Total investment**: 40 hours → A full-stack web app that impresses recruiters!

---

<div align="center">

### 🌟 If this helped you, give it a star!

**Built with ❤️ and Vibe Coding by [Ritik Kumar](https://github.com/Ritik574-coder)**

![Wave](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer)

</div>
