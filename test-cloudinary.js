require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🧪 Testing Cloudinary Connection...\n');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📋 Configuration:');
console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key);
console.log('API Secret:', cloudinary.config().api_secret ? '✓ Set' : '✗ Not Set');
console.log('\n');

// Test connection
async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to Cloudinary...\n');
    
    const result = await cloudinary.api.ping();
    
    console.log('✅ SUCCESS! Connection to Cloudinary is working!');
    console.log('Response:', result);
    
    // Try to get usage stats
    try {
      const usage = await cloudinary.api.usage();
      console.log('\n📊 Account Usage:');
      console.log('Plan:', usage.plan);
      console.log('Storage:', (usage.storage.usage / 1024 / 1024).toFixed(2), 'MB');
      console.log('Bandwidth:', (usage.bandwidth.usage / 1024 / 1024).toFixed(2), 'MB');
      console.log('Credits Used:', usage.credits.usage);
    } catch (usageError) {
      console.log('\n⚠️  Could not fetch usage stats (this is normal for new accounts)');
    }
    
  } catch (error) {
    console.error('❌ FAILED! Could not connect to Cloudinary');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Check your credentials are correct');
    console.error('2. Check your internet connection');
    console.error('3. Check Cloudinary account is active');
  }
}

testConnection();