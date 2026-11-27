# ConnectU — Student Interest & Collaboration Platform

> An intentional campus networking ecosystem connecting college students based on personality archetypes, mutual interests, complementary technical and creative skills, and collaboration preferences.

---

## 🎨 Glassmorphism Design System

ConnectU uses a modern, selective glassmorphism aesthetic with subtle warm ambient blurs, frosted translucent cards, and Linear/Apple-inspired interface precision.

### Exact Color Palette
| Token | Hex / RGBA Code | Role |
| :--- | :--- | :--- |
| **Main Background (`cu-bg`)** | `#EDEDE9` | Warm off-white page canvas |
| **Primary Card Surface (`cu-card`)** | `#F5EBE0` / `rgba(245, 235, 224, 0.68)` | Elevated glass cards with `backdrop-filter: blur(18px)` |
| **Secondary Surface (`cu-secondary`)** | `#D6CCC2` | Soft badges, underlays, secondary chips |
| **Borders (`cu-border`)** | `#E3D5CA` / `rgba(255, 255, 255, 0.55)` | Translucent architectural borders & highlights |
| **Accent (`cu-accent`)** | `#D5BDAF` | Warm editorial highlight & pill accents |
| **Primary Text** | `#292724` | Deep espresso for maximum legibility (>13:1 contrast) |
| **Secondary Text** | `#77716A` | Balanced warm tone for subtitles & secondary copy |
| **Muted Text** | `#A19A91` | Caption and placeholder tone |
| **White Glass Highlights** | `rgba(255, 255, 255, 0.55)` | Specular highlights on glass borders and surfaces |

- **Glass Formula**: `background: rgba(245, 235, 224, 0.68); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.55); box-shadow: 0 8px 30px rgba(75, 60, 45, 0.07); border-radius: 20px;`
- **Typography**: DM Sans & Inter with editorial tracking and strict visual hierarchy.
- **Micro-interactions**: Controlled lift transitions (`glass-card-hover`), button press feedback (`active:scale-[0.98]`), and gentle hero card floating movement (`animate-float-slow`, `animate-float-medium`). Respects `prefers-reduced-motion`.

- **Typography**: DM Sans & Inter with clean tracking and deliberate visual hierarchy.
- **Interactions**: Soft multi-layered drop shadows (`shadow-soft`), rounded corners (`rounded-2xl` / `rounded-3xl`), and subtle hover micro-interactions.

---

## 🚀 Key Features & Pages

### 1. Landing Page (`/`)
- Brand header and navigation with `.edu` campus badge.
- Hero section: *"Find Your People. Build Something Together."*
- Interactive visual synergy match card showing live compatibility breakdown.
- Explore Features section (Interest matching, Project huddles, Real-time chat & voice, Verified profiles).
- 3-step *How ConnectU Works* walkthrough.
- High-impact final CTA and editorial footer.

### 2. Authentication Page (`/login`)
- Clean, focused interface with Google OAuth preparation.
- Direct integration with Supabase Auth (`signInWithOAuth`).
- Explicit *Interactive Evaluation Mode* / *Explore with Demo Student Account* button allowing frictionless review without pretending OAuth succeeded.
- Student privacy guidelines and institutional email explanation.

### 3. Student Onboarding (`/onboarding`)
A 5-step registration journey with live progress indicator:
1. **Personal Details**: Full name, avatar preset selector, college email, university name.
2. **Academic Details**: College/Faculty, branch/major, academic year, semester.
3. **Skills & Strengths**: Interactive popular skills selector, custom skill tag input with Enter key support.
4. **Interests**: Multidimensional domain selector (AI/ML, Design, Entrepreneurship, Research, etc.).
5. **Introduction**: Short bio, collaboration preferences (Hackathons, Startup projects, Study groups, Open source).

### 4. Student Dashboard (`/dashboard`)
- Dynamic time-of-day greeting (*"Good morning/afternoon/evening, Jordan"*).
- Actionable profile completion progress bar (with prompt to complete quiz).
- Recommended peer cards sorted by dynamic compatibility percentage.
- Pending incoming friend requests widget with quick Accept/Decline actions.
- Upcoming campus collaboration opportunities (e.g. CalHacks teams, startup co-founders, research cohorts).
- Quick access to active message threads with unread indicators.

### 5. Discover Students (`/discover`)
- Full student directory with verified student cards.
- Real-time search across student names, majors, universities, skills, and interests.
- Horizontal scrollable domain filter chips (AI & ML, Design, Tech, Entrepreneurship, etc.).
- Specific skill filter buttons (React, Python, Figma, PyTorch).
- Sort options: *Highest Compatibility Match* vs. *Alphabetical*.
- One-click *Connect* / *Pending* / *Message* actions with instant toast feedback.
- Detailed modal preview showcasing student bio, skill chips, and match synergy breakdown.

### 6. Interactive Interest & Personality Quiz (`/quiz`)
- 4-part calibration assessing working style, curiosity frontier, collaboration format, and feedback preferences.
- Multi-choice card selector with progress bar.
- Algorithmic calculation of campus archetypes:
  - *The Visionary Builder*
  - *The Product Design Pioneer*
  - *The Systems & AI Architect*
  - *The Catalyst Co-Founder*
- Real-time recalibration that updates match scores across the entire platform.

### 7. My Network (`/network`)
- 3 functional tabs with live badge counters:
  - **My Friends**: Connected peers with direct message action.
  - **Incoming Requests**: Pending requests with Accept and Decline actions.
  - **Sent Requests**: Outgoing requests with Cancel/Withdraw capability.
- Clean empty states for tabs without connections.

### 8. Messages & Voice Calling (`/messages`)
- Responsive two-column chat layout.
- Conversation thread list with real-time search.
- Active chat header with peer status, message history, timestamps, and distinct message bubbles.
- Working message input box with instant state updates.
- **WebRTC Voice Room**: In-app voice calling modal featuring audio pulse equalizer, call timer, mute/unmute microphone, and speaker toggles, prepared for WebRTC peer signaling.

### 9. Profile & Settings (`/profile`)
- **Edit Profile**: Full name, university, college, branch, year, semester, bio, avatar.
- **Skills & Stack**: Remove and add skill tags with live preview.
- **Interests & Archetype**: Update passion areas and view active quiz results.
- **Privacy Controls**: Campus discovery toggle, online activity toggle, direct messaging permissions.
- **Supabase Backend Setup**: Status indicator, step-by-step connection guide, and copyable `.env` snippet.
- Centralized Logout button.

---

## 🛠️ Architecture & Tech Stack

```
src/
├── assets/                  # Static assets & SVG icons
├── components/
│   ├── cards/
│   │   ├── CollaborationCard.jsx  # Campus project cards
│   │   └── StudentCard.jsx        # Rich student cards with modal preview
│   └── common/
│       ├── Avatar.jsx       # Avatar with fallback initials & status dot
│       ├── Badge.jsx        # Custom color-coded chips
│       ├── BottomNav.jsx    # Mobile bottom navigation bar
│       ├── Button.jsx       # Custom variant-driven button system
│       ├── Card.jsx         # Design system base container
│       ├── EmptyState.jsx   # Empty state illustrations
│       ├── Input.jsx        # Accessible form input
│       ├── Modal.jsx        # Accessible modal dialog with backdrop blur
│       ├── Navbar.jsx       # Responsive public header
│       └── Sidebar.jsx      # Desktop application navigation bar
├── context/
│   ├── AuthContext.jsx      # Supabase OAuth & local preview session
│   ├── StudentDataContext.jsx # Live reactive student, friend, chat state
│   └── ToastContext.jsx     # Non-intrusive notification toasts
├── hooks/
│   ├── useAuth.js
│   ├── useStudentData.js
│   └── useToast.js
├── layouts/
│   ├── AppLayout.jsx        # Sidebar, topbar, mobile nav wrapper
│   └── PublicLayout.jsx     # Public navbar & footer wrapper
├── pages/
│   ├── DashboardPage.jsx
│   ├── DiscoverPage.jsx
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── MessagesPage.jsx
│   ├── NetworkPage.jsx
│   ├── NotFoundPage.jsx
│   ├── OnboardingPage.jsx
│   ├── ProfileSettingsPage.jsx
│   └── QuizPage.jsx
├── services/
│   ├── mockData.js          # Demarcated preview dataset
│   ├── studentService.js    # Data service abstraction (Supabase + LocalStorage)
│   └── supabase.js          # Centralized Supabase client
├── styles/
│   └── index.css            # Tailwind directives & custom scrollbars
└── utils/
    ├── compatibility.js     # Multidimensional synergy scoring algorithm
    └── constants.js         # Taxonomies, quiz questions & skill presets
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Setup (Required)
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Supabase project URL and public client key:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

`VITE_SUPABASE_ANON_KEY` also works in place of `VITE_SUPABASE_PUBLISHABLE_KEY`. Never use a service-role key in a `VITE_` variable because these variables are bundled into the browser app.

For Netlify, set the same variables for builds in each deploy context you use. Changes to these variables take effect on the next deploy. The Netlify configuration lets users open or refresh React Router routes directly.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized, chunk-split production bundle in `dist/`.
