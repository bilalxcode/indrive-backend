const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the vehicle schema
const vehicleSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  licensePlate: {
    type: String,
    required: true
  },
  vehicleName: {  // Add this field
    type: String,
    required: true
  }
});

// Create a model based on the schema
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;