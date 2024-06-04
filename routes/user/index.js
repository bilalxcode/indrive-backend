const express = require('express');
const router = express.Router();
const User = require('../../models/userchema'); 

// Toggle user active status

router.post('/toggle-active', async (req, res) => {
    console.log("reached")
    try {
      const { userId } = req.body;
      console.log("user id",userId)
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      user.active = !user.active;
      await user.save();
      
      res.status(200).send({ message: `You are now ${user.active ? 'online' : 'offline'}` });
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

module.exports = router;
