const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../../models/userchema");
const secretKey = "realStateSecretKey";

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user with the provided email exists
    const user = await User.findOne({ email });
console.log("loged in")
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare the password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: '1h', // Token expiration time (e.g., 1 hour)
    });

    // Return the user object and token in the response
    console.log("loged in")

    res.status(200).json({
        
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};

module.exports = loginUser;
