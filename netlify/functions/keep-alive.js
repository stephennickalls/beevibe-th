// netlify/functions/keep-alive.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabaseUrl = process.env.supabaseUrl;
  const supabaseKey = process.env.supabaseKey;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Simple query to keep database active
    const { data, error } = await supabase
      .from('your_table_name') // Replace with any table in your database
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