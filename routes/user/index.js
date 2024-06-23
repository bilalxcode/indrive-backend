const express = require('express');
const router = express.Router();
const User = require('../../models/userchema'); 

router.post('/toggle-active', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.active = !user.active;
    if (user.active) {
      user.latitude = latitude;
      user.longitude = longitude;
    } else {
      user.latitude = null;
      user.longitude = null;
    }

    await user.save();
    
    res.status(200).send({ message: `You are now ${user.active ? 'online' : 'offline'}`, user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/active-drivers', async (req, res) => {
  try {
    const activeDrivers = await User.find({ active: true }).populate('vehicleId');
    res.status(200).json(activeDrivers);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send({ active: user.active, latitude: user.latitude, longitude: user.longitude });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

  
router.post('/add-mechanic', async (req, res) => {
    console.log("reached")
    try {
      const { userId, name, expertise, experience, contactNumber } = req.query;
      // Find the user by userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }


      user.name = name;
        user.expertise = expertise;
        user.experience = experience;
        user.contactNumber = contactNumber;
        user.userType = 'mechanic';
        await user.save();
  
        res.status(200).send({ message: 'Mechanic added successfully!' });
      
    } catch (error) {
      console.error('Error adding mechanic:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });

  router.get('/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Request received with ", userId)
  
      const user = await User.findById(userId).lean(); 
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  router.put('/save-phone-number', async (req, res) => {
    console.log("request recieved")
    const { userId, contactNumber } = req.body;
  console.log(contactNumber)
    try {
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the contact number
      user.contactNumber = contactNumber;
      
      // Save the updated user
      await user.save();
  
      // Respond with the updated user data
      res.json(user);
    } catch (error) {
      console.error('Error updating contact number:', error);
      res.status(500).json({ error: 'Failed to update contact number' });
    }
  });

  
  router.put('/save-other-info', async (req, res) => {
    console.log("request recieved")
    const { userId, otherInfo } = req.body;
  console.log(otherInfo)
    try {
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the contact number
      user.otherInfo = otherInfo;
      
      // Save the updated user
      await user.save();
      console.log(user)
  
      // Respond with the updated user data
      res.json(user);
    } catch (error) {
      console.error('Error updating contact number:', error);
      res.status(500).json({ error: 'Failed to update contact number' });
    }
  });
  
module.exports = router;
