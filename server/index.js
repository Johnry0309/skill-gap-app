import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://skill-gap-app-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🍃 Connected to MongoDB Database'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const researchSchema = new mongoose.Schema({
  city: { type: String, required: true, lowercase: true, trim: true, unique: true },
  lastChecked: { type: Date, default: Date.now },
  summary: String,
  comparisonData: Array,
  institutions: Array,
  courseDetails: Array,
  schools: [
    {
      name: String,
      type: String,
      graduatesCount: Number,
      courses: [String],
      website: String,
    }
  ],
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

async function generateContentWithRetry(aiClient, baseParams, retries = 3, initialDelay = 2000) {
  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ];

  for (let attempt = 0; attempt < retries; attempt++) {
    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Attempting generation with model: ${modelName}...`);
        return await aiClient.models.generateContent({
          ...baseParams,
          model: modelName,
        });
      } catch (error) {
        const status = error.status || error.code || (error.error && error.error.code);

        if (status === 503 || status === 429) {
          console.warn(`⚠️ ${modelName} returned status${status} (High Demand/Rate Limit). Trying next fallback...`);
          continue;
        }

        if (status === 404) {
          console.warn(`⚠️ ${modelName} is unavailable (404). Skipping...`);
          continue;
        }

        throw error;
      }
    }

    const delay = initialDelay * Math.pow(2, attempt);
    console.warn(`⚠️ All model fallbacks busy. Retrying full loop in ${delay / 1000}s... (Attempt ${attempt + 1}/${retries})`);
    await new Promise((res) => setTimeout(res, delay));
  }

  throw new Error('All Gemini models are currently experiencing high traffic. Please try again in a few moments.');
}

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

app.get('/api/research', async (req, res, next) => {
  const { city, refresh } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required' });
  }

  const normalizedCity = city.toLowerCase().trim();

  try {
    const existingRecord = await Research.findOne({ city: normalizedCity });

    if (existingRecord && refresh !== 'true') {
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

CRITICAL GROUNDING RULES:
1. Base your report strictly on real local entities, universities, and job titles found in or near ${normalizedCity} from the search data.
2. Avoid generic placeholder titles like "Regional Technical Institute" or "City Tech Solutions" unless supported by search results.

Synthesize this data into a structured skill discrepancy report for ${normalizedCity}.
Strictly return a valid JSON object matching this exact structure:

{
  "summary": "Executive summary (4-5 sentences) describing the labor market skill discrepancy in ${normalizedCity}.",
  "comparisonData": [
    { "skill": "Skill Name", "demand": 85, "supply": 40 }
  ],
  "institutions": [
    { "name": "Real Institution Name", "focus": "Primary program focus or university department specialization" }
  ],
  "courseDetails": [
    { "title": "Program or Skill Area", "mismatchNote": "Note on curriculum alignment or gap with industry standards" }
  ],
  "schools": [
    {
      "name": "Exact Name of Local Higher Education Institution",
      "type": "State University / Private Institution / Vocational Tech",
      "graduatesCount": 500,
      "courses": ["BS Information Technology", "BS Business Administration"],
      "website": "https://official-institution-url.edu.ph"
    }
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

Note: Provide up to 5 key local higher education institutions inside "schools" and up to 10 job openings inside "jobListings".
Do not include markdown code block backticks (\`\`\`json) in your response, return raw JSON string only.
`;

    console.log(`🤖 Generating AI Skill Gap analysis via Gemini...`);

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const parsedData = JSON.parse(rawText);

    // 1. Defensively convert stringified schools back into a real JavaScript Array
    let safeSchools = [];
    if (typeof parsedData.schools === 'string') {
      try {
        safeSchools = JSON.parse(parsedData.schools);
      } catch (e) {
        console.warn('⚠️ Could not parse schools string JSON:', e.message);
        safeSchools = [];
      }
    } else if (Array.isArray(parsedData.schools)) {
      safeSchools = parsedData.schools;
    }

    // 2. Ensure sub-properties (e.g. courses array, graduatesCount number) are properly typed
    safeSchools = safeSchools.map(school => {
      let parsedCourses = school.courses;
      if (typeof parsedCourses === 'string') {
        try {
          parsedCourses = JSON.parse(parsedCourses);
        } catch (e) {
          parsedCourses = [parsedCourses];
        }
      }
      return {
        name: school.name || '',
        type: school.type || '',
        graduatesCount: Number(school.graduatesCount) || 0,
        courses: Array.isArray(parsedCourses) ? parsedCourses : [],
        website: school.website || ''
      };
    });

    const MAX_JOBS = 10;
    const limitedJobListings = Array.isArray(parsedData.jobListings)
      ? parsedData.jobListings.slice(0, MAX_JOBS)
      : [];

    const updatedRecord = await Research.findOneAndUpdate(
      { city: normalizedCity },
      {
        city: normalizedCity,
        lastChecked: new Date(),
        summary: parsedData.summary,
        comparisonData: parsedData.comparisonData,
        institutions: parsedData.institutions,
        courseDetails: parsedData.courseDetails,
        schools: safeSchools,
        jobListings: limitedJobListings,
        interpretation: parsedData.interpretation,
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    console.log(`✅ Research successfully processed and saved to database for "${normalizedCity}"`);

    return res.json({
      source: 'live',
      data: updatedRecord,
    });

  } catch (error) {
    next(error);
  }
});

app.delete('/api/research', async (req, res, next) => {
  const { city, all } = req.query;

  try {
    if (all === 'true') {
      const result = await Research.deleteMany({});
      return res.json({ message: 'All city caches cleared successfully.', deletedCount: result.deletedCount });
    }

    if (!city) {
      return res.status(400).json({ error: 'Please provide a "city" parameter or "all=true".' });
    }

    const normalizedCity = city.toLowerCase().trim();
    const result = await Research.deleteOne({ city: normalizedCity });

    return res.json({ message: `Cache for "${normalizedCity}" cleared successfully.`, deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

app.post('/api/assessment', async (req, res, next) => {
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

    const response = await generateContentWithRetry(ai, {
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
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('🔥 Server Error Catch:', err.message);

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message || 'An unexpected backend error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SkillGap API server running on port ${PORT}`);
});