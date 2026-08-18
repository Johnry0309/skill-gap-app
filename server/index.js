import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import NodeCache from 'node-cache';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cache entries for 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400 });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function searchWeb(query) {
  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: 'basic',
      max_results: 5,
    });
    return response.data.results;
  } catch (error) {
    console.error('Tavily Search Error:', error.message);
    return [];
  }
}

app.get('/api/research', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required' });
  }

  const cacheKey = `research_${city.toLowerCase().trim()}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    console.log(`⚡ Serving cached data for ${city}`);
    return res.json(cachedResult);
  }

  try {
    console.log(`🤖 AI searching live data for ${city}...`);

    const searchResults = await searchWeb(
      `top universities colleges schools in demand jobs labor market gap course offerings graduates ${city}`
    );

    const prompt = `
    You are an expert labor analyst. Analyze these web search results for ${city}:
    ${JSON.stringify(searchResults)}

    Synthesize the information and respond strictly with a valid JSON object matching this schema:
    {
      "summary": "1-2 sentence overview of the skill discrepancy between top demanded jobs vs produced graduates in ${city}.",
      "comparisonData": [
        {"field": "Industry Name (e.g., IT & Tech)", "jobsNeeded": 400, "graduates": 150}
      ],
      "institutions": [
        {
          "name": "School or University Name",
          "category": "Public / Private / Vocational",
          "courses": ["Course 1", "Course 2"],
          "graduates": 1200,
          "strategicFocus": "Brief focus description"
        }
      ],
      "courseDetails": [
        {"field": "Degree/Course Name", "graduates": 150, "gradRate": "85%", "passingRate": "75% or N/A"}
      ],
      "interpretation": "Write a 1-2 paragraph detailed analysis interpreting the educational institution data, graduate output volume, skill alignment with local labor market demand, and strategic economic recommendations for local planners in ${city}."
    }
    List the educational institutions in order of prominence/importance in ${city}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const structuredData = JSON.parse(response.text);
    cache.set(cacheKey, structuredData);
    res.json(structuredData);

  } catch (err) {
    console.error('Error conducting AI research:', err.message);
    
    if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ 
        error: 'API Rate limit exceeded. Please wait a minute before querying another municipality.' 
      });
    }

    res.status(500).json({ error: 'Failed to process AI web research', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});