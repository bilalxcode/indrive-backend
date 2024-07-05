const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const signUpRoutes = require("./routes/auth/signup");
const loginRoutes = require("./routes/auth/login");
const vehicleRoutes = require("./routes/auth/vehicle")
const userRoutes = require("./routes/user");
const User = require('./models/userchema'); 
const axios = require('axios');

const app = express();

// * Database connection
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db connected!");
});

// * Cors
app.use(cors());

// * Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("short"));

const DriverRequest = require('./models/DriverRequest'); 

app.use('/signup', signUpRoutes);
app.use('/login', loginRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/user', userRoutes);

app.post('/DriverRequest', async (req, res) => {
  try {
    const { userId, driverId, status, pickUp, destination, days } = req.body;

    const pricePerDay = 1000; // Example price per day, change as needed
    const price = days * pricePerDay;

    const newDriverRequest = new DriverRequest({
      userId,
      driverId,
      price,
      status,
      pickUp,
      destination,
      days, // Include the number of days
    });

    await newDriverRequest.save();
    console.log("Data saved successfully!");
    res.status(201).json({ message: 'Driver request accepted and saved successfully.', price });
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/updateCashPaidStatus', async (req, res) => {
  try {
    const { userId, driverId } = req.body; // Assuming you pass userId and driverId in the request body

    if (!userId || !driverId) {
      return res.status(400).send({ message: 'UserId and DriverId are required' });
    }

    const driverRequest = await DriverRequest.findOne({ userId, driverId });

    if (!driverRequest) {
      return res.status(404).send({ message: 'Driver request not found' });
    }

    driverRequest.cashPaid = true;
    await driverRequest.save();

    res.status(200).send({ message: 'Cash Paid status updated successfully' });
  } catch (error) {
    console.error('Error updating cash paid status:', error);
    res.status(500).send({ message: 'Error updating cash paid status' });
  }
});

app.put('/bookingRequest/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { cashPaid } = req.body;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).send({ error: 'Booking not found' });
    }

    booking.cashPaid = cashPaid;
    await booking.save();

    res.send({ success: true });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/bookingRequests/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const requests = await DriverRequest.find({ driverId }).lean();
    
    const userIds = requests.map(request => request.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    
    const requestsWithUserDetails = requests.map(request => {
      const user = users.find(user => user._id.toString() === request.userId.toString());
      return { ...request, user };
    });
    
    res.status(200).json(requestsWithUserDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bookingRequest/status/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const booking = await DriverRequest.findOne({ driverId, accepted: true });

    if (!booking) {
      return res.status(404).json({ accepted: false });
    }

    res.status(200).json({ accepted: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/bookingRequest/:id', async (req, res) => {
  const { id } = req.params;
  const { status, price } = req.body;

  try {
    const booking = await DriverRequest.findById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    if (status === 'accepted') {
      booking.accepted = true;
      booking.status = false;
    } else if (status === 'rejected') {
      booking.accepted = false;
      booking.status = false;
    } else if (status === 'price_proposed') {
      booking.newPriceProposed = price;
    }

    await booking.save();
    res.status(200).json({ message: `Booking ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Error updating booking request: ' + error.message });
  }
});

app.post('/toggle-active', async (req, res) => {
  try {
    console.log("received")
    const { userId, address, latitude, longitude } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.active = !user.active;
    if (user.active) {
      user.address = address;
      user.latitude = latitude;
      user.longitude = longitude;
    } else {
      user.address = null;
      user.latitude = null;
      user.longitude = null;
    }

    await user.save();
    
    res.status(200).send({ message: `You are now ${user.active ? 'online' : 'offline'}`, user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/user/:userId/location', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const { latitude, longitude } = user;
    res.status(200).json({ latitude, longitude });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});


app.get('/locations/:userId/:driverId', async (req, res) => {
  const { userId, driverId } = req.params;

  try {
    const user = await User.findById(userId);
    const driver = await User.findById(driverId);

    if (!user || !driver) {
      return res.status(404).json({ error: 'User or Driver not found' });
    }

    res.status(200).json({
      userLocation: { lat: user.latitude, lng: user.longitude },
      driverLocation: { lat: driver.latitude, lng: driver.longitude },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/user-location', async (req, res) => {
  try {
    const { userId, address, latitude, longitude } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.address = address;
    user.latitude = latitude;
    user.longitude = longitude;

    await user.save();
    
    res.status(200).send({ message: 'Location data saved successfully.', user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


app.post('/checkRequest', async (req, res) => {
  const { userId, driverId } = req.body;

  try {
    const requestExists = await DriverRequest.findOne({ userId, driverId });
    if (requestExists) {
      return res.status(200).json({ requestExists: true });
    }
    res.status(200).json({ requestExists: false });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.post('/getSentRequests', async (req, res) => {
  const { userId } = req.body;
  console.log(userId);

  try {
    const sentRequests = await DriverRequest.find({ userId, status: true })
      .populate({
        path: 'driverId',
        model: 'User',
        populate: {
          path: 'vehicleId',
          model: 'Vehicle'
        }
      });

    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/save-location', async (req, res) => {
  const { userId, location } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { latitude: location.lat, longitude: location.lng });
    res.status(200).json({ message: 'Location saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving location' });
  }
});

app.get('/active-mechanics', async (req, res) => {
  try {
    const activeMechanics = await User.find({ userType: 'mechanic', active: true });
    res.status(200).json(activeMechanics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching active mechanics' });
  }
});
app.post('/submit-request', async (req, res) => {
  const { userId, mechanicId, problemDescription, requestDateTime } = req.body;
  try {
    // Find the mechanic by ID
    const mechanic = await User.findById(mechanicId);

    if (!mechanic) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    // Create a request object containing the details
    const requestDetails = {
      userId,
      problemDescription,
      requestDateTime
    };

    // Add the request details to the mechanic's requestedBy array
    mechanic.requestedBy.push(requestDetails);

    // Save the mechanic with the updated requestedBy field
    await mechanic.save();

    res.status(200).json({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/mechanic/request/:requestId/accept', async (req, res) => {
  try {
      const { requestId } = req.params;
      const user = await User.findOne({ "requestedBy._id": requestId });
      if (!user) {
          return res.status(404).send({ error: 'Request not found' });
      }

      const request = user.requestedBy.id(requestId);
      request.status = 'accepted';

      await user.save();
      res.status(200).send({ message: 'Request accepted successfully' });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

app.put('/mechanic/request/:requestId/reject', async (req, res) => {
  try {
      const { requestId } = req.params;
      const user = await User.findOne({ "requestedBy._id": requestId });
      if (!user) {
          return res.status(404).send({ error: 'Request not found' });
      }

      const request = user.requestedBy.id(requestId);
      request.status = 'rejected';

      await user.save();
      res.status(200).send({ message: 'Request rejected successfully' });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

app.get('/mechanic/request/:mechanicId/:userId', async (req, res) => {
  const { mechanicId, userId } = req.params;

  try {
      const mechanic = await User.findById(mechanicId);

      if (!mechanic) {
          return res.status(404).json({ error: 'Mechanic not found' });
      }

      const request = mechanic.requestedBy.find(req => req.userId.toString() === userId);

      if (!request) {
          return res.status(404).json({ error: 'Request not found' });
      }

      res.status(200).json({ requestId: request._id });
  } catch (error) {
      console.error('Error fetching request ID:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.put('/mechanic/request/:requestId/:id/reached', async (req, res) => {
  try {
    const { requestId, id } = req.params;
    console.log("Mechanic ID:", id);
    const user = await User.findById(id);
    console.log("User:", user);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const request = user.requestedBy.id(requestId);
    console.log("Request:", request);

    if (!request) {
      return res.status(404).send({ error: 'Request not found' });
    }

    request.reachedToMechanic = true;
    request.status = 'reached to customer and fixing the issue';
    console.log("Updated Request:", request);

    await user.save();
    res.status(200).send({ message: 'Reached status updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/request/:requestId/payment-status', async (req, res) => {
  const { requestId } = req.params;

  try {
    const user = await User.findOne({ "requestedBy._id": requestId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the specific request within the user's requests
    const requestIndex = user.requestedBy.findIndex(request => request._id.toString() === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Remove the request from the user's requestedBy array
    user.requestedBy.splice(requestIndex, 1);
    
    // Save the updated user document
    await user.save();
    
    res.status(200).json({ message: 'Payment received and request removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/mechanic/request/:requestId/confirm-payment', async (req, res) => {
  const { requestId } = req.params;
  console.log(requestId);

  try {
    const user = await User.findOne({ "requestedBy._id": requestId });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const request = user.requestedBy.id(requestId);
      request.paymentStatus = true; 
      await user.save();

      res.status(200).json({ message: 'Payment confirmed' });
  } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/mechanic/request/:requestId', async (req, res) => {
  try {
      const { requestId } = req.params;
      const user = await User.findOne({ "requestedBy._id": requestId }).populate('requestedBy.userId');
      if (!user) {
          return res.status(404).send({ error: 'Request not found' });
      }

      const request = user.requestedBy.id(requestId);
      res.status(200).send({
          mechanicName: user.name,
          mechanicEmail: user.email,
          proposedPrice: request.proposedPrice,
          status: request.status
      });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

app.post('/mechanic/propose-price', async (req, res) => {
  const { requestId, proposedPrice } = req.body;

  try {
    const user = await User.findOne({ "requestedBy._id": requestId });
    if (!user) {
      return res.status(404).send({ error: 'Request not found' });
    }

    const request = user.requestedBy.id(requestId);
    request.proposedPrice = proposedPrice;
    request.status = 'waiting for customer response';

    await user.save();

    res.status(200).send({ message: 'Price proposed successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


app.get('/user/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get active mechanic requests with user details
app.get('/mechanic/requests/:mechanicId', async (req, res) => {
  try {
      const mechanicId = req.params.mechanicId;
      const mechanic = await User.findById(mechanicId).populate('requestedBy.userId');
      if (!mechanic) {
          return res.status(404).json({ error: 'Mechanic not found' });
      }
      res.json(mechanic.requestedBy);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



app.get("/", (req, res) => {
  console.log("hello");
  res.send("hello");
});

app.use("*", (req, res) => {
  res.send("Route not found");
});

let PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
