// models/client.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const clientSchema = new Schema(
  {
    name: { type: String, },
    email: { type: String, lowercase: true, unique: true },
    mobile: { type: String, },
    password: { type: String, }, // ⚠️ Hash in production
    confirmPassword: { type: String, }, // ⚠️ Hash in production
    companyName: { type: String },
    profileImage: { type: String }, // URL or file path
    address: {
      country: String,
      city: String,
      postalCode: String,
    },
    bio: { type: String },
    website: { type: String },
    termsAndConditionsAgreed: { type: Boolean, default: false },
    myProjects: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Project'
}],
myInvoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model('Client', clientSchema);

export default Client;
