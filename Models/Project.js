// models/project.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: { type: String, },
    description: { type: String,},
    category: { type: String }, // e.g., Web Development, Graphic Design, etc.
    budget:
      { type: String, },
    deadline: { type: Date },
    attachments: [{ type: String }], // Array of file paths or URLs

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Client' if using separate model
    },

    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      default: null,
    },

    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },

    proposals: [
      {
        freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
        coverLetter: { type: String },
        proposedBudget: { type: Number },
        submittedAt: { type: Date, default: Date.now },
      },
    ],

    completionDetails: {
      submittedByFreelancer: { type: Boolean, default: false },
      approvedByClient: { type: Boolean, default: false },
      submittedAt: { type: Date },
      completedAt: { type: Date },
    },

    clientReview: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
      givenAt: { type: Date },
    },

    freelancerReview: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
      givenAt: { type: Date },
    },
    progress: {
      type: Number,
      default: 0
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    }],
   association: [
  {
    contributorName: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
],

activity: [
  {
    action: String,
    by: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
],
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
