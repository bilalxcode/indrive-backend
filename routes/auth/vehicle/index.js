// routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../../../models/vehicleSchema'); // Adjust the path as necessary


router.post('/add-vehicle', async (req, res) => {
    try {
      const { type, model, licensePlate } = req.query;
      console.log(type,model,licensePlate)
      const vehicle = new Vehicle({ type, model, licensePlate });
      console.log("vehicle object:", vehicle);
      await vehicle.save();
      console.log("vehicle added", vehicle);
      res.status(200).send({ message: 'Vehicle added successfully!' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

module.exports = router;
