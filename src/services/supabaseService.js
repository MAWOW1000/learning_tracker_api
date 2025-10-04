/**
 * Supabase Database Service
 * Handles data persistence
 */

const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

function initSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials not configured. Database operations will be skipped.');
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  
  return supabaseClient;
}

async function upsertPracticeData(dateStr, payload) {
  const supabase = initSupabase();
  
  if (!supabase) {
    console.warn('Supabase not initialized. Skipping upsert.');
    return { error: 'Supabase not configured' };
  }
  
  try {
    const data = {
      date: dateStr,
      leetcode: payload.leetcode || false,
      github: payload.github || false,
      writing_submitted: payload.writing_submitted || false,
      writing_chars: payload.writing_chars || 0,
      speaking_detected: payload.speaking_detected || false,
      notes: payload.notes || null,
      updated_at: new Date().toISOString()
    };
    
    const { data: result, error } = await supabase
      .from('daily_practice')
      .upsert(data, { onConflict: 'date' });
    
    if (error) {
      console.error('Supabase upsert error:', error);
      return { error: error.message };
    }
    
    return { success: true, data: result };
  } catch (err) {
    console.error('Supabase operation error:', err.message);
    return { error: err.message };
  }
}

async function getPracticeData(startDate, endDate) {
  const supabase = initSupabase();
  
  if (!supabase) {
    return { error: 'Supabase not configured', data: [] };
  }
  
  try {
    let query = supabase
      .from('daily_practice')
      .select('*')
      .order('date', { ascending: false });
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return { error: error.message, data: [] };
    }
    
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Supabase operation error:', err.message);
    return { error: err.message, data: [] };
  }
}

async function deletePracticeData(dateStr) {
  const supabase = initSupabase();
  
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await supabase
      .from('daily_practice')
      .delete()
      .eq('date', dateStr);
    
    if (error) {
      console.error('Supabase delete error:', error);
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Supabase operation error:', err.message);
    return { error: err.message };
  }
}

module.exports = {
  initSupabase,
  upsertPracticeData,
  getPracticeData,
  deletePracticeData
};
