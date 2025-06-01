import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const method = event.method

  //get hive info
  if (method === 'GET') {
    const { data, error } = await supabase.from('hives').select('*')
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  }

  //create hive
  if (method === 'POST') {
    const body = await readBody(event)
    if (!body.name || body.latitude == null || body.longitude == null) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    const { data, error } = await supabase
      .from('hives')
      .insert({
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description || ''
      })
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
