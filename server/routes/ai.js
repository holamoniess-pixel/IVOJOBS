const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini (if key exists)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY');

// ---------------------------------------------------------
// SIMPLIFIED KNOWLEDGE BASE AI (Local)
// ---------------------------------------------------------

const KNOWLEDGE_BASE = [
    {
        keywords: ['find talent', 'search worker', 'hire', 'find professional', 'looking for employee'],
        response: "To find talent, please visit the 'Find Talent' section (#workers) on our home page. You can use the search bar to filter professionals by skill or location."
    },
    {
        keywords: ['post job', 'create job', 'hiring', 'new job', 'vacancy'],
        response: "You can post a new job opening by filling out the form in the 'Post Jobs' section (#job-form). Make sure to include all relevant details to attract the best candidates."
    },
    {
        keywords: ['about', 'what is ivo', 'mission', 'platform info'],
        response: "IVO is a professional network and job board designed to connect skilled individuals with opportunities. We aim to make hiring and job hunting seamless."
    },
    {
        keywords: ['contact', 'email', 'support', 'help'],
        response: "You can reach our support team via email at support@ivojobs.com or use the contact form on our main website."
    },
    {
        keywords: ['register', 'sign up', 'create account', 'join'],
        response: "Click the 'Sign Up' button in the top right corner to create a new account. You can register as a professional or a recruiter."
    },
    {
        keywords: ['login', 'sign in', 'log in'],
        response: "Click the 'Log In' button in the top right corner to access your account."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hello! I am the IVO Assistant. How can I help you today? I can assist with navigation, finding talent, or posting jobs."
    }
];

function findBestMatch(query) {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();
    
    let bestMatch = null;
    let maxScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (lowerQuery.includes(keyword)) {
                score += 1;
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = entry;
        }
    }

    return maxScore > 0 ? bestMatch.response : null;
}

// ---------------------------------------------------------
// ROUTE
// ---------------------------------------------------------

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        // 1. Try Local Knowledge Base First (Fast & Free)
        const localResponse = findBestMatch(message);
        if (localResponse) {
            return res.json({ response: localResponse, source: 'local' });
        }

        // 2. Fallback to Gemini AI (if configured)
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && !apiKey.startsWith('your_')) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: "You are the IVO Assistant. Be concise and helpful." }] },
                        { role: "model", parts: [{ text: "Understood." }] },
                        ...(history || [])
                    ]
                });
                const result = await chat.sendMessage(message);
                const response = await result.response;
                return res.json({ response: response.text(), source: 'gemini' });
            } catch (aiError) {
                console.error("Gemini AI Error:", aiError);
                // Fall through to default response
            }
        }

        // 3. Default Fallback
        res.json({ 
            response: "I'm not sure about that. I can help you find talent, post jobs, or navigate the site. Try asking 'How do I post a job?' or 'Where can I find workers?'",
            source: 'fallback'
        });

    } catch (error) {
        console.error('AI Route Error:', error);
        res.status(500).json({ message: 'The AI assistant is temporarily unavailable.' });
    }
});

module.exports = router;