import { supabase } from '~/server/utils/supabase';

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const { data, error } = await supabase.from('hives').select('*');

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return data;
  }

  if (event.method === 'POST') {
    const body = await readBody(event);

    // Basic validation
    if (!body.name || body.latitude == null || body.longitude == null) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('hives')
      .insert([
        {
          name: body.name,
          latitude: body.latitude,
          longitude: body.longitude,
          description: body.description || '',
        },
      ])
      .select()
      .single(); // return the newly created row

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return data;
  }

  // If method is not GET or POST
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});
