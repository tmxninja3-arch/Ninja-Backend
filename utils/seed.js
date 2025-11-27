const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Game = require('../models/Game');
const Order = require('../models/Order');
const gamesData = require('../data/gamesData'); // ← Add this

dotenv.config();
connectDB();

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@gamestore.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    role: 'user',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456',
    role: 'user',
  },
];

// Import data
const importData = async () => {
  try {
    console.log('🗑️  Deleting existing data...');
    
    await Order.deleteMany();
    await Game.deleteMany();
    await User.deleteMany();

    console.log('✅ Old data deleted');
    console.log('📝 Creating new users...');

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    console.log(`✅ ${createdUsers.length} users created`);
    console.log('🎮 Creating games...');

    // Add admin ID to all games
    const sampleGames = gamesData.map((game) => {
      return { ...game, createdBy: adminUser };
    });

    // Create games
    await Game.insertMany(sampleGames);

    console.log(`✅ ${sampleGames.length} games created`); // Should show 50
    console.log('\n=====================================');
    console.log('🎉 DATA IMPORTED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email: admin@gamestore.com');
    console.log('   Password: admin123');
    console.log('\n📧 Test User Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: 123456');
    console.log('\n🎮 Total Games:', sampleGames.length);
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    console.log('🗑️  Deleting all data...');

    await Order.deleteMany();
    await Game.deleteMany();
    await User.deleteMany();

    console.log('✅ All data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}