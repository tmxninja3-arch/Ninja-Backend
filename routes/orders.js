const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Game = require('../models/Game');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// ============================================
// @route   POST /api/orders
// @desc    Create new order
// @access  Private
// ============================================
router.post('/', protect, async (req, res) => {
  try {
    const { games, total, paymentMethod } = req.body;

    // Validate input
    if (!games || games.length === 0) {
      return res.status(400).json({ 
        message: 'No games in order' 
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ 
        message: 'Invalid order total' 
      });
    }

    // Verify all games exist and have stock
    for (let item of games) {
      const game = await Game.findById(item.game);
      
      if (!game) {
        return res.status(404).json({ 
          message: `Game "${item.title}" not found` 
        });
      }
      
      if (game.stock < 1) {
        return res.status(400).json({ 
          message: `"${game.title}" is out of stock` 
        });
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      games,
      total,
      paymentMethod: paymentMethod || 'COD',
    });

    // Reduce stock for each game
    for (let item of games) {
      await Game.findByIdAndUpdate(item.game, {
        $inc: { stock: -1 }, // Decrease stock by 1
      });
    }

    // Populate order with user info
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ 
      message: 'Server error while creating order',
      error: error.message 
    });
  }
});

// ============================================
// @route   GET /api/orders/myorders
// @desc    Get logged in user's orders
// @access  Private
// ============================================
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .populate('user', 'name email');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ============================================
// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
// ============================================
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('games.game', 'title description');

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Make sure user owns this order OR is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Not authorized to view this order' 
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ============================================
// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
// ============================================
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ============================================
// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
// ============================================
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        message: 'Please provide order status' 
      });
    }

    const validStatuses = ['Pending', 'Paid', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    await updatedOrder.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ============================================
// @route   DELETE /api/orders/:id
// @desc    Cancel order (change status to Cancelled)
// @access  Private
// ============================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Check if user owns this order OR is admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Not authorized to cancel this order' 
      });
    }

    // Can only cancel if status is Pending
    if (order.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock for cancelled orders
    for (let item of order.games) {
      await Game.findByIdAndUpdate(item.game, {
        $inc: { stock: 1 }, // Increase stock by 1
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;