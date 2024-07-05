const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a sub-document schema for request details
const requestDetailsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemDescription: { type: String, required: true },
  requestDateTime: { type: Date, required: true },
  proposedPrice: { type: Number },
  status: { type: String, enum: ['pending', 'waiting for customer response', 'accepted', 'rejected', 'reached to customer and fixing the issue'], default: 'pending' },
  reachedToMechanic: { type: Boolean, default: false },
  paymentStatus: { type: Boolean, default: false }
});

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['user', 'mechanic', 'driver'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: false
  },
  expertise: String,
  experience: String,
  contactNumber: String,
  otherInfo: String,
  latitude: Number,
  longitude: Number,
  address: String,  
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  requestedBy: {
    type: [requestDetailsSchema],
    default: []
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;