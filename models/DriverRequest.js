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
});

const DriverRequest = mongoose.model('DriverRequest', DriverRequestSchema); // Use a different name for the model constant
module.exports = DriverRequest;
