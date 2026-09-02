import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🍃 Connected to MongoDB Database'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. Define Mongoose Schema & Model (Monthly Pseudo-Cache)
const researchSchema = new mongoose.Schema({
  city: { type: String, required: true, lowercase: true, trim: true, unique: true },
  lastChecked: { type: Date, default: Date.now },
  summary: String,
  comparisonData: Array,
  institutions: Array,
  courseDetails: Array,
  jobListings: [
    {
      title: String,
      company: String,
      applyLink: String,
      requiredSkills: [String],
    }
  ],
  interpretation: String,
});

const Research = mongoose.model('Research', researchSchema);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Tavily Web Search
async function searchWeb(query) {
  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: 'basic',
      max_results: 5,
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Tavily Search Error:', error.message);
    return [];
  }
}

// 3. Research Route with 30-Day Pseudo-Caching
app.get('/api/research', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required' });
  }

  const normalizedCity = city.toLowerCase().trim();

  try {
    // Check for cached record in MongoDB
    const existingRecord = await Research.findOne({ city: normalizedCity });

    if (existingRecord) {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const age = Date.now() - new Date(existingRecord.lastChecked).getTime();

      if (age < thirtyDaysInMs) {
        console.log(`⚡ Returning cached research data for "${normalizedCity}"`);
        return res.json({
          source: 'cache',
          data: existingRecord,
        });
      } else {
        console.log(`⏳ Cache expired for "${normalizedCity}". Refreshing market research...`);
      }
    }

    console.log(`🔍 Fetching live web search results for "${normalizedCity}"...`);

    const jobResults = await searchWeb(`top hiring job openings and required skills in ${normalizedCity}`);
    const eduResults = await searchWeb(`universities colleges graduate programs and skill output in ${normalizedCity}`);

    const contextText = JSON.stringify({
      jobSearch: jobResults,
      eduSearch: eduResults,
    });

    const prompt = `
You are an economic intelligence & labor market analyst. Analyze the following web search data regarding current workforce demands, employer skill requirements, and graduate skill outputs in ${normalizedCity}.

Search Data:
${contextText}

Synthesize this data into a structured skill discrepancy report for ${normalizedCity}.
Strictly return a valid JSON object matching this exact structure:

{
  "summary": "Executive summary (4-5 sentences) describing the labor market skill discrepancy in ${normalizedCity}.",
  "comparisonData": [
    { "skill": "Skill Name", "demand": 85, "supply": 40 }
  ],
  "institutions": [
    { "name": "Institution Name", "focus": "Primary program focus or university department specialization" }
  ],
  "courseDetails": [
    { "title": "Program or Skill Area", "mismatchNote": "Note on curriculum alignment or gap with industry standards" }
  ],
  "jobListings": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "applyLink": "URL link from search result or empty string if unavailable",
      "requiredSkills": ["Skill 1", "Skill 2"]
    }
  ],
  "interpretation": "Detailed strategic policy recommendations for municipal leaders and academic institutions."
}

Note: Provide exactly up to 10 distinct job openings inside the "jobListings" array.
Do not include markdown code block backticks (\`\`\`json) in your response, return raw JSON string only.
`;

    console.log(`🤖 Generating AI Skill Gap analysis via Gemini...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const parsedData = JSON.parse(rawText);

    // Limit array count to exactly 5
    const MAX_JOBS = 10;
    const limitedJobListings = Array.isArray(parsedData.jobListings)
      ? parsedData.jobListings.slice(0, MAX_JOBS)
      : [];

    // Save/Update in MongoDB Atlas
    const updatedRecord = await Research.findOneAndUpdate(
      { city: normalizedCity },
      {
        city: normalizedCity,
        lastChecked: new Date(),
        summary: parsedData.summary,
        comparisonData: parsedData.comparisonData,
        institutions: parsedData.institutions,
        courseDetails: parsedData.courseDetails,
        jobListings: limitedJobListings,
        interpretation: parsedData.interpretation,
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`✅ Research successfully generated and saved to database for "${normalizedCity}"`);

    return res.json({
      source: 'live',
      data: updatedRecord,
    });

  } catch (error) {
    console.error('Error during research query processing:', error);
    return res.status(500).json({
      error: 'An error occurred while generating labor market research.',
      details: error.message,
    });
  }
});

// 4. Assessment / Quiz Generation Route
app.post('/api/assessment', async (req, res) => {
  const { jobTitle, requiredSkills } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ error: 'Job title is required' });
  }

  try {
    console.log(`📝 Generating Skill Verification Assessment for: ${jobTitle}...`);

    const prompt = `
You are a technical recruiter creating a skill assessment for candidate verification.
Target Role: ${jobTitle}
Key Skills to Evaluate: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : 'General Role Knowledge'}

Generate a 10-question multiple choice technical screening quiz.
Strictly return a valid JSON object matching this exact structure:

{
  "role": "${jobTitle}",
  "questions": [
    {
      "id": 1,
      "question": "Clear technical question evaluating a core skill",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0
    }
  ]
}

Do not include markdown code block backticks (\`\`\`json) in your response, return raw JSON string only.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const quizData = JSON.parse(rawText);

    return res.json(quizData);

  } catch (error) {
    console.error('Error generating assessment:', error);
    return res.status(500).json({
      error: 'Failed to generate skill assessment',
      details: error.message,
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 SkillGap API server running on port ${PORT}`);
});