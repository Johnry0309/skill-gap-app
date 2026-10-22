import mongoose from 'mongoose';

const ResearchSchema = new mongoose.Schema({
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

export default mongoose.models.Research || mongoose.model('Research', ResearchSchema);