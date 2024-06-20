const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const signUpRoutes = require("./routes/auth/signup");
const loginRoutes = require("./routes/auth/login");
const vehicleRoutes = require("./routes/auth/vehicle")
const userRoutes = require("./routes/user");

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
    const { userId, driverId, price, status, pickUp, destination } = req.body;

    const newDriverRequest = new DriverRequest({
      userId,
      driverId,
      price,
      status,
      pickUp,
      destination,
    });

    await newDriverRequest.save();
    console.log("data saved successfully!")
    res.status(201).json({ message: 'Driver request accepted and saved successfully.' });
  } catch (error) {
    console.error('Error accepting ride:', error);
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
