import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    title: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer'
    },
    client: {
      name: { type: String },
      company: { type: String },
      email: { type: String },
      phone: { type: String },
      date: { type: Date }
    },
    overview: { type: String },
    scopeOfWork: [{ type: String }],
    timeline: {
      start: { type: Date },
      end: { type: Date }
    },
    total: { type: Number },
    termsAndConditions: [{ type: String }],
    actions: [{ type: String }],
    footerButtons: [{ type: String }]
  },
  {
    timestamps: true
  }
);

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
