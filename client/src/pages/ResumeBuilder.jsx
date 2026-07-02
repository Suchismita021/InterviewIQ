import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FaUpload, FaDownload, FaPlus, FaTrash, FaCopy,
  FaFileAlt, FaBriefcase, FaGraduationCap, FaTools, FaProjectDiagram,
  FaCertificate, FaLanguage, FaCheck, FaMagic, FaTimes, FaSave,
  FaEye, FaUndo, FaRedo, FaPalette, FaBolt, FaRobot, FaChartLine,
  FaLinkedin, FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaGithub, FaAward, FaBook, FaHeart,
  FaChevronDown, FaChevronUp, FaInfoCircle, FaUserAstronaut, FaLightbulb
} from 'react-icons/fa';
import { BsFillStarFill, BsStarHalf, BsStar } from 'react-icons/bs';

import axios from 'axios';
import { ServerUrl } from '../App';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Template definitions with styling configurations
// ATS-Friendly single-column layouts optimized for big tech ATS systems
const TEMPLATES = [
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Classic single-column, ATS-perfect',
    colors: { primary: '#000000', secondary: '#333333', accent: '#000000' },
    layout: 'harvard-classic',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Georgia, serif',
    fontSize: '11pt'
  },
  {
    id: 'stanford',
    name: 'Stanford',
    description: 'Clean professional single-column',
    colors: { primary: '#1a1a1a', secondary: '#4a4a4a', accent: '#1a1a1a' },
    layout: 'stanford-clean',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Arial, sans-serif',
    fontSize: '11pt'
  },
  {
    id: 'mit',
    name: 'MIT',
    description: 'Technical single-column format',
    colors: { primary: '#000000', secondary: '#333333', accent: '#000000' },
    layout: 'mit-technical',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Times New Roman, serif',
    fontSize: '12pt'
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Modern tech single-column',
    colors: { primary: '#202124', secondary: '#5f6368', accent: '#1a73e8' },
    layout: 'google-modern',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Arial, sans-serif',
    fontSize: '10pt'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Senior leadership format',
    colors: { primary: '#0a1628', secondary: '#2d3748', accent: '#0a1628' },
    layout: 'executive-formal',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Calibri, sans-serif',
    fontSize: '11pt'
  },
  {
    id: 'swe',
    name: 'Software Engineer',
    description: 'SDE optimized single-column',
    colors: { primary: '#000000', secondary: '#333333', accent: '#0066cc' },
    layout: 'sde-optimized',
    atsFriendly: true,
    recommended: true,
    bigTech: true,
    font: 'Arial, sans-serif',
    fontSize: '10.5pt'
  }
];

// Action verbs for resume enhancement
const ACTION_VERBS = [
  'Achieved', 'Accomplished', 'Administered', 'Analyzed', 'Built', 'Collaborated',
  'Coordinated', 'Created', 'Designed', 'Developed', 'Directed', 'Enhanced',
  'Evaluated', 'Executed', 'Implemented', 'Improved', 'Initiated', 'Led',
  'Managed', 'Optimized', 'Organized', 'Oversaw', 'Planned', 'Presented',
  'Reduced', 'Resolved', 'Streamlined', 'Supervised', 'Transformed', 'Volunteered'
];

// Skill categories with common skills
const SKILL_CATEGORIES = {
  'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Ruby'],
  'Frontend': ['React', 'Vue.js', 'Angular', 'Svelte', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap'],
  'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'Ruby on Rails'],
  'Database': ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Firebase'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Terraform'],
  'Tools': ['Git', 'Linux', 'VS Code', 'Jira', 'Figma', 'Postman', 'Webpack']
};

const initialResume = {
  title: 'My Resume',
  template: 'modern',
  colorScheme: 'default',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    github: '',
    photo: '',
    photoStyle: 'circle',
    summary: ''
  },
  professionalSummary: '',
  workExperience: [],
  internships: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
  achievements: [],
  publications: [],
  volunteerExperience: [],
  references: []
};

// Transform skills between formats
const transformSkillsToBackend = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map(skill => {
    if (typeof skill === 'string') {
      return { name: skill, level: 'intermediate', category: 'general' };
    }
    return { ...skill, level: skill.level || 'intermediate' };
  });
};

const transformSkillsToFrontend = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills.map(skill => {
    if (typeof skill === 'string') return skill;
    return skill.name || skill;
  });
};

// Bullet point handler
const handleBulletPointKeyDown = (e, currentValue, onChange) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const newText = currentValue + (currentValue ? '\n• ' : '• ');
    onChange(newText);
  }
};

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[\d\s\-\+\(\)]{10,}$/.test(phone);
const validateUrl = (url) => {
  if (!url) return true;
  // Add protocol prefix if missing for validation
  const urlToValidate = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  try { new URL(urlToValidate); return true; } catch { return false; }
};

// ATS Score Calculation - STRICT Big Tech Standards
const calculateAtsScore = (resume) => {
  let score = 0;
  const issues = [];
  const suggestions = [];

  // Big Tech Keywords - Critical for ATS parsing
  const BIG_TECH_KEYWORDS = [
    // Technical Skills
    'javascript', 'python', 'java', 'typescript', 'go', 'rust', 'c++', 'sql',
    'react', 'angular', 'vue', 'node.js', 'django', 'spring', 'flask',
    'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'ci/cd',
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'git', 'agile', 'scrum', 'rest api', 'graphql', 'microservices',
    // Action Verbs for Impact
    'architected', 'engineered', 'optimized', 'scaled', 'designed', 'implemented',
    'led', 'spearheaded', 'delivered', 'improved', 'reduced', 'increased',
    // Metrics Patterns
    'percent', '%', 'x', 'users', 'revenue', 'cost', 'performance', 'latency'
  ];

  // ========== CONTACT INFO (10 points) - Must be complete ==========
  if (resume.personalInfo?.fullName?.trim()) {
    score += 3;
    // Check for proper name format (first + last)
    if (!resume.personalInfo.fullName.trim().includes(' ')) {
      issues.push({ section: 'Contact', issue: 'Use full name (first + last) for professionalism', severity: 'medium' });
    }
  } else {
    issues.push({ section: 'Contact', issue: 'Missing full name', severity: 'high' });
  }

  if (resume.personalInfo?.email?.trim()) {
    score += 3;
    if (validateEmail(resume.personalInfo.email)) {
      // Check for professional email (no nicknames)
      if (/^[a-z]+\.[a-z]+@/.test(resume.personalInfo.email.toLowerCase()) ||
          /^[a-z]+[0-9]*@/.test(resume.personalInfo.email.toLowerCase())) {
        score += 1;
      } else {
        suggestions.push('Use a professional email format (firstname.lastname@domain.com)');
      }
    } else {
      issues.push({ section: 'Contact', issue: 'Invalid email format', severity: 'high' });
    }
  } else {
    issues.push({ section: 'Contact', issue: 'Missing email', severity: 'high' });
  }

  if (resume.personalInfo?.phone?.trim()) {
    score += 2;
    // Check for properly formatted phone
    if (resume.personalInfo.phone.replace(/\D/g, '').length >= 10) {
      score += 1;
    }
  } else {
    issues.push({ section: 'Contact', issue: 'Missing phone number', severity: 'high' });
  }

  // LinkedIn is CRITICAL for big tech
  if (resume.personalInfo?.linkedin?.trim()) {
    if (resume.personalInfo.linkedin.includes('linkedin.com/in/')) {
      score += 2;
    } else if (resume.personalInfo.linkedin.includes('/in/')) {
      score += 2;
    } else {
      suggestions.push('Use custom LinkedIn URL (linkedin.com/in/yourname)');
    }
  } else {
    issues.push({ section: 'Contact', issue: 'Missing LinkedIn - critical for big tech', severity: 'high' });
  }

  // GitHub/Portfolio for tech roles
  if (resume.personalInfo?.github?.trim() || resume.personalInfo?.portfolio?.trim()) {
    score += 1;
  } else {
    suggestions.push('Add GitHub or portfolio URL for technical roles');
  }

  // ========== PROFESSIONAL SUMMARY (20 points) - Must be impactful ==========
  if (resume.professionalSummary?.trim()) {
    const summary = resume.professionalSummary.trim();

    // Length check - big tech prefers 3-5 lines (100-400 chars)
    if (summary.length >= 100) score += 4;
    else {
      issues.push({ section: 'Summary', issue: 'Summary too short - expand to 100+ characters', severity: 'high' });
    }

    if (summary.length <= 400) score += 3;
    else suggestions.push('Keep summary under 400 characters for readability');

    // Action verbs - MUST have at least 2
    const actionVerbCount = ACTION_VERBS.filter(verb =>
      summary.toLowerCase().includes(verb.toLowerCase())
    ).length;

    if (actionVerbCount >= 3) score += 5;
    else if (actionVerbCount >= 1) {
      score += 2;
      suggestions.push('Add more action verbs to strengthen summary');
    } else {
      issues.push({ section: 'Summary', issue: 'No action verbs - start bullets with words like "Led", "Built", "Optimized"', severity: 'high' });
    }

    // Years of experience mention
    if (/\d+\+?\s*years?/.test(summary.toLowerCase())) {
      score += 2;
    } else {
      suggestions.push('Mention years of experience in summary');
    }

    // Role/title clarity
    if (/(engineer|developer|manager|lead|senior|principal|staff)/i.test(summary)) {
      score += 2;
    } else {
      suggestions.push('Clearly state your target role/title in summary');
    }

    // Technical domain mention
    if (/(backend|frontend|full.?stack|devops|cloud|data|ml|mobile)/i.test(summary)) {
      score += 2;
    }
  } else {
    issues.push({ section: 'Summary', issue: 'Missing professional summary - critical section', severity: 'high' });
  }

  // ========== WORK EXPERIENCE (35 points) - MOST IMPORTANT ==========
  if (resume.workExperience?.length > 0) {
    const expCount = resume.workExperience.length;

    // Big tech expects 2+ experiences for mid-level, 1+ for entry
    if (expCount >= 3) score += 8;
    else if (expCount >= 2) score += 5;
    else if (expCount >= 1) score += 3;

    let totalBulletPoints = 0;
    let experiencesWithMetrics = 0;
    let experiencesWithActionVerbs = 0;
    let experiencesWithCompany = 0;

    resume.workExperience.forEach((exp, idx) => {
      // Company name required
      if (exp.company?.trim()) {
        score += 1.5;
        experiencesWithCompany++;
      } else {
        issues.push({ section: 'Experience', issue: `Missing company name for position ${idx + 1}`, severity: 'high' });
      }

      // Position title required
      if (exp.position?.trim()) {
        score += 1.5;
        // Check for seniority level
        if (/(senior|lead|principal|staff|engineer|developer|manager)/i.test(exp.position)) {
          score += 0.5;
        }
      } else {
        issues.push({ section: 'Experience', issue: `Missing job title for position ${idx + 1}`, severity: 'high' });
      }

      // Dates required
      if (exp.startDate?.trim() && (exp.endDate?.trim() || exp.current)) {
        score += 1;
      } else {
        issues.push({ section: 'Experience', issue: `Missing dates for position ${idx + 1}`, severity: 'medium' });
      }

      // Description analysis
      if (exp.description?.trim()) {
        const desc = exp.description;

        // Count bullet points
        const bulletPoints = desc.split('\n').filter(line =>
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('▸')
        ).length;
        totalBulletPoints += bulletPoints;

        // Big tech expects 3-6 bullets per role
        if (bulletPoints >= 3) score += 1;
        else if (bulletPoints >= 1) {
          score += 0.5;
          suggestions.push(`Add 3-6 bullet points for ${exp.position || 'this role'}`);
        } else {
          issues.push({ section: 'Experience', issue: 'No bullet points - use bullet format for achievements', severity: 'high' });
        }

        // Check for action verbs in bullets
        const hasActionVerb = ACTION_VERBS.some(verb => desc.toLowerCase().includes(verb.toLowerCase()));
        if (hasActionVerb) {
          experiencesWithActionVerbs++;
          score += 1;
        } else {
          suggestions.push(`Start bullets with action verbs for ${exp.position || 'this role'}`);
        }

        // Check for metrics/quantifiable achievements - CRITICAL for big tech
        const hasMetrics = /(\d+%|\d+x|\$\d{1,3}(k|m|b)?|\d+\s*(users|customers|clients|systems|services)|reduced by|increased by|improved by|cut.*by|saved.*\$|scaled to|handled.*requests)/i.test(desc);
        if (hasMetrics) {
          experiencesWithMetrics++;
          score += 2;
        } else {
          issues.push({ section: 'Experience', issue: `No quantifiable metrics in ${exp.position || 'role'} - big tech requires measurable impact`, severity: 'high' });
        }

        // Check for technical depth
        const techKeywords = ['designed', 'architected', 'implemented', 'built', 'developed', 'optimized', 'refactored', 'migrated', 'automated', 'deployed'];
        const hasTechDepth = techKeywords.some(kw => desc.toLowerCase().includes(kw));
        if (hasTechDepth) score += 0.5;
        else suggestions.push('Use technical action verbs: "architected", "implemented", "optimized"');

        // Check for impact statements
        const hasImpact = /(impact|result|outcome|led to|resulting in|which|that)/i.test(desc);
        if (hasImpact) score += 0.5;
      } else {
        issues.push({ section: 'Experience', issue: `Missing description for ${exp.position || 'position ' + (idx + 1)}`, severity: 'high' });
      }
    });

    // Bonus for consistent formatting
    if (experiencesWithCompany === expCount && experiencesWithActionVerbs === expCount) {
      score += 2;
    }

    // Big tech bonus: Multiple experiences with metrics
    if (experiencesWithMetrics >= 2) score += 3;
    else if (experiencesWithMetrics >= 1) score += 1;
  } else {
    issues.push({ section: 'Experience', issue: 'No work experience - critical for big tech applications', severity: 'high' });
  }

  // ========== EDUCATION (15 points) ==========
  if (resume.education?.length > 0) {
    let educationScore = 0;
    resume.education.forEach((edu, idx) => {
      if (edu.institution?.trim()) {
        educationScore += 2;
      } else {
        issues.push({ section: 'Education', issue: 'Missing institution name', severity: 'high' });
      }

      if (edu.degree?.trim()) {
        educationScore += 2;
        // Check for relevant degree
        if (/(computer science|software engineering|data science|information technology|engineering|mathematics|physics)/i.test(edu.degree)) {
          educationScore += 1;
        }
      } else {
        issues.push({ section: 'Education', issue: 'Missing degree', severity: 'high' });
      }

      if (edu.graduationDate?.trim()) {
        educationScore += 1;
      }

      // GPA bonus if included and strong
      if (edu.cgpa) {
        const cgpa = parseFloat(edu.cgpa);
        if (cgpa >= 8.5 || cgpa >= 3.5) {
          educationScore += 1;
        } else if (cgpa < 7.0) {
          suggestions.push('Consider omitting GPA if below 3.0/4.0 or 7.0/10.0');
        }
      }
    });
    score += Math.min(educationScore, 15);
  } else {
    issues.push({ section: 'Education', issue: 'No education - big tech typically requires Bachelor\'s minimum', severity: 'high' });
  }

  // ========== SKILLS (15 points) - Must be relevant and categorized ==========
  if (resume.skills?.length > 0) {
    const skillCount = resume.skills.length;

    // Big tech expects 8-15 relevant skills
    if (skillCount >= 10) score += 5;
    else if (skillCount >= 7) score += 3;
    else if (skillCount >= 5) score += 2;
    else {
      issues.push({ section: 'Skills', issue: 'Add at least 7-10 relevant technical skills', severity: 'high' });
    }

    // Check for skill categories - must have diverse skills
    const technicalSkills = ['javascript', 'python', 'java', 'typescript', 'go', 'rust', 'c++', 'sql', 'react', 'node', 'aws', 'docker', 'kubernetes', 'git'];
    const matchingTechSkills = resume.skills.filter(s =>
      technicalSkills.some(ts => s.toLowerCase().includes(ts))
    ).length;

    if (matchingTechSkills >= 5) {
      score += 5;
    } else if (matchingTechSkills >= 3) {
      score += 3;
    } else {
      suggestions.push('Add core technical skills: programming languages, frameworks, cloud platforms');
    }

    // Check for skill levels/categories
    const allSkills = Object.values(SKILL_CATEGORIES).flat();
    const hasCategorizedSkills = resume.skills.some(s =>
      allSkills.some(as => as.toLowerCase() === s.toLowerCase())
    );
    if (hasCategorizedSkills) score += 3;
    else suggestions.push('Use industry-standard skill names for ATS parsing');

    // Soft skills bonus
    const softSkills = ['leadership', 'communication', 'collaboration', 'mentoring', 'agile', 'scrum'];
    const hasSoftSkills = resume.skills.some(s =>
      softSkills.some(ss => s.toLowerCase().includes(ss))
    );
    if (hasSoftSkills) score += 2;
  } else {
    issues.push({ section: 'Skills', issue: 'No skills added - critical section', severity: 'high' });
  }

  // ========== PROJECTS (10 points) - Must show technical depth ==========
  if (resume.projects?.length > 0) {
    const projCount = resume.projects.length;

    if (projCount >= 3) score += 4;
    else if (projCount >= 2) score += 3;
    else score += 2;

    resume.projects.forEach((proj, idx) => {
      if (proj.name?.trim()) score += 0.5;

      if (proj.description?.trim()) {
        const desc = proj.description;
        // Check for technical depth
        if (desc.length >= 50) score += 0.5;

        // Check for action verbs
        if (ACTION_VERBS.some(v => desc.toLowerCase().includes(v.toLowerCase()))) {
          score += 0.5;
        }

        // Check for link (shows deployed work)
        if (proj.link?.trim()) score += 0.5;
      }
    });
  } else {
    issues.push({ section: 'Projects', issue: 'No projects - include 2-3 technical projects to demonstrate skills', severity: 'high' });
  }

  // ========== ADDITIONAL SECTIONS (5 points) ==========
  // Certifications - big tech values these
  if (resume.certifications?.length > 0) {
    score += 2;
    // Check for relevant certs
    const relevantCerts = ['aws', 'azure', 'gcp', 'kubernetes', 'terraform', 'security+', 'pmp'];
    const hasRelevantCert = resume.certifications.some(cert =>
      relevantCerts.some(rc => (cert.name + cert.issuer).toLowerCase().includes(rc))
    );
    if (hasRelevantCert) score += 1;
  } else {
    suggestions.push('Add relevant certifications (AWS, GCP, Kubernetes, etc.)');
  }

  // Achievements
  if (resume.achievements?.length > 0) {
    score += 2;
  } else {
    suggestions.push('Add achievements: hackathons, awards, publications, open-source contributions');
  }

  // Languages
  if (resume.languages?.length > 0) {
    score += 1;
  }

  // ========== FORMAT CHECKS (CRITICAL for ATS) ==========
  // Photo - recommend against for US big tech
  const hasPhoto = !!resume.personalInfo?.photo;
  if (hasPhoto) {
    suggestions.push('Remove photo for US-based applications (prevents bias concerns)');
  }

  // Check for clean formatting in descriptions
  const allDescriptions = [
    resume.professionalSummary,
    ...resume.workExperience.map(e => e.description),
    ...resume.projects.map(p => p.description)
  ].filter(Boolean);

  let hasFormattingIssues = false;
  allDescriptions.forEach(desc => {
    // Check for emojis
    if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u.test(desc)) {
      hasFormattingIssues = true;
    }
    // Check for special characters that break ATS
    if (/[\u{2022}\u{25E6}\u{25AA}\u{25B6}\u{2713}\u{2717}\u{2605}\u{2606}]/u.test(desc)) {
      hasFormattingIssues = true;
    }
  });

  if (hasFormattingIssues) {
    suggestions.push('Remove emojis and special characters - use standard bullets (•) only');
  }

  // ========== KEYWORD DENSITY CHECK ==========
  const resumeText = JSON.stringify(resume).toLowerCase();
  const keywordMatches = BIG_TECH_KEYWORDS.filter(kw => resumeText.includes(kw)).length;
  const keywordDensity = keywordMatches / BIG_TECH_KEYWORDS.length;

  if (keywordDensity >= 0.4) score += 3;
  else if (keywordDensity >= 0.25) score += 2;
  else if (keywordDensity >= 0.15) score += 1;
  else {
    issues.push({ section: 'Keywords', issue: 'Low keyword density - add more industry-standard terms', severity: 'medium' });
  }

  // ========== FINAL SCORING ==========
  return {
    score: Math.min(Math.round(score), 100),
    issues,
    suggestions,
    breakdown: {
      contact: score >= 8 ? 'Good' : 'Needs Work',
      summary: resume.professionalSummary && resume.professionalSummary.length >= 100 ? 'Good' : 'Needs Work',
      experience: resume.workExperience?.length >= 2 ? 'Good' : 'Needs Work',
      education: resume.education?.length > 0 ? 'Good' : 'Missing',
      skills: resume.skills?.length >= 8 ? 'Good' : 'Needs Work'
    },
    keywordDensity: Math.round(keywordDensity * 100) + '%'
  };
};

// AI Suggestions Generator - Strict Big Tech Standards
const generateAiSuggestions = (resume) => {
  const suggestions = [];

  // ========== CONTACT INFO ==========
  if (!resume.personalInfo?.linkedin || !resume.personalInfo.linkedin.includes('/in/')) {
    suggestions.push({
      category: 'Contact Info',
      type: 'ats',
      message: 'Customize your LinkedIn URL (linkedin.com/in/yourname). Big tech recruiters expect this.',
      priority: 'high'
    });
  }

  if (!resume.personalInfo?.github && !resume.personalInfo?.portfolio) {
    suggestions.push({
      category: 'Contact Info',
      type: 'improvement',
      message: 'Add GitHub or portfolio URL - critical for technical roles at big tech.',
      priority: 'high'
    });
  }

  // ========== PROFESSIONAL SUMMARY ==========
  if (resume.professionalSummary) {
    const summary = resume.professionalSummary;

    if (summary.length < 100) {
      suggestions.push({
        category: 'Professional Summary',
        type: 'improvement',
        message: 'Expand summary to 100-400 characters. Big tech expects 3-5 impactful lines.',
        priority: 'high'
      });
    }

    if (summary.length > 500) {
      suggestions.push({
        category: 'Professional Summary',
        type: 'improvement',
        message: 'Shorten summary to under 500 characters. Be concise and impactful.',
        priority: 'medium'
      });
    }

    const actionVerbCount = ACTION_VERBS.filter(v =>
      summary.toLowerCase().includes(v.toLowerCase())
    ).length;

    if (actionVerbCount < 2) {
      suggestions.push({
        category: 'Professional Summary',
        type: 'improvement',
        message: 'Start with 2-3 strong action verbs: "Led", "Architected", "Engineered", "Scaled", "Optimized".',
        priority: 'high'
      });
    }

    if (!/\d+\+?\s*years?/i.test(summary)) {
      suggestions.push({
        category: 'Professional Summary',
        type: 'improvement',
        message: 'Include years of experience (e.g., "5+ years building scalable systems").',
        priority: 'medium'
      });
    }

    if (!/(engineer|developer|manager|lead|senior|principal|staff)/i.test(summary)) {
      suggestions.push({
        category: 'Professional Summary',
        type: 'ats',
        message: 'Clearly state your target role/title for ATS keyword matching.',
        priority: 'high'
      });
    }
  } else {
    suggestions.push({
      category: 'Professional Summary',
      type: 'ats',
      message: 'Add a professional summary - it\'s the first thing ATS and recruiters scan.',
      priority: 'high'
    });
  }

  // ========== WORK EXPERIENCE - CRITICAL ==========
  resume.workExperience?.forEach((exp, idx) => {
    if (!exp.company?.trim()) {
      suggestions.push({
        category: 'Work Experience',
        type: 'ats',
        message: `Add company name for position ${idx + 1}. Big tech values brand recognition.`,
        priority: 'high'
      });
    }

    if (!exp.position?.trim()) {
      suggestions.push({
        category: 'Work Experience',
        type: 'ats',
        message: `Add job title for position ${idx + 1}. Use industry-standard titles.`,
        priority: 'high'
      });
    }

    if (exp.description) {
      const bulletPoints = exp.description.split('\n').filter(line =>
        line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('▸')
      );

      if (bulletPoints.length < 3) {
        suggestions.push({
          category: 'Work Experience',
          type: 'improvement',
          message: `Add 3-6 bullet points for ${exp.position || 'this role'}. Big tech expects detailed achievements.`,
          priority: 'high'
        });
      }

      if (bulletPoints.length > 7) {
        suggestions.push({
          category: 'Work Experience',
          type: 'improvement',
          message: `Consider consolidating bullets for ${exp.position || 'this role'} to 5-7 max for readability.`,
          priority: 'low'
        });
      }

      // Metrics check - CRITICAL for big tech
      if (!/\d+%|\d+x|\$\d{1,3}(k|m|b)?|\d+\s*(users|customers|clients|systems|services)|reduced by|increased by|improved by|cut.*by|saved.*\$|scaled to|handled.*requests/i.test(exp.description)) {
        suggestions.push({
          category: 'Work Experience',
          type: 'ats',
          message: `Add quantifiable metrics to ${exp.position || 'this role'}. Big tech requires measurable impact: "Reduced latency by 40%", "Scaled to 1M+ users", "Saved $50K annually".`,
          priority: 'high'
        });
      }

      // Action verb check
      if (!ACTION_VERBS.some(v => exp.description.toLowerCase().includes(v.toLowerCase()))) {
        suggestions.push({
          category: 'Work Experience',
          type: 'improvement',
          message: `Start each bullet with action verbs: "Architected", "Implemented", "Optimized", "Led", "Built". Avoid "Responsible for".`,
          priority: 'high'
        });
      }

      // Check for weak language
      if (/responsible for|tasked with|helped with|worked on/i.test(exp.description)) {
        suggestions.push({
          category: 'Work Experience',
          type: 'improvement',
          message: `Replace passive language ("Responsible for", "Helped with") with strong action verbs showing ownership and impact.`,
          priority: 'medium'
        });
      }

      // Technical depth check
      const techVerbs = ['architected', 'designed', 'implemented', 'built', 'developed', 'optimized', 'refactored', 'migrated', 'automated', 'deployed', 'scaled'];
      if (!techVerbs.some(v => exp.description.toLowerCase().includes(v))) {
        suggestions.push({
          category: 'Work Experience',
          type: 'improvement',
          message: `Use technical depth verbs: "Architected microservices", "Implemented CI/CD", "Optimized database queries".`,
          priority: 'medium'
        });
      }
    } else {
      suggestions.push({
        category: 'Work Experience',
        type: 'ats',
        message: `Add detailed description for ${exp.position || 'position ' + (idx + 1)}. Use bullet points with measurable achievements.`,
        priority: 'high'
      });
    }
  });

  if (!resume.workExperience || resume.workExperience.length === 0) {
    suggestions.push({
      category: 'Work Experience',
      type: 'ats',
      message: 'Add work experience - big tech requires demonstrated professional experience. Include internships if entry-level.',
      priority: 'high'
    });
  }

  // ========== SKILLS ==========
  if (resume.skills?.length > 0) {
    if (resume.skills.length < 8) {
      suggestions.push({
        category: 'Skills',
        type: 'ats',
        message: 'Add 8-15 technical skills. Include: programming languages, frameworks, databases, cloud platforms, and tools.',
        priority: 'high'
      });
    }

    // Check for specific skill categories
    const hasLanguage = resume.skills.some(s =>
      /(javascript|python|java|typescript|go|rust|c\+\+|ruby|swift|kotlin)/i.test(s)
    );
    const hasFramework = resume.skills.some(s =>
      /(react|angular|vue|node|django|flask|spring|express|next\.js)/i.test(s)
    );
    const hasCloud = resume.skills.some(s =>
      /(aws|azure|gcp|cloud|lambda|ec2|s3|cloudfront)/i.test(s)
    );
    const hasDevOps = resume.skills.some(s =>
      /(docker|kubernetes|k8s|terraform|jenkins|ci\/cd|github actions)/i.test(s)
    );

    if (!hasLanguage) {
      suggestions.push({
        category: 'Skills',
        type: 'ats',
        message: 'Add programming languages - core requirement for technical roles.',
        priority: 'high'
      });
    }

    if (!hasCloud && !hasDevOps) {
      suggestions.push({
        category: 'Skills',
        type: 'ats',
        message: 'Add cloud/DevOps skills (AWS, GCP, Azure, Docker, Kubernetes). Big tech expects cloud fluency.',
        priority: 'high'
      });
    }
  } else {
    suggestions.push({
      category: 'Skills',
      type: 'ats',
      message: 'Add technical skills - categorize by Languages, Frameworks, Databases, Cloud, Tools.',
      priority: 'high'
    });
  }

  // ========== PROJECTS ==========
  if (resume.projects?.length > 0) {
    resume.projects.forEach((proj, idx) => {
      if (!proj.description || proj.description.length < 50) {
        suggestions.push({
          category: 'Projects',
          type: 'improvement',
          message: `Expand description for "${proj.name || 'Project ' + (idx + 1)}". Explain the problem, your solution, and technologies used.`,
          priority: 'medium'
        });
      }

      if (!proj.link) {
        suggestions.push({
          category: 'Projects',
          type: 'improvement',
          message: `Add a link (GitHub, live demo) for "${proj.name || 'Project ' + (idx + 1)}". Big tech wants to see working code.`,
          priority: 'medium'
        });
      }

      if (proj.description && !ACTION_VERBS.some(v => proj.description.toLowerCase().includes(v.toLowerCase()))) {
        suggestions.push({
          category: 'Projects',
          type: 'improvement',
          message: `Start project description with action verbs: "Built", "Designed", "Implemented".`,
          priority: 'low'
        });
      }
    });
  } else {
    suggestions.push({
      category: 'Projects',
      type: 'improvement',
      message: 'Add 2-3 technical projects showcasing your skills. Include problem, solution, tech stack, and link to code/demo.',
      priority: 'high'
    });
  }

  // ========== EDUCATION ==========
  if (resume.education?.length > 0) {
    resume.education.forEach((edu, idx) => {
      if (!edu.graduationDate) {
        suggestions.push({
          category: 'Education',
          type: 'ats',
          message: `Add graduation date for ${edu.institution || 'this degree'}. ATS filters by graduation year.`,
          priority: 'medium'
        });
      }
    });
  }

  // ========== CERTIFICATIONS ==========
  if (!resume.certifications || resume.certifications.length === 0) {
    suggestions.push({
      category: 'Certifications',
      type: 'improvement',
      message: 'Add relevant certifications: AWS Certified, GCP Professional, Kubernetes (CKA/CKAD), Terraform Associate.',
      priority: 'medium'
    });
  }

  // ========== ACHIEVEMENTS ==========
  if (!resume.achievements || resume.achievements.length === 0) {
    suggestions.push({
      category: 'Achievements',
      type: 'improvement',
      message: 'Add achievements: hackathon wins, publications, open-source contributions, speaking engagements, patents.',
      priority: 'medium'
    });
  }

  // ========== FORMAT & ATS CHECKS ==========
  const hasPhoto = !!resume.personalInfo?.photo;
  if (hasPhoto) {
    suggestions.push({
      category: 'Format',
      type: 'ats',
      message: 'Remove photo for US/UK big tech applications. Prevents unconscious bias and ATS parsing issues.',
      priority: 'medium'
    });
  }

  // Check for emojis in text
  const textContent = JSON.stringify(resume);
  if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u.test(textContent)) {
    suggestions.push({
      category: 'Format',
      type: 'ats',
      message: 'Remove all emojis. Big tech resumes use professional language only.',
      priority: 'high'
    });
  }

  return suggestions;
};

// Section header component
const SectionHeader = ({ title, icon, onAdd, addLabel = 'Add' }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
      >
        <FaPlus size={12} />
        {addLabel}
      </button>
    )}
  </div>
);

// Input field component with validation
const InputField = ({ label, value, onChange, placeholder, type = 'text', error, icon, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
          icon ? 'pl-10' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Textarea with character count
const TextAreaWithCount = ({ value, onChange, placeholder, maxLength = 500, rows = 4, label }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
    />
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-gray-500">{value.length}/{maxLength} characters</span>
      {value.length > maxLength * 0.9 && (
        <span className="text-xs text-orange-500">Approaching limit</span>
      )}
    </div>
  </div>
);

// Collapsible section component
const CollapsibleSection = ({ title, children, defaultOpen = true, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Action verb suggestions
const ActionVerbSuggestions = ({ onSelect }) => (
  <div className="flex flex-wrap gap-1.5 mt-2">
    <span className="text-xs text-gray-500 mr-1">Start with:</span>
    {ACTION_VERBS.slice(0, 12).map((verb) => (
      <button
        key={verb}
        onClick={() => onSelect(verb)}
        className="px-2 py-1 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 text-xs rounded transition"
      >
        {verb}
      </button>
    ))}
  </div>
);

function ResumeBuilder() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [resume, setResume] = useState(() => {
    const saved = localStorage.getItem('currentResume');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed === 'object' && parsed.personalInfo) {
        return parsed;
      }
    } catch (e) {
      console.log('Error parsing saved resume:', e);
      localStorage.removeItem('currentResume');
    }
    return initialResume;
  });
  const [resumes, setResumes] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [atsScore, setAtsScore] = useState(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const resumeRef = useRef(null);

  // Check authentication
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userData) {
        navigate('/auth');
      } else {
        setIsReady(true);
        fetchResumes();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [userData, navigate]);

  if (!isReady && !userData) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('currentResume', JSON.stringify(resume));
  }, [resume]);

  // History management for undo/redo
  const addToHistory = (newResume) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newResume)));
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setResume(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setResume(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleAnalyzeAts = () => {
    setAnalyzingAts(true);
    setTimeout(() => {
      const result = calculateAtsScore(resume);
      setAtsScore(result);
      setAnalyzingAts(false);
      setShowAtsModal(true);
    }, 500);
  };

  const handleGenerateAiSuggestions = () => {
    setAnalyzingAI(true);
    setTimeout(() => {
      const suggestions = generateAiSuggestions(resume);
      setAiSuggestions(suggestions);
      setAnalyzingAI(false);
      setShowSuggestionsModal(true);
    }, 800);
  };

  // Safe access helpers
  const safePersonalInfo = resume?.personalInfo || {};
  const safeWorkExperience = resume?.workExperience || [];
  const safeInternships = resume?.internships || [];
  const safeEducation = resume?.education || [];
  const safeProjects = resume?.projects || [];
  const safeSkills = resume?.skills || [];
  const safeCertifications = resume?.certifications || [];
  const safeLanguages = resume?.languages || [];
  const safeAchievements = resume?.achievements || [];
  const safePublications = resume?.publications || [];
  const safeVolunteer = resume?.volunteerExperience || [];
  const safeReferences = resume?.references || [];

  const fetchResumes = async () => {
    try {
      const result = await axios.get(ServerUrl + '/api/resume', { withCredentials: true });
      setResumes(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Auto-save on tab change
  const handleTabChange = async (newTab) => {
    addToHistory(resume);
    setActiveTab(newTab);

    if (resume.personalInfo.fullName || resume.professionalSummary || resume.skills.length > 0) {
      setAutoSaveStatus('Auto-saving...');
      try {
        if (selectedResume) {
          await axios.put(ServerUrl + `/api/resume/${selectedResume}`, {
            ...resume,
            skills: transformSkillsToBackend(resume.skills)
          }, { withCredentials: true });
        } else {
          const result = await axios.post(ServerUrl + '/api/resume', {
            ...resume,
            skills: transformSkillsToBackend(resume.skills)
          }, { withCredentials: true });
          setSelectedResume(result.data._id);
        }
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch (error) {
        console.log('Auto-save failed:', error);
        setAutoSaveStatus('Auto-save failed');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    }
  };

  const handleParseResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setParsing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const result = await axios.post(ServerUrl + '/api/resume/parse', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsedSkills = transformSkillsToFrontend(result.data.skills);

      setResume({
        ...initialResume,
        ...result.data,
        skills: parsedSkills,
        template: resume.template,
        title: file.name.replace('.pdf', '')
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Resume parsed successfully! Please review and save.');
    } catch (error) {
      console.log(error);
      alert('Failed to parse resume. Please try again or enter information manually.');
    } finally {
      setParsing(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setResume({
        ...resume,
        personalInfo: { ...resume.personalInfo, photo: reader.result }
      });
    };
    reader.readAsDataURL(file);

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};

    if (safePersonalInfo.email && !validateEmail(safePersonalInfo.email)) {
      errors.email = 'Invalid email format';
    }
    if (safePersonalInfo.phone && !validatePhone(safePersonalInfo.phone)) {
      errors.phone = 'Invalid phone number';
    }
    if (safePersonalInfo.linkedin && !validateUrl(safePersonalInfo.linkedin)) {
      errors.linkedin = 'Invalid URL';
    }
    if (safePersonalInfo.github && !validateUrl(safePersonalInfo.github)) {
      errors.github = 'Invalid URL';
    }
    if (safePersonalInfo.portfolio && !validateUrl(safePersonalInfo.portfolio)) {
      errors.portfolio = 'Invalid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);
    addToHistory(resume);

    try {
      const resumeToSave = {
        ...resume,
        skills: transformSkillsToBackend(resume.skills)
      };

      if (selectedResume) {
        await axios.put(ServerUrl + `/api/resume/${selectedResume}`, resumeToSave, { withCredentials: true });
      } else {
        const result = await axios.post(ServerUrl + '/api/resume', resumeToSave, { withCredentials: true });
        setSelectedResume(result.data._id);
      }
      fetchResumes();
      alert('Resume saved successfully!');
    } catch (error) {
      console.log(error);
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadResume = async (id) => {
    try {
      const result = await axios.get(ServerUrl + `/api/resume/${id}`, { withCredentials: true });
      const loadedSkills = transformSkillsToFrontend(result.data.skills);

      setResume({
        ...result.data,
        skills: loadedSkills
      });
      setSelectedResume(id);

      localStorage.setItem('currentResume', JSON.stringify({
        ...result.data,
        skills: loadedSkills
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDuplicateResume = () => {
    const duplicatedResume = {
      ...resume,
      title: `${resume.title} (Copy)`,
      personalInfo: { ...resume.personalInfo }
    };
    setResume(duplicatedResume);
    setSelectedResume(null);
    localStorage.setItem('currentResume', JSON.stringify(duplicatedResume));
    alert('Resume duplicated! You can now edit and save as a new resume.');
  };

  const handleDeleteResume = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await axios.delete(ServerUrl + `/api/resume/${id}`, { withCredentials: true });
      fetchResumes();
      if (selectedResume === id) {
        setResume(initialResume);
        setSelectedResume(null);
        localStorage.removeItem('currentResume');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGeneratePDF = async () => {
    if (!resumeRef.current) return;

    if (!validateForm()) {
      alert('Please fix validation errors before generating PDF');
      return;
    }

    setGenerating(true);

    try {
      const element = resumeRef.current;
      const opt = {
        margin: 10,
        filename: `${resume.personalInfo.fullName || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
        alert('Resume downloaded successfully!');
      } else {
        // Fallback: use browser print
        window.print();
      }
    } catch (error) {
      console.log(error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    if (suggestion.category === 'Skills') {
      // Add sample skills
      const sampleSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
      const newSkills = [...new Set([...safeSkills, ...sampleSkills])];
      setResume({ ...resume, skills: newSkills });
    } else if (suggestion.category === 'Projects') {
      // Add empty project template
      handleAddItem('projects');
    } else if (suggestion.category === 'Contact Info') {
      setActiveTab('personal');
    } else if (suggestion.category === 'Work Experience') {
      setActiveTab('experience');
    } else if (suggestion.category === 'Professional Summary') {
      setActiveTab('summary');
    }
    setShowSuggestionsModal(false);
  };

  const handleAddSkill = (skillName) => {
    if (!safeSkills.includes(skillName)) {
      setResume({
        ...resume,
        skills: [...safeSkills, skillName]
      });
    }
    setShowSkillSelector(false);
    setSelectedCategory(null);
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <FaFileAlt /> },
    { id: 'summary', label: 'Summary', icon: <FaMagic /> },
    { id: 'experience', label: 'Experience', icon: <FaBriefcase /> },
    { id: 'education', label: 'Education', icon: <FaGraduationCap /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'skills', label: 'Skills', icon: <FaTools /> },
    { id: 'more', label: 'More', icon: <FaPlus /> }
  ];

  const handleAddItem = (field) => {
    let currentArray = [];
    switch(field) {
      case 'workExperience': currentArray = safeWorkExperience; break;
      case 'internships': currentArray = safeInternships; break;
      case 'education': currentArray = safeEducation; break;
      case 'projects': currentArray = safeProjects; break;
      case 'skills': currentArray = safeSkills; break;
      case 'certifications': currentArray = safeCertifications; break;
      case 'languages': currentArray = safeLanguages; break;
      case 'achievements': currentArray = safeAchievements; break;
      case 'publications': currentArray = safePublications; break;
      case 'volunteerExperience': currentArray = safeVolunteer; break;
      case 'references': currentArray = safeReferences; break;
      default: currentArray = [];
    }

    setResume({
      ...resume,
      [field]: [...currentArray, {}]
    });
  };

  const handleRemoveItem = (field, index) => {
    let currentArray = [];
    switch(field) {
      case 'workExperience': currentArray = safeWorkExperience; break;
      case 'internships': currentArray = safeInternships; break;
      case 'education': currentArray = safeEducation; break;
      case 'projects': currentArray = safeProjects; break;
      case 'skills': currentArray = safeSkills; break;
      case 'certifications': currentArray = safeCertifications; break;
      case 'languages': currentArray = safeLanguages; break;
      case 'achievements': currentArray = safeAchievements; break;
      case 'publications': currentArray = safePublications; break;
      case 'volunteerExperience': currentArray = safeVolunteer; break;
      case 'references': currentArray = safeReferences; break;
      default: currentArray = [];
    }
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    setResume({ ...resume, [field]: newArray });
  };

  const handleItemChange = (field, index, key, value) => {
    let currentArray = [];
    switch(field) {
      case 'workExperience': currentArray = safeWorkExperience; break;
      case 'internships': currentArray = safeInternships; break;
      case 'education': currentArray = safeEducation; break;
      case 'projects': currentArray = safeProjects; break;
      case 'skills': currentArray = safeSkills; break;
      case 'certifications': currentArray = safeCertifications; break;
      case 'languages': currentArray = safeLanguages; break;
      case 'achievements': currentArray = safeAchievements; break;
      case 'publications': currentArray = safePublications; break;
      case 'volunteerExperience': currentArray = safeVolunteer; break;
      case 'references': currentArray = safeReferences; break;
      default: currentArray = [];
    }
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [key]: value };
    setResume({ ...resume, [field]: newArray });
  };

  const handlePersonalInfoChange = (key, value) => {
    let processedValue = value;

    // Remove protocol prefix for social links so they display cleanly in the resume
    if (['linkedin', 'github', 'portfolio'].includes(key)) {
      processedValue = value.replace(/^https?:\/\//, '');
    }

    setResume({
      ...resume,
      personalInfo: { ...resume.personalInfo, [key]: processedValue }
    });
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors({ ...validationErrors, [key]: null });
    }
  };

  // Template-specific preview styles
  const getTemplateStyles = (templateId) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return {};

    return {
      '--primary-color': template.colors.primary,
      '--secondary-color': template.colors.secondary,
      '--accent-color': template.colors.accent
    };
  };

  // Resume Preview Component - ATS Friendly Single Column Formats
  const ResumePreview = () => {
    const template = TEMPLATES.find(t => t.id === resume.template) || TEMPLATES[0];

    return (
      <div
        ref={resumeRef}
        className="bg-white p-8 max-w-[800px] mx-auto shadow-lg"
        style={{
          minHeight: '1100px',
          fontFamily: template.font || 'Arial, sans-serif',
          fontSize: template.fontSize || '11pt',
          lineHeight: '1.15',
          ...getTemplateStyles(resume.template)
        }}
      >
        {/* Header Section - Photo on right, text on left */}
        <div className="mb-4 pb-4 border-b-2 border-gray-300">
          <div className="flex items-center gap-4">
            {/* Left: Name and Contact Info */}
            <div className="flex-1">
              <h1
                className="text-2xl font-bold mb-2 tracking-wide"
                style={{ color: template.colors.primary, textTransform: 'uppercase' }}
              >
                {safePersonalInfo.fullName || 'YOUR NAME'}
              </h1>
              <div className="text-sm" style={{ color: template.colors.secondary }}>
                <span className="flex items-center gap-2 flex-wrap">
                  {safePersonalInfo.location && (
                    <span>{safePersonalInfo.location}</span>
                  )}
                  {safePersonalInfo.location && safePersonalInfo.email && (
                    <span className="text-gray-400">|</span>
                  )}
                  {safePersonalInfo.email && (
                    <a href={`mailto:${safePersonalInfo.email}`} className="hover:underline">
                      {safePersonalInfo.email}
                    </a>
                  )}
                  {(safePersonalInfo.location || safePersonalInfo.email) && safePersonalInfo.phone && (
                    <span className="text-gray-400">|</span>
                  )}
                  {safePersonalInfo.phone && (
                    <span>{safePersonalInfo.phone}</span>
                  )}
                </span>
                {(safePersonalInfo.linkedin || safePersonalInfo.github || safePersonalInfo.portfolio) && (
                  <span className="flex items-center gap-3 mt-1 flex-wrap">
                    {safePersonalInfo.linkedin && (
                      <a
                        href={`https://${safePersonalInfo.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: template.colors.accent }}
                      >
                        LinkedIn
                      </a>
                    )}
                    {safePersonalInfo.github && (
                      <a
                        href={`https://${safePersonalInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: template.colors.accent }}
                      >
                        GitHub
                      </a>
                    )}
                    {safePersonalInfo.portfolio && (
                      <a
                        href={`https://${safePersonalInfo.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: template.colors.accent }}
                      >
                        Portfolio
                      </a>
                    )}
                  </span>
                )}
              </div>
            </div>
            {/* Right: Profile Photo */}
            {safePersonalInfo.photo && (
              <div className="flex-shrink-0">
                <img
                  src={safePersonalInfo.photo}
                  alt="Profile"
                  className={`w-24 h-24 object-cover border-2 border-gray-300 ${
                    safePersonalInfo.photoStyle === 'circle' ? 'rounded-full' : 'rounded-lg'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary - ATS Friendly */}
        {resume.professionalSummary && (
          <div className="mb-4">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: template.colors.primary, borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}
            >
              Professional Summary
            </h2>
            <p className="text-sm" style={{ color: '#1f2937' }}>{resume.professionalSummary}</p>
          </div>
        )}

        {/* Work Experience */}
        {safeWorkExperience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Work Experience
            </h2>
            {safeWorkExperience.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: template.colors.primary }}>{exp.position}</h3>
                    <p style={{ color: template.colors.secondary }}>{exp.company}</p>
                  </div>
                  <span className="text-sm" style={{ color: template.colors.secondary }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: template.colors.secondary }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Internships */}
        {safeInternships.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Internships
            </h2>
            {safeInternships.map((intern, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: template.colors.primary }}>{intern.position}</h3>
                    <p style={{ color: template.colors.secondary }}>{intern.company}</p>
                  </div>
                  <span className="text-sm" style={{ color: template.colors.secondary }}>
                    {intern.startDate} - {intern.endDate}
                  </span>
                </div>
                {intern.description && (
                  <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: template.colors.secondary }}>{intern.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {safeEducation.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Education
            </h2>
            {safeEducation.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: template.colors.primary }}>{edu.degree}</h3>
                    <p style={{ color: template.colors.secondary }}>{edu.institution}</p>
                    {(edu.cgpa || edu.percentage) && (
                      <p className="text-sm" style={{ color: template.colors.secondary }}>
                        {edu.cgpa && `CGPA: ${edu.cgpa}`}
                        {edu.cgpa && edu.percentage && ' | '}
                        {edu.percentage && `Percentage: ${edu.percentage}%`}
                      </p>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: template.colors.secondary }}>
                    {edu.graduationDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {safeProjects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Projects
            </h2>
            {safeProjects.map((proj, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold" style={{ color: template.colors.primary }}>{proj.name}</h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline px-3 py-1 rounded-full font-medium transition"
                      style={{
                        color: template.colors.accent,
                        backgroundColor: `${template.colors.accent}15`
                      }}
                    >
                      {proj.linkName || 'View Project'}
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: template.colors.secondary }}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills with visual levels */}
        {safeSkills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {safeSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: `${template.colors.accent}20`, color: template.colors.accent }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {safeCertifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Certifications
            </h2>
            {safeCertifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold" style={{ color: template.colors.primary }}>{cert.name}</h3>
                  <span className="text-sm" style={{ color: template.colors.secondary }}>{cert.date}</span>
                </div>
                <p className="text-sm" style={{ color: template.colors.secondary }}>{cert.issuer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {safeLanguages.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Languages
            </h2>
            {safeLanguages.map((lang, index) => (
              <p key={index} className="text-sm" style={{ color: template.colors.secondary }}>
                {lang.name}: {lang.proficiency}
              </p>
            ))}
          </div>
        )}

        {/* Achievements */}
        {safeAchievements.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Achievements & Awards
            </h2>
            {safeAchievements.map((achievement, index) => (
              <p key={index} className="text-sm" style={{ color: template.colors.secondary }}>
                {achievement.title} {achievement.date && `(${achievement.date})`}
              </p>
            ))}
          </div>
        )}

        {/* Volunteer Experience */}
        {safeVolunteer.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              Volunteer Experience
            </h2>
            {safeVolunteer.map((vol, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: template.colors.primary }}>{vol.role}</h3>
                    <p style={{ color: template.colors.secondary }}>{vol.organization}</p>
                  </div>
                  <span className="text-sm" style={{ color: template.colors.secondary }}>
                    {vol.startDate} - {vol.endDate}
                  </span>
                </div>
                {vol.description && (
                  <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: template.colors.secondary }}>{vol.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {safeReferences.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold border-b pb-1 mb-2" style={{ color: template.colors.primary }}>
              References
            </h2>
            {safeReferences.map((ref, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold" style={{ color: template.colors.primary }}>{ref.name}</p>
                <p className="text-sm" style={{ color: template.colors.secondary }}>{ref.position}, {ref.company}</p>
                <p className="text-sm" style={{ color: template.colors.secondary }}>{ref.email} | {ref.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold">Resume Builder</h1>
              {autoSaveStatus && (
                <p className={`text-sm mt-1 ${autoSaveStatus === 'Saved' ? 'text-green-600' : 'text-gray-500'}`}>
                  {autoSaveStatus}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <FaUndo size={14} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <FaRedo size={14} />
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                <FaPalette size={14} />
                Templates
              </button>
              <button
                onClick={handleDuplicateResume}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                <FaCopy size={14} />
                Duplicate
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleParseResume}
                accept=".pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <FaUpload size={14} />
                {parsing ? 'Parsing...' : 'Upload PDF'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <FaSave size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <FaDownload size={14} />
                {generating ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={handleAnalyzeAts}
                disabled={analyzingAts}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                <FaChartLine size={14} />
                {analyzingAts ? 'Analyzing...' : 'ATS Score'}
              </button>
              <button
                onClick={handleGenerateAiSuggestions}
                disabled={analyzingAI}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
              >
                <FaLightbulb size={14} />
                {analyzingAI ? 'Generating...' : 'AI Suggestions'}
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 overflow-hidden"
              >
                <h3 className="font-semibold mb-4">Choose Template</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setResume({ ...resume, template: template.id });
                        setShowTemplates(false);
                      }}
                      className={`p-4 rounded-xl border-2 transition hover:shadow-md relative ${
                        resume.template === template.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {template.bigTech && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded font-medium">
                          Big Tech
                        </div>
                      )}
                      {!template.atsFriendly && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-medium">
                          Not ATS
                        </div>
                      )}
                      <div
                        className="h-16 rounded mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${template.colors.primary}20, ${template.colors.accent}20)`,
                          borderLeft: `3px solid ${template.colors.accent}`
                        }}
                      />
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.description}</p>
                      {template.atsFriendly && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <FaCheck size={10} /> ATS Friendly
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Saved Resumes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4">My Resumes</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setResume(initialResume);
                    setSelectedResume(null);
                    localStorage.removeItem('currentResume');
                  }}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition ${
                    !selectedResume ? 'bg-green-50 text-green-600 border border-green-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaPlus size={14} />
                  <span className="text-sm">New Resume</span>
                </button>

                {resumes.map((r) => (
                  <div
                    key={r._id}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition cursor-pointer ${
                      selectedResume === r._id ? 'bg-green-50 text-green-600 border border-green-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      onClick={() => handleLoadResume(r._id)}
                      className="text-sm truncate flex-1"
                    >
                      {r.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(r._id);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content - Resume Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Personal Information"
                      icon={<FaFileAlt className="text-green-500" />}
                    />

                    {/* Photo Upload */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          <FaUpload />
                          Choose Photo
                        </button>
                        {resume.personalInfo.photo && (
                          <button
                            onClick={() => setResume({
                              ...resume,
                              personalInfo: { ...resume.personalInfo, photo: '' }
                            })}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {resume.personalInfo.photo && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Photo Style</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="photoStyle"
                                value="square"
                                checked={resume.personalInfo.photoStyle === 'square'}
                                onChange={() => handlePersonalInfoChange('photoStyle', 'square')}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm">Square</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="photoStyle"
                                value="circle"
                                checked={resume.personalInfo.photoStyle === 'circle'}
                                onChange={() => handlePersonalInfoChange('photoStyle', 'circle')}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm">Circle</span>
                            </label>
                          </div>
                          <div className="mt-2">
                            <img
                              src={resume.personalInfo.photo}
                              alt="Preview"
                              className={`w-24 h-24 object-cover border-2 border-gray-300 ${
                                resume.personalInfo.photoStyle === 'circle' ? 'rounded-full' : 'rounded'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Full Name"
                        value={resume.personalInfo.fullName}
                        onChange={(v) => handlePersonalInfoChange('fullName', v)}
                        placeholder="John Doe"
                        required
                        icon={<FaUserAstronaut />}
                      />
                      <InputField
                        label="Email"
                        type="email"
                        value={resume.personalInfo.email}
                        onChange={(v) => handlePersonalInfoChange('email', v)}
                        placeholder="john@example.com"
                        error={validationErrors.email}
                        required
                        icon={<FaEnvelope />}
                      />
                      <InputField
                        label="Phone"
                        type="tel"
                        value={resume.personalInfo.phone}
                        onChange={(v) => handlePersonalInfoChange('phone', v)}
                        placeholder="+1 234 567 8900"
                        error={validationErrors.phone}
                        icon={<FaPhone />}
                      />
                      <InputField
                        label="Location"
                        value={resume.personalInfo.location}
                        onChange={(v) => handlePersonalInfoChange('location', v)}
                        placeholder="New York, USA"
                        icon={<FaMapMarkerAlt />}
                      />
                      <InputField
                        label="LinkedIn"
                        type="url"
                        value={resume.personalInfo.linkedin}
                        onChange={(v) => handlePersonalInfoChange('linkedin', v)}
                        placeholder="https://linkedin.com/in/johndoe"
                        error={validationErrors.linkedin}
                        icon={<FaLinkedin />}
                      />
                      <InputField
                        label="Portfolio"
                        type="url"
                        value={resume.personalInfo.portfolio}
                        onChange={(v) => handlePersonalInfoChange('portfolio', v)}
                        placeholder="https://johndoe.com"
                        error={validationErrors.portfolio}
                        icon={<FaGlobe />}
                      />
                      <InputField
                        label="GitHub"
                        type="url"
                        value={resume.personalInfo.github}
                        onChange={(v) => handlePersonalInfoChange('github', v)}
                        placeholder="https://github.com/johndoe"
                        error={validationErrors.github}
                        icon={<FaGithub />}
                      />
                    </div>
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Professional Summary"
                      icon={<FaMagic className="text-green-500" />}
                    />
                    <TextAreaWithCount
                      value={resume.professionalSummary}
                      onChange={(v) => setResume({ ...resume, professionalSummary: v })}
                      placeholder="Write a brief professional summary highlighting your key skills, experience, and career goals..."
                      maxLength={1000}
                      rows={6}
                      label="Professional Summary"
                    />
                    <ActionVerbSuggestions
                      onSelect={(verb) => {
                        setResume({
                          ...resume,
                          professionalSummary: resume.professionalSummary + (resume.professionalSummary ? ' ' : '') + verb + ' '
                        });
                      }}
                    />
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <FaInfoCircle className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-700">
                        Tip: Keep your summary concise (2-4 sentences). Focus on your unique value proposition and key achievements.
                      </p>
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Work Experience"
                      icon={<FaBriefcase className="text-green-500" />}
                      onAdd={() => handleAddItem('workExperience')}
                    />

                    {safeWorkExperience.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaBriefcase size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No work experience added yet</p>
                        <button
                          onClick={() => handleAddItem('workExperience')}
                          className="mt-2 text-green-600 hover:underline"
                        >
                          Add your first experience
                        </button>
                      </div>
                    )}

                    {safeWorkExperience.map((exp, index) => (
                      <CollapsibleSection
                        key={index}
                        title={exp.position || exp.company || `Experience ${index + 1}`}
                        badge={exp.current ? 'Current' : null}
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InputField
                              label="Company"
                              value={exp.company || ''}
                              onChange={(v) => handleItemChange('workExperience', index, 'company', v)}
                              placeholder="Company Name"
                            />
                            <InputField
                              label="Position"
                              value={exp.position || ''}
                              onChange={(v) => handleItemChange('workExperience', index, 'position', v)}
                              placeholder="Job Title"
                            />
                            <InputField
                              label="Start Date"
                              value={exp.startDate || ''}
                              onChange={(v) => handleItemChange('workExperience', index, 'startDate', v)}
                              placeholder="e.g., Jan 2020"
                            />
                            <InputField
                              label="End Date"
                              value={exp.endDate || ''}
                              onChange={(v) => handleItemChange('workExperience', index, 'endDate', v)}
                              placeholder="e.g., Present"
                              disabled={exp.current}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current || false}
                              onChange={(e) => handleItemChange('workExperience', index, 'current', e.target.checked)}
                              id={`current-work-${index}`}
                              className="w-4 h-4 text-green-600 rounded"
                            />
                            <label htmlFor={`current-work-${index}`} className="text-sm text-gray-600">
                              Currently working here
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={exp.description || ''}
                              onChange={(e) => handleItemChange('workExperience', index, 'description', e.target.value)}
                              onKeyDown={(e) => handleBulletPointKeyDown(e, exp.description || '', (val) => handleItemChange('workExperience', index, 'description', val))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                              placeholder="Describe your responsibilities and achievements. Press Enter for bullet points."
                            />
                            <ActionVerbSuggestions
                              onSelect={(verb) => {
                                const current = exp.description || '';
                                handleItemChange('workExperience', index, 'description', current + (current ? '\n' : '') + verb + ' ');
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem('workExperience', index)}
                            className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                          >
                            <FaTrash size={12} /> Remove
                          </button>
                        </div>
                      </CollapsibleSection>
                    ))}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Education"
                      icon={<FaGraduationCap className="text-green-500" />}
                      onAdd={() => handleAddItem('education')}
                    />

                    {safeEducation.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaGraduationCap size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No education added yet</p>
                      </div>
                    )}

                    {safeEducation.map((edu, index) => (
                      <CollapsibleSection
                        key={index}
                        title={edu.degree || edu.institution || `Education ${index + 1}`}
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InputField
                              label="Institution"
                              value={edu.institution || ''}
                              onChange={(v) => handleItemChange('education', index, 'institution', v)}
                              placeholder="University/College Name"
                            />
                            <InputField
                              label="Degree"
                              value={edu.degree || ''}
                              onChange={(v) => handleItemChange('education', index, 'degree', v)}
                              placeholder="e.g., Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InputField
                              label="CGPA"
                              value={edu.cgpa || ''}
                              onChange={(v) => handleItemChange('education', index, 'cgpa', v)}
                              placeholder="e.g., 8.5"
                            />
                            <InputField
                              label="Percentage"
                              value={edu.percentage || ''}
                              onChange={(v) => handleItemChange('education', index, 'percentage', v)}
                              placeholder="e.g., 85"
                            />
                            <InputField
                              label="Graduation Date"
                              value={edu.graduationDate || ''}
                              onChange={(v) => handleItemChange('education', index, 'graduationDate', v)}
                              placeholder="e.g., Jun 2023"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem('education', index)}
                            className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                          >
                            <FaTrash size={12} /> Remove
                          </button>
                        </div>
                      </CollapsibleSection>
                    ))}
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Projects"
                      icon={<FaProjectDiagram className="text-green-500" />}
                      onAdd={() => handleAddItem('projects')}
                    />

                    {safeProjects.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaProjectDiagram size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No projects added yet</p>
                      </div>
                    )}

                    {safeProjects.map((proj, index) => (
                      <CollapsibleSection
                        key={index}
                        title={proj.name || `Project ${index + 1}`}
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InputField
                              label="Project Name"
                              value={proj.name || ''}
                              onChange={(v) => handleItemChange('projects', index, 'name', v)}
                              placeholder="Project Name"
                            />
                            <InputField
                              label="Link Display Name"
                              value={proj.linkName || ''}
                              onChange={(v) => handleItemChange('projects', index, 'linkName', v)}
                              placeholder="e.g., GitHub, Live Demo, Case Study"
                            />
                          </div>
                          <div>
                            <InputField
                              label="Project URL"
                              type="url"
                              value={proj.link || ''}
                              onChange={(v) => handleItemChange('projects', index, 'link', v)}
                              placeholder="https://github.com/..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the full URL - it will open when clicking the "{proj.linkName || 'Link'}" button
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={proj.description || ''}
                              onChange={(e) => handleItemChange('projects', index, 'description', e.target.value)}
                              onKeyDown={(e) => handleBulletPointKeyDown(e, proj.description || '', (val) => handleItemChange('projects', index, 'description', val))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                              placeholder="Describe the project, your role, and technologies used. Press Enter for bullet points."
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem('projects', index)}
                            className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                          >
                            <FaTrash size={12} /> Remove
                          </button>
                        </div>
                      </CollapsibleSection>
                    ))}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Skills"
                      icon={<FaTools className="text-green-500" />}
                    />

                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setShowSkillSelector(!showSkillSelector)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        <FaPlus size={12} />
                        Add Skills
                      </button>
                      {safeSkills.length > 0 && (
                        <span className="text-sm text-gray-500">{safeSkills.length} skills added</span>
                      )}
                    </div>

                    {/* Skill Category Selector */}
                    <AnimatePresence>
                      {showSkillSelector && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-4 bg-gray-50 rounded-xl mb-4"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">Select Skills by Category</h4>
                            <button
                              onClick={() => { setShowSkillSelector(false); setSelectedCategory(null); }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <FaTimes />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.keys(SKILL_CATEGORIES).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                className={`px-3 py-1.5 rounded-full text-sm transition ${
                                  selectedCategory === cat
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {selectedCategory && (
                            <div className="flex flex-wrap gap-2">
                              {SKILL_CATEGORIES[selectedCategory].map((skill) => {
                                const isAdded = safeSkills.includes(skill);
                                return (
                                  <button
                                    key={skill}
                                    onClick={() => !isAdded && handleAddSkill(skill)}
                                    disabled={isAdded}
                                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                                      isAdded
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-white border border-gray-300 hover:border-green-500 hover:text-green-600'
                                    }`}
                                  >
                                    {isAdded && <FaCheck className="inline mr-1 text-xs" />}
                                    {skill}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Or add custom skills (comma separated)
                            </label>
                            <input
                              type="text"
                              placeholder="Type skills and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                  skills.forEach(skill => handleAddSkill(skill));
                                  e.target.value = '';
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Display added skills */}
                    {safeSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {safeSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {skill}
                            <button
                              onClick={() => {
                                const newSkills = safeSkills.filter((_, i) => i !== index);
                                setResume({ ...resume, skills: newSkills });
                              }}
                              className="hover:text-red-500 transition"
                            >
                              <FaTimes size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* More Section (Certifications, Languages, Achievements, etc.) */}
                {activeTab === 'more' && (
                  <div className="space-y-4">
                    {/* Certifications */}
                    <div>
                      <SectionHeader
                        title="Certifications"
                        icon={<FaCertificate className="text-green-500" />}
                        onAdd={() => handleAddItem('certifications')}
                      />
                      {safeCertifications.map((cert, index) => (
                        <CollapsibleSection key={index} title={cert.name || `Certification ${index + 1}`}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <InputField
                                label="Certification Name"
                                value={cert.name || ''}
                                onChange={(v) => handleItemChange('certifications', index, 'name', v)}
                                placeholder="e.g., AWS Certified Developer"
                              />
                              <InputField
                                label="Issuing Organization"
                                value={cert.issuer || ''}
                                onChange={(v) => handleItemChange('certifications', index, 'issuer', v)}
                                placeholder="e.g., Amazon Web Services"
                              />
                              <InputField
                                label="Date"
                                value={cert.date || ''}
                                onChange={(v) => handleItemChange('certifications', index, 'date', v)}
                                placeholder="e.g., Jan 2024"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveItem('certifications', index)}
                              className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                            >
                              <FaTrash size={12} /> Remove
                            </button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>

                    {/* Languages */}
                    <div>
                      <SectionHeader
                        title="Languages"
                        icon={<FaLanguage className="text-green-500" />}
                        onAdd={() => handleAddItem('languages')}
                      />
                      {safeLanguages.map((lang, index) => (
                        <CollapsibleSection key={index} title={lang.name || `Language ${index + 1}`}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <InputField
                                label="Language"
                                value={lang.name || ''}
                                onChange={(v) => handleItemChange('languages', index, 'name', v)}
                                placeholder="e.g., English"
                              />
                              <InputField
                                label="Proficiency"
                                value={lang.proficiency || ''}
                                onChange={(v) => handleItemChange('languages', index, 'proficiency', v)}
                                placeholder="e.g., Native, Fluent, Intermediate"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveItem('languages', index)}
                              className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                            >
                              <FaTrash size={12} /> Remove
                            </button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>

                    {/* Achievements */}
                    <div>
                      <SectionHeader
                        title="Achievements & Awards"
                        icon={<FaAward className="text-green-500" />}
                        onAdd={() => handleAddItem('achievements')}
                      />
                      {safeAchievements.map((achievement, index) => (
                        <CollapsibleSection key={index} title={achievement.title || `Achievement ${index + 1}`}>
                          <div className="space-y-3">
                            <InputField
                              label="Achievement Title"
                              value={achievement.title || ''}
                              onChange={(v) => handleItemChange('achievements', index, 'title', v)}
                              placeholder="e.g., Best Paper Award"
                            />
                            <InputField
                              label="Date"
                              value={achievement.date || ''}
                              onChange={(v) => handleItemChange('achievements', index, 'date', v)}
                              placeholder="e.g., 2024"
                            />
                            <button
                              onClick={() => handleRemoveItem('achievements', index)}
                              className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                            >
                              <FaTrash size={12} /> Remove
                            </button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>

                    {/* Volunteer Experience */}
                    <div>
                      <SectionHeader
                        title="Volunteer Experience"
                        icon={<FaHeart className="text-green-500" />}
                        onAdd={() => handleAddItem('volunteerExperience')}
                      />
                      {safeVolunteer.map((vol, index) => (
                        <CollapsibleSection key={index} title={vol.role || vol.organization || `Volunteer ${index + 1}`}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <InputField
                                label="Role"
                                value={vol.role || ''}
                                onChange={(v) => handleItemChange('volunteerExperience', index, 'role', v)}
                                placeholder="e.g., Volunteer Teacher"
                              />
                              <InputField
                                label="Organization"
                                value={vol.organization || ''}
                                onChange={(v) => handleItemChange('volunteerExperience', index, 'organization', v)}
                                placeholder="Organization Name"
                              />
                              <InputField
                                label="Start Date"
                                value={vol.startDate || ''}
                                onChange={(v) => handleItemChange('volunteerExperience', index, 'startDate', v)}
                                placeholder="e.g., Jan 2023"
                              />
                              <InputField
                                label="End Date"
                                value={vol.endDate || ''}
                                onChange={(v) => handleItemChange('volunteerExperience', index, 'endDate', v)}
                                placeholder="e.g., Present"
                              />
                            </div>
                            <TextAreaWithCount
                              value={vol.description || ''}
                              onChange={(v) => handleItemChange('volunteerExperience', index, 'description', v)}
                              placeholder="Describe your volunteer work..."
                              maxLength={500}
                              rows={3}
                            />
                            <button
                              onClick={() => handleRemoveItem('volunteerExperience', index)}
                              className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                            >
                              <FaTrash size={12} /> Remove
                            </button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>

                    {/* References */}
                    <div>
                      <SectionHeader
                        title="References"
                        icon={<FaBook className="text-green-500" />}
                        onAdd={() => handleAddItem('references')}
                      />
                      <p className="text-sm text-gray-500 mb-3">
                        Optional: Include references or write "Available upon request"
                      </p>
                      {safeReferences.map((ref, index) => (
                        <CollapsibleSection key={index} title={ref.name || `Reference ${index + 1}`}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <InputField
                                label="Name"
                                value={ref.name || ''}
                                onChange={(v) => handleItemChange('references', index, 'name', v)}
                                placeholder="Reference Name"
                              />
                              <InputField
                                label="Position"
                                value={ref.position || ''}
                                onChange={(v) => handleItemChange('references', index, 'position', v)}
                                placeholder="e.g., Senior Manager"
                              />
                              <InputField
                                label="Company"
                                value={ref.company || ''}
                                onChange={(v) => handleItemChange('references', index, 'company', v)}
                                placeholder="Company Name"
                              />
                              <InputField
                                label="Email"
                                type="email"
                                value={ref.email || ''}
                                onChange={(v) => handleItemChange('references', index, 'email', v)}
                                placeholder="email@example.com"
                              />
                              <InputField
                                label="Phone"
                                type="tel"
                                value={ref.phone || ''}
                                onChange={(v) => handleItemChange('references', index, 'phone', v)}
                                placeholder="+1 234 567 8900"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveItem('references', index)}
                              className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                            >
                              <FaTrash size={12} /> Remove
                            </button>
                          </div>
                        </CollapsibleSection>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Preview Section */}
          {(safePersonalInfo.fullName || resume.professionalSummary || safeSkills.length > 0) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Live Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <FaEye size={14} />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-200 p-4 rounded-lg overflow-auto"
                  >
                    <ResumePreview />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ATS Score Modal */}
      {showAtsModal && atsScore && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-emerald-50 bg-opacity-95 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaChartLine className="text-orange-500" />
                  ATS Score Analysis
                </h2>
                <button
                  onClick={() => setShowAtsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Score Display */}
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={atsScore.score >= 80 ? '#22c55e' : atsScore.score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(atsScore.score / 100) * 440} 440`}
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="absolute">
                    <span className={`text-4xl font-bold ${
                      atsScore.score >= 80 ? 'text-green-500' : atsScore.score >= 60 ? 'text-orange-500' : 'text-red-500'
                    }`}>{atsScore.score}</span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>
                <p className="mt-4 text-lg font-medium">
                  {atsScore.score >= 80 ? 'Excellent! Big Tech Ready' : atsScore.score >= 60 ? 'Good, but needs improvement' : 'Needs significant work'}
                </p>
                {atsScore.keywordDensity && (
                  <p className="text-sm text-gray-500 mt-1">
                    Keyword Density: {atsScore.keywordDensity}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Section Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(atsScore.breakdown).map(([section, status]) => (
                    <div
                      key={section}
                      className={`p-3 rounded-lg text-center ${
                        status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <p className="text-xs capitalize">{section}</p>
                      <p className="font-semibold text-sm">{status}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {atsScore.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaTimes className="text-red-500" />
                    Issues ({atsScore.issues.length})
                  </h3>
                  <div className="space-y-2">
                    {atsScore.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg flex items-start gap-2 ${
                          issue.severity === 'high' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-orange-50 border-l-4 border-orange-500'
                        }`}
                      >
                        <span className="text-sm">
                          <strong>{issue.section}:</strong> {issue.issue}
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            issue.severity === 'high' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'
                          }`}>{issue.severity}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {atsScore.suggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaLightbulb className="text-yellow-500" />
                    Suggestions ({atsScore.suggestions.length})
                  </h3>
                  <div className="space-y-2">
                    {atsScore.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500"
                      >
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAtsModal(false)}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showSuggestionsModal && aiSuggestions.length > 0 && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-purple-50 bg-opacity-95 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaLightbulb className="text-purple-500" />
                  AI Suggestions
                </h2>
                <button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {aiSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-l-4 ${
                      suggestion.type === 'ats' ? 'border-orange-500 bg-orange-50' :
                      suggestion.priority === 'high' ? 'border-red-500 bg-red-50' :
                      suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs rounded font-medium bg-white bg-opacity-50">
                            {suggestion.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            suggestion.priority === 'high' ? 'bg-red-200 text-red-700' :
                            suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                            'bg-blue-200 text-blue-700'
                          }`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-700">{suggestion.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                ))}
              </div>

              {aiSuggestions.length === 0 && (
                <div className="text-center py-8">
                  <FaCheck className="text-green-500 text-6xl mx-auto mb-4" />
                  <p className="text-lg font-medium">Your resume looks great!</p>
                  <p className="text-gray-500 mt-2">No major improvements suggested.</p>
                </div>
              )}

              <button
                onClick={() => setShowSuggestionsModal(false)}
                className="w-full mt-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilder;
