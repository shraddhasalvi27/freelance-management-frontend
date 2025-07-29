// models/freelancer.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const freelancerSchema = new Schema(
  {
    name: { type: String, },
    gender: { type: String },
    email: { type: String, lowercase: true, unique: true },
    mobile: { type: String },
    profileImage: { type: String }, // Path to the uploaded profile image
    skills: [{ type: String }], // Array of skill strings
    hourlyRate: { type: Number, min: 0 },
    bio: { type: String },
    experience: { type: Number, min: 0 }, // Years of experience
    location: { type: String },
    availability: { type: String }, // e.g., "Full-time", "Part-time"
    portfolioLinks: [{ type: String }],
    termsAndConditionsAgreed: { type: Boolean },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User
      myClients: [
      {
        clientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Client', // Assuming you have a Client model
        },
        name: {
          type: String,
        },
        company: {
          type: String,
        },
        email: {
          type: String,
        },
        phone: {
          type: String,
        }
      }
    ],
      name: { type: String },
  position: { type: String },
  experience: { type: String },
  location: { type: String },
  linkedin: { type: String },
  github: { type: String },
  twitter: { type: String },
  profileImage: { type: String },

  // Simple Arrays
  skills: [{ type: String }],
  services: [{ type: String }],

  // Testimonials as array of objects
  testimonials: [
    {
      name: { type: String },
      position: { type: String },
      opinion: { type: String },
    },
  ],

  // About Section
  about: {
    heading: { type: String },
    description: { type: String },
    image: { type: String },
    mission: { type: String },
    vision: { type: String },
    experienceYears: { type: String },
    completedProjects: { type: String },
    happyClients: { type: String },
    teamMembers: { type: String },
  },

  // FAQs
  faq: [
    {
      question: { type: String },
      answer: { type: String },
    },
  ],

  // Latest Work
  latestWork: [
    {
      image: { type: String },
      link: { type: String },
    },
  ],
   myInvoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
    profileImage: {
    type: String,
    default: '', // Optional
  },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const Freelancer = mongoose.model('Freelancer', freelancerSchema);

export default Freelancer;
