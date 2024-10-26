const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  // Retrieve the token from the Authorization header
  const authHeader = req.header('Authorization');
  
  // Check if the token is present
  if (!authHeader) return res.status(401).json({ error: 'Access denied' });

  // Split the header to extract the token
  const token = authHeader.split(' ')[1];

  try {
    // Debugging logs to check the token and secret
    console.log("Token:", token);
    console.log("Secret:", process.env.JWT_SECRET);
    
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Store the decoded user information in the request object
    req.user = decoded;
    
    // Move to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error); // Log the error for debugging
    res.status(400).json({ error: 'Invalid token' });
  }
};
