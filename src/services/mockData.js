/**
 * ConnectU Preview Dataset
 * 
 * IMPORTANT:
 * This dataset serves as temporary demonstration/preview data for UI visualization
 * prior to connecting your live Supabase database tables.
 * Each entry is explicitly flagged with `isDemoPreview: true`.
 */

export const INITIAL_USER_PROFILE = {
  id: 'current-user-preview',
  fullName: 'Jordan Lee',
  email: 'jordan.lee@campus.edu',
  university: 'Stanford University',
  college: 'School of Engineering',
  branch: 'Computer Science',
  academicYear: '3rd Year',
  semester: '6th Semester',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Building human-centered AI interfaces and interactive web tools. Passionate about participating in national hackathons and open-source accessibility.',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Python', 'UI/UX Design', 'PyTorch'],
  interests: ['Technology', 'AI and ML', 'Design', 'Entrepreneurship', 'Research'],
  collaborationPreferences: ['Hackathons', 'Startup Projects', 'Research Papers'],
  quizResult: {
    archetype: 'The Visionary Builder',
    personalityType: 'Analytical Innovator (ENTP-T)',
    topTraits: ['Creative Problem Solving', 'Systems Thinking', 'Team Catalyst'],
    completedAt: '2026-02-15'
  },
  profileCompletion: 85,
  isDemoPreview: false
}

export const DEMO_PREVIEW_STUDENTS = [
  {
    id: 'stu-1',
    fullName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    university: 'Stanford University',
    branch: 'Artificial Intelligence & Robotics',
    academicYear: '3rd Year',
    college: 'School of Engineering',
    bio: 'Deep learning researcher focused on transformer optimization for edge hardware. Seeking a frontend engineer for a medical imaging diagnostic demo.',
    skills: ['PyTorch', 'Python', 'C++', 'CUDA', 'Computer Vision'],
    interests: ['AI and ML', 'Research', 'Technology', 'Healthcare Tech'],
    collaborationPreferences: ['Research Papers', 'Hackathons'],
    compatibilityScore: 96,
    mutualInterests: ['AI and ML', 'Technology', 'Research'],
    status: 'none', // 'none' | 'pending' | 'accepted' | 'received'
    isOnline: true,
    isDemoPreview: true
  },
  {
    id: 'stu-2',
    fullName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    university: 'Stanford University',
    branch: 'Product Design & HCI',
    academicYear: '2nd Year',
    college: 'd.school / Humanities',
    bio: 'Obsessed with micro-interactions, clean visual systems, and typography. Previously interned as UX Designer. Looking to partner with backend devs on mobile ideas.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'React Basics'],
    interests: ['Design', 'Entrepreneurship', 'Technology', 'Music'],
    collaborationPreferences: ['Startup Projects', 'Hackathons'],
    compatibilityScore: 92,
    mutualInterests: ['Design', 'Entrepreneurship', 'Technology'],
    status: 'none',
    isOnline: false,
    isDemoPreview: true
  },
  {
    id: 'stu-3',
    fullName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    university: 'UC Berkeley',
    branch: 'Data Science & Economics',
    academicYear: '3rd Year',
    college: 'College of Computing',
    bio: 'Financial markets nerd and quantitative analyst. Building algorithmic backtesters and predictive student credit models.',
    skills: ['Python', 'SQL', 'R', 'FastAPI', 'Pandas', 'Stats'],
    interests: ['Entrepreneurship', 'Technology', 'Research', 'Gaming'],
    collaborationPreferences: ['Startup Projects', 'Study Groups'],
    compatibilityScore: 88,
    mutualInterests: ['Entrepreneurship', 'Technology'],
    status: 'received',
    isOnline: true,
    isDemoPreview: true
  },
  {
    id: 'stu-4',
    fullName: 'Chloe Dupont',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    university: 'MIT',
    branch: 'Computer Science & Mathematics',
    academicYear: '4th Year',
    college: 'School of Science',
    bio: 'Distributed systems tinkerer and Rust enthusiast. Working on peer-to-peer real-time state synchronization protocols.',
    skills: ['Rust', 'Go', 'Distributed Systems', 'WebAssembly', 'Docker'],
    interests: ['Technology', 'Research', 'Open Source', 'Gaming'],
    collaborationPreferences: ['Open Source', 'Hackathons'],
    compatibilityScore: 85,
    mutualInterests: ['Technology', 'Research'],
    status: 'accepted',
    isOnline: true,
    isDemoPreview: true
  },
  {
    id: 'stu-5',
    fullName: 'Devin Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    university: 'Stanford University',
    branch: 'Bioengineering & CS',
    academicYear: '1st Year',
    college: 'Bio-X',
    bio: 'Freshman curious about synthetic biology and computational genomics. Learning Next.js and biological data pipelines.',
    skills: ['Python', 'BioPython', 'Next.js', 'Tailwind CSS'],
    interests: ['AI and ML', 'Research', 'Sports', 'Technology'],
    collaborationPreferences: ['Study Groups', 'Hackathons'],
    compatibilityScore: 81,
    mutualInterests: ['AI and ML', 'Technology'],
    status: 'pending',
    isOnline: false,
    isDemoPreview: true
  },
  {
    id: 'stu-6',
    fullName: 'Sophia Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    university: 'Harvard University',
    branch: 'Computer Science & Government',
    academicYear: '3rd Year',
    college: 'Faculty of Arts and Sciences',
    bio: 'Civic tech organizer building tools for voter transparency and community policy feedback. Advocate for open data and digital equity.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Public Policy', 'Figma'],
    interests: ['Entrepreneurship', 'Technology', 'Design', 'Research'],
    collaborationPreferences: ['Open Source', 'Startup Projects'],
    compatibilityScore: 79,
    mutualInterests: ['Entrepreneurship', 'Technology', 'Design'],
    status: 'none',
    isOnline: true,
    isDemoPreview: true
  }
]

export const DEMO_COLLABORATIONS = [
  {
    id: 'collab-1',
    title: 'CalHacks 13.0 — AI Civic Assistant Team',
    organizer: 'Elena Rostova',
    organizerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    deadline: 'In 4 days',
    spotsOpen: 2,
    tags: ['Hackathon', 'AI & ML', 'Full-Stack'],
    description: 'We have an end-to-end multi-agent pipeline ready and need an experienced React/Tailwind frontend developer to polish our live demo UI.',
    isDemoPreview: true
  },
  {
    id: 'collab-2',
    title: 'Next-Gen Peer Campus Marketplace (MVP)',
    organizer: 'Marcus Vance',
    organizerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    deadline: 'Rolling applications',
    spotsOpen: 1,
    tags: ['Startup', 'Design & UX', 'Mobile'],
    description: 'Figma prototypes are 95% finished with student user testing validation. Seeking a founding full-stack partner to build the pilot.',
    isDemoPreview: true
  },
  {
    id: 'collab-3',
    title: 'NeurIPS Student Workshop Paper Reading Group',
    organizer: 'Jordan Lee (You)',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    deadline: 'Weekly on Thursdays',
    spotsOpen: 3,
    tags: ['Research', 'Weekly Discussion', 'Deep Learning'],
    description: 'Deconstructing recent papers on sparse attention mechanisms and memory efficiency for local LLM inference.',
    isDemoPreview: true
  }
]

export const DEMO_CONVERSATIONS = [
  {
    id: 'conv-1',
    participantId: 'stu-4',
    participantName: 'Chloe Dupont',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    participantBranch: 'CS & Math, MIT',
    isOnline: true,
    unreadCount: 1,
    lastMessage: 'Hey! Loved your thoughts on WebRTC voice latency optimization. Are you free to brainstorm tomorrow?',
    lastMessageTime: '10:42 AM',
    messages: [
      {
        id: 'msg-1',
        senderId: 'stu-4',
        text: 'Hey Jordan! Saw your profile through the ConnectU algorithm — we both checked out distributed systems and hackathons.',
        timestamp: 'Yesterday, 4:20 PM'
      },
      {
        id: 'msg-2',
        senderId: 'current-user-preview',
        text: 'Hi Chloe! Great to connect. Yes, I saw your work on peer-to-peer sync protocols on GitHub, really impressive!',
        timestamp: 'Yesterday, 4:25 PM'
      },
      {
        id: 'msg-3',
        senderId: 'stu-4',
        text: 'Hey! Loved your thoughts on WebRTC voice latency optimization. Are you free to brainstorm tomorrow?',
        timestamp: '10:42 AM'
      }
    ]
  },
  {
    id: 'conv-2',
    participantId: 'stu-1',
    participantName: 'Elena Rostova',
    participantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    participantBranch: 'AI & Robotics, Stanford',
    isOnline: true,
    unreadCount: 0,
    lastMessage: 'Sent over the dataset link in the drive folder!',
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'msg-201',
        senderId: 'current-user-preview',
        text: 'Hey Elena, got a question regarding the CalHacks pitch deck.',
        timestamp: '2 days ago'
      },
      {
        id: 'msg-202',
        senderId: 'stu-1',
        text: 'Sent over the dataset link in the drive folder!',
        timestamp: 'Yesterday'
      }
    ]
  }
]
