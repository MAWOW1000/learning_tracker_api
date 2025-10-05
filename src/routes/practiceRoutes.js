/**
 * Practice Routes
 * API endpoints for practice data management
 */

const express = require('express');
const router = express.Router();
const { getPracticeData, upsertPracticeData } = require('../services/supabaseService');
const { fetchCombinedPracticeData } = require('../services/externalApiService');

// GET /api/practice - Get practice data from database (legacy)
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

// GET /api/practice/live - Get real-time data from GitHub and LeetCode APIs
router.get('/live', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get usernames from environment variables
    const githubUsername = process.env.GITHUB_USERNAME;
    const leetcodeUsername = process.env.LEETCODE_USERNAME;
    
    if (!githubUsername || !leetcodeUsername) {
      return res.status(500).json({ 
        success: false, 
        error: 'GitHub or LeetCode username not configured. Please set GITHUB_USERNAME and LEETCODE_USERNAME environment variables.' 
      });
    }
    
    // Fetch live data from external APIs
    const data = await fetchCombinedPracticeData(
      githubUsername, 
      leetcodeUsername, 
      startDate, 
      endDate
    );
    
    res.json({ 
      success: true, 
      data,
      source: 'live',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching live practice data:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// POST /api/practice/writing - Submit English writing
router.post('/writing', async (req, res) => {
  try {
    const { date, content, notes } = req.body;
    
    if (!date || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Date and content are required' 
      });
    }
    
    // Count characters and words
    const chars = content.length;
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Prepare data for database
    const practiceData = {
      writing_submitted: true,
      writing_chars: chars,
      writing_words: words,
      notes: notes || null,
    };
    
    // Save to database
    const result = await upsertPracticeData(date, practiceData);
    
    if (result.error) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        date,
        chars,
        words,
        message: 'Writing submitted successfully!'
      }
    });
  } catch (err) {
    console.error('Error submitting writing:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;
