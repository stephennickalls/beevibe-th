import { supabase } from '~/server/utils/supabase';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Hive ID is required' });
  }

  if (event.method === 'DELETE') {
    const { error } = await supabase
      .from('hives')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return { message: `Hive with ID ${id} deleted successfully` };
  }

  if (event.method === 'PUT') {
    const body = await readBody(event);
  
    const { error } = await supabase
      .from('hives')
      .update({
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description || '',
      })
      .eq('id', id);
  
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  
    return { message: `Hive with ID ${id} updated successfully` };
  }
  

  // Optional: Support GET or other methods for single hive
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });

  
});

