const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  latitude: Number,
  longitude: Number,
  address: String,  
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
