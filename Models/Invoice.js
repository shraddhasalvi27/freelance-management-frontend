import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  invoiceNumber: {
    type: String,
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      description: String,
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  subTotal: {
    type: Number,
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number
  },
  grandTotal: {
    type: Number,
  },
  paymentMethod: {
    bankName: String,
    accountNumber: String
  },
  terms: {
    type: String
  }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
