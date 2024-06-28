const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DriverRequestSchema = new Schema({
  pickUp: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true
  },
  driverId: { 
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false
  },
  price: { 
    type: Number,
    default: 0 
  },
  accepted: { type: Boolean, default: false },
  newPriceProposed: { type: Number, default: null },
  days: { type: Number, required: true },
  cashPaid: { type: Boolean, default: false } // Add this field
});

const DriverRequest = mongoose.model('DriverRequest', DriverRequestSchema);
module.exports = DriverRequest;