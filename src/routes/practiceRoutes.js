/**
 * Practice Routes
 * API endpoints for practice data management
 */

const express = require('express');
const router = express.Router();
const { getPracticeData } = require('../services/supabaseService');

// GET /api/practice - Get practice data
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await getPracticeData(startDate, endDate);
    
    if (result.error) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
    res.json({ 
      success: true, 
      data: result.data 
    });
  } catch (err) {
    console.error('Error fetching practice data:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;
