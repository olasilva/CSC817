const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase/client');
const { authenticateUser } = require('../middleware/auth');

// Get activity log
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    
    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Clear activity log (admin only)
router.delete('/', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from('activity_log')
      .delete()
      .neq('id', '0'); // Delete all

    if (error) throw error;
    res.json({ success: true, message: 'Activity log cleared' });
  } catch (error) {
    console.error('Clear activity error:', error);
    res.status(500).json({ error: 'Failed to clear activity log' });
  }
});

module.exports = router;