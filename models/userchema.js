const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
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
  expertise: {
    type: String,
  },
  experience: {
    type: String, // You can adjust this according to your needs (e.g., Number for years)
  },
  contactNumber: {
    type: String,
  }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
