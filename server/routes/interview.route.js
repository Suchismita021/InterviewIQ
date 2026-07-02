import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume, deleteInterview, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js"
import { askAi } from "../services/openRouter.service.js"




const interviewRouter = express.Router()

interviewRouter.post("/resume",isAuth,upload.single("resume"),analyzeResume)
interviewRouter.post("/generate-questions",isAuth,generateQuestion)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)
interviewRouter.post("/chat",isAuth, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message is required" });
        }

        const messages = [
            {
                role: "system",
                content: `You are a helpful AI Interview Assistant for InterviewIQ, an AI-powered interview preparation platform.

Your role is to help users with:
- Interview preparation tips and strategies
- Resume writing advice
- Career guidance
- Answering common interview questions
- Mock interview practice via text
- Technical and behavioral interview tips

Guidelines:
- Be professional, friendly, and encouraging
- Provide practical, actionable advice
- Keep responses concise but informative (50-150 words)
- Use bullet points when listing tips
- If asked about topics unrelated to interviews/careers, politely redirect
- Never mention that you are an AI or refer to internal systems
- Always maintain a positive and supportive tone`
            },
            {
                role: "user",
                content: message
            }
        ];

        const response = await askAi(messages);

        res.json({ response });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Failed to get response from AI" });
    }
})

interviewRouter.get("/get-interview",isAuth,getMyInterviews)
interviewRouter.get("/report/:id",isAuth,getInterviewReport)
interviewRouter.delete("/delete/:id",isAuth,deleteInterview)



export default interviewRouter