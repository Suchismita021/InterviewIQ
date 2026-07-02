import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    default: "My Resume"
  },
  template: {
    type: String,
    enum: ["modern", "classic", "technical", "creative"],
    default: "modern"
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String,
    github: String,
    website: String
  },
  professionalSummary: {
    type: String,
    default: ""
  },
  workExperience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    github: String
  }],
  skills: [{
    name: String,
    level: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }]
}, { timestamps: true });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;

