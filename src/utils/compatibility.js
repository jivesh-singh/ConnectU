/**
 * ConnectU Intelligent Compatibility Matching Algorithm
 * 
 * Computes multidimensional student synergy by analyzing:
 * 1. Shared Interests & Hobbies (Top + Secondary Categories)
 * 2. Complementary Technical & Creative Skills (No role collisions)
 * 3. Compatible Collaboration Styles (e.g. Technical Builder + Creative Thinker)
 * 4. Shared Project Preferences & Campus Cohort
 */

export function calculateCompatibility(userA, userB) {
  if (!userA || !userB) return { score: 75, reasons: ['Aligned campus curiosity and mutual growth mindset'] }

  const reasons = []

  // --------------------------------------------------------------------------
  // 1. Shared Interests & Hobbies (Weight: 35%)
  // --------------------------------------------------------------------------
  const getInterestsList = (user) => {
    const list = [...(user.interests || [])]
    if (user.quizResult?.topInterests) {
      list.push(...user.quizResult.topInterests)
    }
    if (user.quizResult?.hobbies) {
      list.push(...user.quizResult.hobbies)
    }
    return list.map(i => i.toLowerCase().trim())
  }

  const interestsA = new Set(getInterestsList(userA))
  const interestsB = new Set(getInterestsList(userB))

  // Find direct overlaps and semantic overlaps (e.g. 'ai' in 'ai and ml')
  const commonInterests = []
  interestsA.forEach(itemA => {
    interestsB.forEach(itemB => {
      if (itemA === itemB || (itemA.length > 3 && itemB.includes(itemA)) || (itemB.length > 3 && itemA.includes(itemB))) {
        if (!commonInterests.includes(itemA)) {
          commonInterests.push(itemA)
        }
      }
    })
  })

  // Score based on count of shared focal interests
  let interestScore = 40
  if (commonInterests.length === 1) {
    interestScore = 72
  } else if (commonInterests.length === 2) {
    interestScore = 88
  } else if (commonInterests.length >= 3) {
    interestScore = 98
  }

  if (commonInterests.length > 0) {
    const formatted = commonInterests.slice(0, 2).map(capitalize).join(' & ')
    reasons.push(`Mutual passion for ${formatted}`)
  }

  // --------------------------------------------------------------------------
  // 2. Complementary Working & Collaboration Style (Weight: 25%)
  // --------------------------------------------------------------------------
  const styleA = userA.quizResult?.workingStyle || userA.workingStyle || userA.quizResult?.archetype || 'Technical Builder'
  const styleB = userB.quizResult?.workingStyle || userB.workingStyle || userB.quizResult?.archetype || 'Creative Thinker'

  let styleScore = 75
  const isComplementaryStyle =
    (styleA.includes('Builder') && (styleB.includes('Thinker') || styleB.includes('Organizer') || styleB.includes('Design'))) ||
    (styleB.includes('Builder') && (styleA.includes('Thinker') || styleA.includes('Organizer') || styleA.includes('Design'))) ||
    (styleA.includes('Researcher') && (styleB.includes('Builder') || styleB.includes('Organizer'))) ||
    (styleB.includes('Researcher') && (styleA.includes('Builder') || styleA.includes('Organizer')))

  if (isComplementaryStyle) {
    styleScore = 96
    reasons.push(`High team balance: ${styleA.replace('The ', '')} + ${styleB.replace('The ', '')}`)
  } else if (styleA === styleB) {
    styleScore = 80
    reasons.push(`Shared operational rhythm as ${styleA.replace('The ', '')}s`)
  }

  // --------------------------------------------------------------------------
  // 3. Technical & Creative Skills Synergy (Weight: 25%)
  // --------------------------------------------------------------------------
  const skillsA = (userA.skills || []).map(s => s.toLowerCase())
  const skillsB = (userB.skills || []).map(s => s.toLowerCase())

  const aHasDev = skillsA.some(s => s.includes('react') || s.includes('python') || s.includes('code') || s.includes('c++') || s.includes('typescript') || s.includes('pytorch'))
  const bHasDev = skillsB.some(s => s.includes('react') || s.includes('python') || s.includes('code') || s.includes('c++') || s.includes('typescript') || s.includes('pytorch'))
  const aHasDesign = skillsA.some(s => s.includes('design') || s.includes('figma') || s.includes('ui/ux') || s.includes('video') || s.includes('art'))
  const bHasDesign = skillsB.some(s => s.includes('design') || s.includes('figma') || s.includes('ui/ux') || s.includes('video') || s.includes('art'))
  const aHasBusiness = skillsA.some(s => s.includes('market') || s.includes('business') || s.includes('product') || s.includes('lead'))
  const bHasBusiness = skillsB.some(s => s.includes('market') || s.includes('business') || s.includes('product') || s.includes('lead'))

  let skillScore = 70
  if ((aHasDev && bHasDesign) || (bHasDev && aHasDesign)) {
    skillScore = 96
    reasons.push('Complementary skill synergy: Engineering + Product Design')
  } else if ((aHasDev && bHasBusiness) || (bHasDev && aHasBusiness)) {
    skillScore = 92
    reasons.push('Complementary skill synergy: Technical Builder + Venture Strategy')
  } else {
    const commonSkills = skillsA.filter(s => skillsB.includes(s))
    if (commonSkills.length > 0) {
      skillScore = 82
      reasons.push(`Shared technical toolset in ${capitalize(commonSkills[0])}`)
    }
  }

  // --------------------------------------------------------------------------
  // 4. Shared Project Goals & Campus Proximity (Weight: 15%)
  // --------------------------------------------------------------------------
  const collabA = new Set((userA.collaborationPreferences || ['Hackathons', 'Startup Projects']).map(c => c.toLowerCase()))
  const collabB = new Set((userB.collaborationPreferences || ['Hackathons', 'Startup Projects']).map(c => c.toLowerCase()))
  const commonCollabs = [...collabA].filter(c => collabB.has(c))
  
  let collabScore = 70
  if (commonCollabs.length > 0) {
    collabScore = Math.min(100, 70 + commonCollabs.length * 15)
    reasons.push(`Both seeking ${capitalize(commonCollabs[0])} teammates`)
  }

  // Campus bonus
  if (userA.university && userB.university && userA.university.toLowerCase() === userB.university.toLowerCase()) {
    collabScore = Math.min(100, collabScore + 10)
  }

  // --------------------------------------------------------------------------
  // Weighted Aggregate Calculation
  // --------------------------------------------------------------------------
  const rawScore = (
    interestScore * 0.35 +
    styleScore * 0.25 +
    skillScore * 0.25 +
    collabScore * 0.15
  )

  // Clamp realistically between 68% and 98%
  const finalScore = Math.min(98, Math.max(68, Math.round(rawScore)))

  if (reasons.length === 0) {
    reasons.push('Strong curiosity alignment and collaborative openness')
  }

  return {
    score: finalScore,
    reasons: reasons.slice(0, 3)
  }
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
