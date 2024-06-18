const express = require('express');
const router = express.Router();
const Vehicle = require('../../../models/vehicleSchema'); 
const User = require('../../../models/userchema'); 

router.post('/add-vehicle', async (req, res) => {
  try {
    const { type, model, licensePlate, userId } = req.query;
    const vehicle = new Vehicle({ type, model, licensePlate });
    await vehicle.save();

    // Update the user with the vehicleId
    await User.findByIdAndUpdate(userId, { vehicleId: vehicle._id });

    res.status(200).send({ message: 'Vehicle added successfully!' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;