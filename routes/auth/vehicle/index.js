// routes/auth.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../../../models/vehicleSchema');
const User = require('../../../models/userchema');

router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has a vehicleId associated
    if (!user.vehicleId) {
      return res.status(404).json({ error: 'No vehicle registered for this user' });
    }

    // Find the vehicle by the user's vehicleId
    const vehicle = await Vehicle.findById(user.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/add-vehicle', async (req, res) => {
  try {
    const { userId, type, model, licensePlate, vehicleName } = req.query;

    if (!userId || !type || !model || !licensePlate, !vehicleName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let vehicle = await Vehicle.findOne({ _id: userId });

    if (vehicle) {
      // Update existing vehicle
      vehicle.type = type;
      vehicle.model = model;
      vehicle.vehicleName = vehicleName;
      vehicle.licensePlate = licensePlate;
      await vehicle.save();
    } else {
      // Create new vehicle
      vehicle = new Vehicle({ type, model, licensePlate, vehicleName });
      await vehicle.save();
    }

    // Update user with the vehicle ID
    await User.findByIdAndUpdate(userId, { vehicleId: vehicle._id });

    res.status(200).json({ message: 'Vehicle details saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
