export const INTEREST_CATEGORIES = [
  'All',
  'Technology and Programming',
  'Artificial Intelligence and Machine Learning',
  'Data Science and Analytics',
  'Gaming and Esports',
  'Sports and Fitness',
  'Music and Entertainment',
  'Art and Graphic Design',
  'Photography and Video Editing',
  'Entrepreneurship and Business',
  'Marketing and Management',
  'Research and Science',
  'Reading and Education',
  'Psychology and Human Behavior',
  'Communication and Public Speaking',
  'Social Activities and Community Building'
]

export const POPULAR_SKILLS = [
  'Python',
  'React',
  'TypeScript',
  'Figma',
  'UI/UX Design',
  'PyTorch',
  'Node.js',
  'Go',
  'Rust',
  'Tailwind CSS',
  'Docker',
  'Public Speaking',
  'Creative Writing',
  '3D Modeling'
]

export const COLLABORATION_TYPES = [
  'Hackathons',
  'Startup Projects',
  'Research Papers',
  'Study Groups',
  'Open Source',
  'Creative Portfolio'
]

export const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Graduate / Masters',
  'PhD Candidate'
]

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Personality & Working Style',
    question: 'When starting a new project with peers, which role comes most naturally to you?',
    subtitle: 'Helps us match complementary team dynamics.',
    options: [
      {
        id: 'opt-a',
        label: 'The Architect & Problem Solver',
        description: 'Focusing on robust technical architecture, deep logic, and systems design.',
        trait: 'Analytical'
      },
      {
        id: 'opt-b',
        label: 'The Creative & Experience Designer',
        description: 'Crafting user flows, intuitive interfaces, and aesthetic identity.',
        trait: 'Creative'
      },
      {
        id: 'opt-c',
        label: 'The Product Catalyst & Storyteller',
        description: 'Defining vision, user value proposition, roadmap, and pitch.',
        trait: 'Leadership'
      },
      {
        id: 'opt-d',
        label: 'The Versatile Fast Prototyper',
        description: 'Shipping quick iterations, connecting APIs, and testing hypotheses in real time.',
        trait: 'Builder'
      }
    ]
  },
  {
    id: 2,
    category: 'Interests & Technical Focus',
    question: 'Which frontier domain excites your curiosity the most right now?',
    subtitle: 'Connect with peers exploring parallel technologies.',
    options: [
      {
        id: 'opt-a',
        label: 'Generative AI & Autonomous Agents',
        description: 'Fine-tuning models, multi-agent frameworks, and multimodal interactions.',
        trait: 'AI and ML'
      },
      {
        id: 'opt-b',
        label: 'High-Craft Web & Mobile Experiences',
        description: 'Micro-interactions, spatial interfaces, performance, and modern web tech.',
        trait: 'Design & Web'
      },
      {
        id: 'opt-c',
        label: 'Campus Startups & Commercial Products',
        description: 'Customer discovery, lean MVP launches, and scalable business models.',
        trait: 'Entrepreneurship'
      },
      {
        id: 'opt-d',
        label: 'Academic Research & Systems Exploration',
        description: 'Formal papers, distributed consensus, algorithmic efficiency, and robotics.',
        trait: 'Research'
      }
    ]
  },
  {
    id: 3,
    category: 'Collaboration Preferences',
    question: 'What is your preferred format for student collaboration?',
    subtitle: 'Ensures expectations and work rhythms align.',
    options: [
      {
        id: 'opt-a',
        label: 'Intense Weekend Hackathons',
        description: 'High-energy 48-hour sprints to build and demo an ambitious prototype.',
        trait: 'Hackathons'
      },
      {
        id: 'opt-b',
        label: 'Ongoing Passion / Startup Project',
        description: 'Consistent weekly iterations building a real product with longevity.',
        trait: 'Startup Projects'
      },
      {
        id: 'opt-c',
        label: 'Co-Working & Study Groups',
        description: 'Accountability sessions, problem set deep-dives, and peer mentorship.',
        trait: 'Study Groups'
      },
      {
        id: 'opt-d',
        label: 'Open Source Community Contributions',
        description: 'Asynchronous GitHub collaboration, public RFCs, and documentation.',
        trait: 'Open Source'
      }
    ]
  },
  {
    id: 4,
    category: 'Communication & Feedback Style',
    question: 'How do you like to give and receive feedback within a team?',
    subtitle: 'Healthy communication is the foundation of great partnerships.',
    options: [
      {
        id: 'opt-a',
        label: 'Direct, asynchronous, and documented in code reviews/notes',
        description: 'Clear, concise pull requests, bulleted takeaways, and async clarity.',
        trait: 'Async'
      },
      {
        id: 'opt-b',
        label: 'Casual voice calls and real-time screen sharing',
        description: 'Bouncing ideas out loud, whiteboarding, and spontaneous brainstorms.',
        trait: 'Real-time'
      },
      {
        id: 'opt-c',
        label: 'Structured milestone check-ins with clear goals',
        description: 'Brief standups, agenda-driven reviews, and distinct action items.',
        trait: 'Structured'
      },
      {
        id: 'opt-d',
        label: 'Flexible flow with mutual trust and experimentation',
        description: 'Organic updates, freedom of execution, and peer encouragement.',
        trait: 'Flexible'
      }
    ]
  }
]
