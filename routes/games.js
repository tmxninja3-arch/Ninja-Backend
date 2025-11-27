const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// ============================================
// @route   GET /api/games
// @desc    Get all games
// @access  Public
// ============================================
router.get('/', async (req, res) => {
  try {
    // Get all games and populate creator info
    const games = await Game.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error('Get Games Error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching games',
      error: error.message 
    });
  }
});

// ============================================
// @route   GET /api/games/:id
// @desc    Get single game by ID
// @access  Public
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    res.json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error('Get Game Error:', error);
    
    // Handle invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ============================================
// @route   POST /api/games
// @desc    Create new game
// @access  Private/Admin
// ============================================
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      genre,
      image,
      downloadURL,
      stock,
      platform,
      rating,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !genre) {
      return res.status(400).json({ 
        message: 'Please provide title, description, price, and genre' 
      });
    }

    // Create game
    const game = await Game.create({
      title,
      description,
      price,
      genre,
      image,
      downloadURL,
      stock,
      platform,
      rating,
      createdBy: req.user._id, // Admin who is creating the game
    });

    // Populate creator info
    await game.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: game,
    });
  } catch (error) {
    console.error('Create Game Error:', error);
    res.status(500).json({ 
      message: 'Server error while creating game',
      error: error.message 
    });
  }
});

// ============================================
// @route   PUT /api/games/:id
// @desc    Update game
// @access  Private/Admin
// ============================================
router.put('/:id', protect, admin, async (req, res) => {
  try {
    let game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    // Update game
    game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Game updated successfully',
      data: game,
    });
  } catch (error) {
    console.error('Update Game Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.status(500).json({ 
      message: 'Server error while updating game',
      error: error.message 
    });
  }
});

// ============================================
// @route   DELETE /api/games/:id
// @desc    Delete game
// @access  Private/Admin
// ============================================
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ 
        message: 'Game not found' 
      });
    }

    await game.deleteOne();

    res.json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Delete Game Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.status(500).json({ 
      message: 'Server error while deleting game',
      error: error.message 
    });
  }
});

// ============================================
// @route   GET /api/games/search/:keyword
// @desc    Search games by title or description
// @access  Public
// ============================================
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const games = await Game.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ],
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error('Search Games Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;