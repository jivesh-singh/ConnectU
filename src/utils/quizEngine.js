/**
 * ConnectU 12-Question Interest & Hobby Discovery Engine
 * 
 * Implements weighted multi-category classification across 15 interest domains
 * and computes personalized collaboration styles without psychological diagnosis.
 */

export const INTEREST_CATEGORIES_15 = [
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

export const QUIZ_12_QUESTIONS = [
  {
    id: 1,
    question: 'What do you enjoy doing in your free time?',
    options: [
      {
        id: '1A',
        key: 'A',
        text: 'Coding, exploring technology or building things.',
        weights: {
          'Technology and Programming': 4,
          'Artificial Intelligence and Machine Learning': 2,
          'Data Science and Analytics': 1
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '1B',
        key: 'B',
        text: 'Playing games, watching movies or listening to music.',
        weights: {
          'Gaming and Esports': 3,
          'Music and Entertainment': 3
        },
        roleWeights: { 'Creative Thinker': 1 }
      },
      {
        id: '1C',
        key: 'C',
        text: 'Drawing, photography, designing or creating content.',
        weights: {
          'Art and Graphic Design': 4,
          'Photography and Video Editing': 3,
          'Music and Entertainment': 1
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '1D',
        key: 'D',
        text: 'Reading, researching or learning something new.',
        weights: {
          'Reading and Education': 4,
          'Research and Science': 3,
          'Psychology and Human Behavior': 1
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 2,
    question: 'Which activity would you choose for a weekend?',
    options: [
      {
        id: '2A',
        key: 'A',
        text: 'Building a personal project or experimenting with technology.',
        weights: {
          'Technology and Programming': 4,
          'Entrepreneurship and Business': 2,
          'Artificial Intelligence and Machine Learning': 1
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '2B',
        key: 'B',
        text: 'Playing sports, gaming or going on an adventure.',
        weights: {
          'Sports and Fitness': 4,
          'Gaming and Esports': 2,
          'Social Activities and Community Building': 2
        },
        roleWeights: { 'Strategic Organizer': 1 }
      },
      {
        id: '2C',
        key: 'C',
        text: 'Creating music, photography or visual content.',
        weights: {
          'Music and Entertainment': 3,
          'Photography and Video Editing': 3,
          'Art and Graphic Design': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '2D',
        key: 'D',
        text: 'Exploring a new subject, attending a workshop or reading.',
        weights: {
          'Reading and Education': 3,
          'Research and Science': 3,
          'Social Activities and Community Building': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 3,
    question: 'Which topic would you enjoy learning about?',
    options: [
      {
        id: '3A',
        key: 'A',
        text: 'Artificial Intelligence, programming and robotics.',
        weights: {
          'Artificial Intelligence and Machine Learning': 4,
          'Technology and Programming': 3,
          'Data Science and Analytics': 2
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '3B',
        key: 'B',
        text: 'Business, entrepreneurship and finance.',
        weights: {
          'Entrepreneurship and Business': 4,
          'Marketing and Management': 3,
          'Communication and Public Speaking': 1
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '3C',
        key: 'C',
        text: 'Design, filmmaking, music and creativity.',
        weights: {
          'Art and Graphic Design': 3,
          'Photography and Video Editing': 3,
          'Music and Entertainment': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '3D',
        key: 'D',
        text: 'Psychology, science, research and communication.',
        weights: {
          'Psychology and Human Behavior': 4,
          'Research and Science': 3,
          'Communication and Public Speaking': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 4,
    question: 'What kind of online content do you watch most?',
    options: [
      {
        id: '4A',
        key: 'A',
        text: 'Technology, coding, gadgets and AI.',
        weights: {
          'Technology and Programming': 3,
          'Artificial Intelligence and Machine Learning': 3
        },
        roleWeights: { 'Technical Builder': 2 }
      },
      {
        id: '4B',
        key: 'B',
        text: 'Gaming, sports, travel and entertainment.',
        weights: {
          'Gaming and Esports': 3,
          'Sports and Fitness': 3,
          'Music and Entertainment': 1
        },
        roleWeights: { 'Creative Thinker': 1 }
      },
      {
        id: '4C',
        key: 'C',
        text: 'Music, fashion, art and creative content.',
        weights: {
          'Music and Entertainment': 3,
          'Art and Graphic Design': 3,
          'Photography and Video Editing': 2
        },
        roleWeights: { 'Creative Thinker': 2 }
      },
      {
        id: '4D',
        key: 'D',
        text: 'Educational videos, documentaries and self-improvement.',
        weights: {
          'Reading and Education': 3,
          'Psychology and Human Behavior': 3,
          'Research and Science': 2
        },
        roleWeights: { 'Analytical Researcher': 2 }
      }
    ]
  },
  {
    id: 5,
    question: 'Which project would excite you the most?',
    options: [
      {
        id: '5A',
        key: 'A',
        text: 'Building an AI application or technology product.',
        weights: {
          'Artificial Intelligence and Machine Learning': 4,
          'Technology and Programming': 3,
          'Data Science and Analytics': 2
        },
        roleWeights: { 'Technical Builder': 4 }
      },
      {
        id: '5B',
        key: 'B',
        text: 'Starting a business or organizing an event.',
        weights: {
          'Entrepreneurship and Business': 4,
          'Marketing and Management': 3,
          'Social Activities and Community Building': 3
        },
        roleWeights: { 'Strategic Organizer': 4 }
      },
      {
        id: '5C',
        key: 'C',
        text: 'Designing a website, making a film or producing music.',
        weights: {
          'Art and Graphic Design': 3,
          'Photography and Video Editing': 3,
          'Music and Entertainment': 2,
          'Technology and Programming': 1
        },
        roleWeights: { 'Creative Thinker': 4 }
      },
      {
        id: '5D',
        key: 'D',
        text: 'Conducting research or solving a real-world social problem.',
        weights: {
          'Research and Science': 4,
          'Social Activities and Community Building': 3,
          'Psychology and Human Behavior': 2
        },
        roleWeights: { 'Analytical Researcher': 4 }
      }
    ]
  },
  {
    id: 6,
    question: 'Which activity sounds most interesting?',
    options: [
      {
        id: '6A',
        key: 'A',
        text: 'Developing applications and experimenting with technology.',
        weights: {
          'Technology and Programming': 4,
          'Data Science and Analytics': 2
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '6B',
        key: 'B',
        text: 'Playing competitive games or participating in sports.',
        weights: {
          'Gaming and Esports': 3,
          'Sports and Fitness': 4
        },
        roleWeights: { 'Strategic Organizer': 1 }
      },
      {
        id: '6C',
        key: 'C',
        text: 'Creating artwork, music, videos or designs.',
        weights: {
          'Art and Graphic Design': 3,
          'Music and Entertainment': 3,
          'Photography and Video Editing': 3
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '6D',
        key: 'D',
        text: 'Reading books, discussing ideas or conducting research.',
        weights: {
          'Reading and Education': 3,
          'Research and Science': 3,
          'Communication and Public Speaking': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 7,
    question: 'What type of problems do you enjoy solving?',
    options: [
      {
        id: '7A',
        key: 'A',
        text: 'Logical problems, algorithms and technical challenges.',
        weights: {
          'Technology and Programming': 3,
          'Data Science and Analytics': 3,
          'Artificial Intelligence and Machine Learning': 3
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '7B',
        key: 'B',
        text: 'Business challenges, planning and decision-making.',
        weights: {
          'Entrepreneurship and Business': 3,
          'Marketing and Management': 4,
          'Communication and Public Speaking': 2
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '7C',
        key: 'C',
        text: 'Creative challenges involving design and storytelling.',
        weights: {
          'Art and Graphic Design': 3,
          'Communication and Public Speaking': 3,
          'Photography and Video Editing': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '7D',
        key: 'D',
        text: 'Human behavior, scientific questions and social problems.',
        weights: {
          'Psychology and Human Behavior': 4,
          'Research and Science': 3,
          'Social Activities and Community Building': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 8,
    question: 'Which college event would you most like to attend?',
    options: [
      {
        id: '8A',
        key: 'A',
        text: 'Hackathon, coding competition or technology workshop.',
        weights: {
          'Technology and Programming': 4,
          'Artificial Intelligence and Machine Learning': 2
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '8B',
        key: 'B',
        text: 'Entrepreneurship event, business competition or sports fest.',
        weights: {
          'Entrepreneurship and Business': 3,
          'Sports and Fitness': 3,
          'Marketing and Management': 2
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '8C',
        key: 'C',
        text: 'Cultural fest, photography contest or music competition.',
        weights: {
          'Music and Entertainment': 3,
          'Photography and Video Editing': 3,
          'Art and Graphic Design': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '8D',
        key: 'D',
        text: 'Debate, research conference or educational workshop.',
        weights: {
          'Communication and Public Speaking': 4,
          'Research and Science': 3,
          'Reading and Education': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 9,
    question: 'What role do you naturally prefer in a team?',
    options: [
      {
        id: '9A',
        key: 'A',
        text: 'Technical developer who builds the solution.',
        weights: {
          'Technology and Programming': 4,
          'Data Science and Analytics': 1
        },
        roleWeights: { 'Technical Builder': 4 }
      },
      {
        id: '9B',
        key: 'B',
        text: 'Leader who organizes people and manages execution.',
        weights: {
          'Marketing and Management': 4,
          'Entrepreneurship and Business': 3,
          'Social Activities and Community Building': 3
        },
        roleWeights: { 'Strategic Organizer': 4 }
      },
      {
        id: '9C',
        key: 'C',
        text: 'Creative person who handles design and presentation.',
        weights: {
          'Art and Graphic Design': 4,
          'Communication and Public Speaking': 2,
          'Photography and Video Editing': 2
        },
        roleWeights: { 'Creative Thinker': 4 }
      },
      {
        id: '9D',
        key: 'D',
        text: 'Researcher who analyzes information and finds solutions.',
        weights: {
          'Research and Science': 4,
          'Data Science and Analytics': 3,
          'Reading and Education': 2
        },
        roleWeights: { 'Analytical Researcher': 4 }
      }
    ]
  },
  {
    id: 10,
    question: 'If you could master one new skill, what would it be?',
    options: [
      {
        id: '10A',
        key: 'A',
        text: 'Programming, AI or data science.',
        weights: {
          'Technology and Programming': 3,
          'Artificial Intelligence and Machine Learning': 3,
          'Data Science and Analytics': 3
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '10B',
        key: 'B',
        text: 'Marketing, leadership or entrepreneurship.',
        weights: {
          'Marketing and Management': 3,
          'Entrepreneurship and Business': 3,
          'Communication and Public Speaking': 3
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '10C',
        key: 'C',
        text: 'Graphic design, video editing or music production.',
        weights: {
          'Art and Graphic Design': 3,
          'Photography and Video Editing': 3,
          'Music and Entertainment': 3
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '10D',
        key: 'D',
        text: 'Research, communication or psychology.',
        weights: {
          'Research and Science': 3,
          'Communication and Public Speaking': 3,
          'Psychology and Human Behavior': 3
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 11,
    question: 'What motivates you most when starting something new?',
    options: [
      {
        id: '11A',
        key: 'A',
        text: 'Learning new technology and creating something useful.',
        weights: {
          'Technology and Programming': 3,
          'Artificial Intelligence and Machine Learning': 2
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '11B',
        key: 'B',
        text: 'Achieving goals, competing and building something successful.',
        weights: {
          'Entrepreneurship and Business': 3,
          'Marketing and Management': 2,
          'Sports and Fitness': 1
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '11C',
        key: 'C',
        text: 'Expressing ideas and making something original.',
        weights: {
          'Art and Graphic Design': 3,
          'Music and Entertainment': 2,
          'Photography and Video Editing': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '11D',
        key: 'D',
        text: 'Understanding the world and discovering new knowledge.',
        weights: {
          'Research and Science': 3,
          'Reading and Education': 3,
          'Psychology and Human Behavior': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  },
  {
    id: 12,
    question: 'Which describes your ideal college experience?',
    options: [
      {
        id: '12A',
        key: 'A',
        text: 'Working on innovative projects and learning advanced technology.',
        weights: {
          'Technology and Programming': 3,
          'Artificial Intelligence and Machine Learning': 3
        },
        roleWeights: { 'Technical Builder': 3 }
      },
      {
        id: '12B',
        key: 'B',
        text: 'Networking, leading communities and building businesses.',
        weights: {
          'Social Activities and Community Building': 3,
          'Entrepreneurship and Business': 3,
          'Marketing and Management': 2
        },
        roleWeights: { 'Strategic Organizer': 3 }
      },
      {
        id: '12C',
        key: 'C',
        text: 'Exploring creativity, entertainment and cultural activities.',
        weights: {
          'Music and Entertainment': 3,
          'Art and Graphic Design': 3,
          'Photography and Video Editing': 2
        },
        roleWeights: { 'Creative Thinker': 3 }
      },
      {
        id: '12D',
        key: 'D',
        text: 'Participating in research, discussions and intellectual activities.',
        weights: {
          'Research and Science': 3,
          'Reading and Education': 3,
          'Communication and Public Speaking': 2
        },
        roleWeights: { 'Analytical Researcher': 3 }
      }
    ]
  }
]

// Mappings from category combinations to representative student hobbies
const HOBBY_MAPPINGS = {
  'Technology and Programming': ['Software Tinkering', 'Open Source Contributing', 'Robotics & Hardware'],
  'Artificial Intelligence and Machine Learning': ['Prompt Engineering & Model Testing', 'AI App Prototyping', 'Kaggle Competitions'],
  'Data Science and Analytics': ['Data Visualization', 'Algorithmic Puzzles', 'Statistical Modeling'],
  'Gaming and Esports': ['PC & Console Gaming', 'Esports Strategy', 'Interactive Storytelling'],
  'Sports and Fitness': ['Outdoor Adventures', 'Gym & Athletic Training', 'Intramural Team Sports'],
  'Music and Entertainment': ['Music Listening & Curating', 'Instrument Playing', 'Concerts & Live Gigs'],
  'Art and Graphic Design': ['Digital Illustration', 'UI & Wireframing', 'Visual Journaling'],
  'Photography and Video Editing': ['Street Photography', 'Short Film Production', 'Content Creation'],
  'Entrepreneurship and Business': ['Side Hustles', 'Startup Pitching', 'Case Study Breakdowns'],
  'Marketing and Management': ['Event Organizing', 'Brand Strategy', 'Product Operations'],
  'Research and Science': ['Independent Lab Inquiries', 'Academic Paper Deep-Dives', 'Science Communication'],
  'Reading and Education': ['Non-fiction & Sci-fi Reading', 'Philosophy & Essay Writing', 'Attending Workshops'],
  'Psychology and Human Behavior': ['Behavioral Observation', 'Journaling & Reflection', 'Active Listening & Mentoring'],
  'Communication and Public Speaking': ['Debate & Model UN', 'Podcast Hosting', 'Campus Storytelling'],
  'Social Activities and Community Building': ['Club Leadership', 'Volunteering', 'Hackathon Organizing']
}

// Working style descriptions and collaborative synergies
const WORKING_STYLES = {
  'Technical Builder': {
    title: 'Technical Builder',
    tagline: 'Translates ambitious ideas into scalable code and functional products.',
    summary: 'You enjoy rolling up your sleeves, diagnosing architecture bottlenecks, and creating tangible working solutions. You thrive when paired with creative visionaries and strategic team leads.',
    bestPartners: ['Creative Thinker', 'Strategic Organizer'],
    idealProjects: ['Hackathons', 'Full-Stack Web & Mobile Apps', 'AI Tooling & Automation']
  },
  'Creative Thinker': {
    title: 'Creative Thinker',
    tagline: 'Transforms complex problems into intuitive experiences and compelling visual stories.',
    summary: 'You focus on the human experience, aesthetic elegance, and narrative resonance. You excel when collaborating with technical developers who turn your wireframes into working reality.',
    bestPartners: ['Technical Builder', 'Strategic Organizer'],
    idealProjects: ['Product Design Systems', 'Creative Media & Film', 'User-Facing Startup MVPs']
  },
  'Strategic Organizer': {
    title: 'Strategic Organizer',
    tagline: 'Aligns multidisciplinary talents, manages roadmaps, and drives team velocity.',
    summary: 'You keep the bigger picture in focus, coordinate team priorities, and ensure products reach real campus users. You complement both technical developers and creative storytellers.',
    bestPartners: ['Technical Builder', 'Creative Thinker', 'Analytical Researcher'],
    idealProjects: ['Startup Co-Founding', 'Campus Community Platforms', 'Event & Venture Organizing']
  },
  'Analytical Researcher': {
    title: 'Analytical Researcher',
    tagline: 'Uncovers root truths through deep inquiry, data evidence, and intellectual rigor.',
    summary: 'You enjoy dissecting complex questions, verifying assumptions, and synthesizing diverse knowledge. You thrive in partnership with technical implementers and strategic communicators.',
    bestPartners: ['Technical Builder', 'Strategic Organizer'],
    idealProjects: ['Academic Research Papers', 'Data Journalism & Analytics', 'Social Impact Studies']
  }
}

// Recommended skills tailored to interest domains
const SKILL_RECOMMENDATIONS = {
  'Technology and Programming': ['TypeScript', 'FastAPI', 'Next.js', 'Docker'],
  'Artificial Intelligence and Machine Learning': ['PyTorch', 'LangChain', 'HuggingFace', 'Vector Databases'],
  'Data Science and Analytics': ['Pandas', 'SQL', 'Streamlit', 'Data Storytelling'],
  'Gaming and Esports': ['Unity / Godot', 'Game Mechanics', '3D Asset Design'],
  'Sports and Fitness': ['Athletic Conditioning', 'Team Leadership', 'Outdoor Navigation'],
  'Music and Entertainment': ['Ableton Live', 'Audio Engineering', 'Sound Design'],
  'Art and Graphic Design': ['Figma', 'Design Systems', 'Blender 3D', 'Typography'],
  'Photography and Video Editing': ['DaVinci Resolve', 'Adobe Premiere', 'Color Grading'],
  'Entrepreneurship and Business': ['Lean Canvas', 'Customer Discovery', 'Pitch Deck Design'],
  'Marketing and Management': ['Growth Experimentation', 'Scrum Sprint Planning', 'Copywriting'],
  'Research and Science': ['Literature Review Synthesis', 'Hypothesis Testing', 'Statistical Inference'],
  'Reading and Education': ['Zettelkasten Note-Taking', 'Technical Writing', 'Speed Synthesis'],
  'Psychology and Human Behavior': ['User Interviewing', 'Behavioral Economics', 'Empathy Mapping'],
  'Communication and Public Speaking': ['Presentation Framing', 'Storytelling Formats', 'Debate Argumentation'],
  'Social Activities and Community Building': ['Community Moderation', 'Cohort Building', 'Event Production']
}

/**
 * Computes normalized interest scores and generates a complete student interest profile
 * @param {Record<number, string>} answers - mapping questionId -> optionId
 */
export function calculateQuizResults(answers) {
  // 1. Initialize accumulator for all 15 categories
  const categoryScores = {}
  INTEREST_CATEGORIES_15.forEach(cat => {
    categoryScores[cat] = 0
  })

  // Initialize accumulator for working styles
  const roleScores = {
    'Technical Builder': 0,
    'Creative Thinker': 0,
    'Strategic Organizer': 0,
    'Analytical Researcher': 0
  }

  // 2. Tally weights from student's answers
  QUIZ_12_QUESTIONS.forEach(q => {
    const selectedOptionId = answers[q.id]
    if (!selectedOptionId) return

    const option = q.options.find(o => o.id === selectedOptionId)
    if (!option) return

    // Apply category weights
    if (option.weights) {
      Object.entries(option.weights).forEach(([cat, weight]) => {
        if (categoryScores[cat] !== undefined) {
          categoryScores[cat] += weight
        }
      })
    }

    // Apply working style weights
    if (option.roleWeights) {
      Object.entries(option.roleWeights).forEach(([role, weight]) => {
        if (roleScores[role] !== undefined) {
          roleScores[role] += weight
        }
      })
    }
  })

  // 3. Sort interest categories by accumulated weight
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])

  const maxScore = sortedCategories[0]?.[1] || 1

  // Normalize scores into percentage relative strength
  const normalizedScores = {}
  sortedCategories.forEach(([cat, score]) => {
    normalizedScores[cat] = Math.min(100, Math.round((score / maxScore) * 100))
  })

  // Top 5 Interests
  const topInterests = sortedCategories
    .slice(0, 5)
    .filter(([_, score]) => score > 0)
    .map(([cat, score]) => ({
      category: cat,
      score,
      percentage: normalizedScores[cat]
    }))

  // Secondary Interests (ranks 6 through 8 with positive scores)
  const secondaryInterests = sortedCategories
    .slice(5, 8)
    .filter(([_, score]) => score > 0)
    .map(([cat, score]) => ({
      category: cat,
      score,
      percentage: normalizedScores[cat]
    }))

  // 4. Derive Top 3 Hobbies from top interest domains
  const candidateHobbies = []
  topInterests.forEach(item => {
    const list = HOBBY_MAPPINGS[item.category] || []
    list.forEach(h => {
      if (!candidateHobbies.includes(h)) candidateHobbies.push(h)
    })
  })
  const hobbies = candidateHobbies.slice(0, 3)

  // 5. Determine dominant Working Style
  const sortedRoles = Object.entries(roleScores).sort((a, b) => b[1] - a[1])
  const dominantRole = sortedRoles[0]?.[0] || 'Technical Builder'
  const workingStyleData = WORKING_STYLES[dominantRole] || WORKING_STYLES['Technical Builder']

  // 6. Gather suggested skills to explore based on top 3 categories
  const suggestedSkillsSet = new Set()
  topInterests.slice(0, 3).forEach(item => {
    const skills = SKILL_RECOMMENDATIONS[item.category] || []
    skills.slice(0, 2).forEach(s => suggestedSkillsSet.add(s))
  })
  const suggestedSkills = Array.from(suggestedSkillsSet).slice(0, 5)

  // 7. Collaboration Preferences
  const collaborationPreferences = [
    `Thrives with ${workingStyleData.bestPartners.join(' & ')} collaborators`,
    `Focus: ${workingStyleData.idealProjects[0]}`,
    `Complementary synergy in ${topInterests[0]?.category || 'Technology'}`
  ]

  return {
    topInterests: topInterests.map(i => i.category),
    topInterestsDetailed: topInterests,
    secondaryInterests: secondaryInterests.map(i => i.category),
    interestScores: normalizedScores,
    rawScores: categoryScores,
    hobbies,
    workingStyle: workingStyleData.title,
    workingStyleData,
    collaborationPreferences,
    suggestedSkills,
    completedAt: new Date().toISOString().split('T')[0],
    answers
  }
}
