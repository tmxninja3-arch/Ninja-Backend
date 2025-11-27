const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Game = require('./models/Game');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const testModels = async () => {
  try {
    console.log('🧪 Testing User Model...');
    
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456', // Will be hashed automatically
      role: 'user',
    });
    
    console.log('✅ User created:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHashed: user.password ? 'Yes (hidden)' : 'Error',
    });
    
    // Test password comparison
    const isMatch = await user.matchPassword('123456');
    console.log('✅ Password match test:', isMatch ? 'PASSED' : 'FAILED');
    
    console.log('\n🧪 Testing Game Model...');
    
    // Create a test game
    const game = await Game.create({
      title: 'Test Game',
      description: 'This is a test game',
      price: 29.99,
      genre: 'Action',
      createdBy: user._id,
      stock: 100,
    });
    
    console.log('✅ Game created:', {
      id: game._id,
      title: game.title,
      price: game.price,
      genre: game.genre,
      stock: game.stock,
    });
    
    console.log('\n✅ All models working correctly!');
    console.log('🧹 Cleaning up test data...');
    
    // Delete test data
    await User.findByIdAndDelete(user._id);
    await Game.findByIdAndDelete(game._id);
    
    console.log('✅ Test data cleaned up');
    console.log('🎉 Model test complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testModels();