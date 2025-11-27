const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gamestore.com' });
    
    if (adminExists) {
      console.log('  Admin user already exists!');
      console.log(' Email:', adminExists.email);
      console.log(' Name:', adminExists.name);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'ram@gmail.com',
      password: '123456',
      role: 'admin',
    });

    console.log(' Admin user created successfully!');
  
    console.log(' Email:', admin.email);
    console.log(' Password: 123456');
    console.log(' Name:', admin.name);
    console.log('  Role:', admin.role);
  
    console.log('  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

createAdmin();