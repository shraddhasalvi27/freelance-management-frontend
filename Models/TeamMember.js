import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },

  role: {
    type: String,
    required: true,
    default: 'Other',
  },

  projects: {
    type: [String], // array of project names or IDs
    default: [],
  },
  assignedProjects: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Project'
}],

  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Hold'],
    default: 'Active',
  },

  bio: {
    type: String,
    trim: true,
  },

  profileImage: {
    type: String, // URL or file path
  },

  mobile: {
    type: String,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // optional reference
  },
}, {
  timestamps: true,
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
