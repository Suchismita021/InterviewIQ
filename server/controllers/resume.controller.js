import Resume from "../models/resume.model.js";
import { askAi } from "../services/openRouter.service.js";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `You are an expert ATS resume parser. Extract all information from the resume and return ONLY valid JSON.

Extract these fields:
{
  "personalInfo": {
    "fullName": "name or null",
    "email": "email or null",
    "phone": "phone or null",
    "location": "location or null",
    "linkedin": "linkedin URL or null",
    "github": "github URL or null",
    "portfolio": "portfolio URL or null"
  },
  "professionalSummary": "2-3 sentence summary or empty string",
  "workExperience": [
    {
      "company": "company name",
      "position": "job title",
      "startDate": "start date (e.g. Jan 2020)",
      "endDate": "end date or 'Present'",
      "current": true/false,
      "description": "job description with bullet points"
    }
  ],
  "education": [
    {
      "institution": "university/college name",
      "degree": "degree type",
      "field": "field of study",
      "startDate": "start date",
      "endDate": "end date",
      "gpa": "gpa if available"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "project description",
      "technologies": ["tech1", "tech2"],
      "link": "project URL or null",
      "github": "github URL or null"
    }
  ],
  "skills": [
    { "name": "skill name", "level": "intermediate/advanced/beginner" }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained"
    }
  ]
}

Return ONLY JSON, no other text.`
      },
      {
        role: "user",
        content: resumeText
      }
    ];

    const aiResponse = await askAi(messages);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ message: 'Failed to parse resume content. Please enter information manually.' });
    }

    // Transform skills to object format if they're strings
    if (parsed.skills && Array.isArray(parsed.skills)) {
      parsed.skills = parsed.skills.map(skill => {
        if (typeof skill === 'string') {
          return { name: skill, level: 'intermediate' };
        }
        return skill;
      });
    }

    fs.unlinkSync(filepath);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message });
  }
};

export const improveContent = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({ message: "Content and type required" });
    }

    let systemPrompt = "";

    switch (type) {
      case "summary":
        systemPrompt = `You are a professional resume writer. Improve the following professional summary. Make it impactful, concise (3-4 sentences), and ATS-friendly. Use action verbs and quantify achievements where possible.`;
        break;
      case "experience":
        systemPrompt = `You are a professional resume writer. Improve the following job description. Use bullet points, action verbs, and quantify achievements. Make it ATS-friendly with relevant keywords.`;
        break;
      case "project":
        systemPrompt = `You are a professional resume writer. Improve the following project description. Make it impactful, highlight technologies used, and quantify outcomes if possible. Keep it concise.`;
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: content }
    ];

    const improved = await askAi(messages);
    res.json({ improved });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const { experience, skills, role } = req.body;

    const messages = [
      {
        role: "system",
        content: `You are a professional resume writer. Generate a compelling professional summary for a ${role} with ${experience} of experience. Skills: ${skills}. Make it 3-4 sentences, impactful, and ATS-friendly.`
      },
      {
        role: "user",
        content: `Generate a professional summary for a ${role} professional with experience in ${skills}`
      }
    ];

    const summary = await askAi(messages);
    res.json({ summary });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .select("-__v");

    res.json(resumes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      ...req.body,
      userId: req.userId
    });

    res.status(201).json(resume);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const duplicateResume = async (req, res) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, userId: req.userId });

    if (!original) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const duplicate = await Resume.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      userId: req.userId,
      createdAt: undefined,
      updatedAt: undefined
    });

    res.status(201).json(duplicate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

