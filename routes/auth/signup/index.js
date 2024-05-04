const bcrypt = require("bcryptjs");
const User=require("../../../models/userchema")

const signUpUser = async (req, res) => {
  const { name, email, password, confirmPassword,userType } = req.body;
  // Validate request body
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Please fill out all required fields.' });
  }

  // Validate password criteria
  if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain a special character.',
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  
  try {

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType: userType, // Default user type, you can modify this based on your requirement
    });

    await newUser.save();
    return res.status(201).json({ message: 'User signed up successfully.' });
  } catch (error) {
    console.error("Error adding new User:", error);
    return res.status(500).json({ error: 'Error adding new User.' });
  }
};

module.exports = signUpUser;
