// netlify/functions/keep-alive.js
import { createClient } from '@supabase/supabase-js';

export const handler = async (event, context) => {
  const supabaseUrl = process.env.supabaseUrl;
  const supabaseKey = process.env.supabaseKey;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Simple query to keep database active
    const { data, error } = await supabase
      .from('inspection_points') // Replace with any table in your database
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    console.log('Keep-alive ping successful');
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Keep-alive ping successful',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};