const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String }
}, { _id: false });

const FixtureSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  homeTeam: { type: TeamSchema, required: true },
  awayTeam: { type: TeamSchema, required: true },
  competition: { type: String },
  status: { type: String, enum: ['upcoming', 'completed', 'postponed'], default: 'upcoming' },
  result: {
    homeScore: { type: Number },
    awayScore: { type: Number },
    status: { type: String }
  },
  tickets: {
    available: { type: Boolean, default: false },
    url: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Fixture', FixtureSchema);