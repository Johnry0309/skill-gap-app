import mongoose from 'mongoose';

const ResearchSchema = new mongoose.Schema({
  city: { type: String, required: true, lowercase: true, trim: true, unique: true },
  lastChecked: { type: Date, default: Date.now },
  summary: String,
  comparisonData: Array,
  institutions: Array,
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

export default mongoose.model('Research', ResearchSchema);