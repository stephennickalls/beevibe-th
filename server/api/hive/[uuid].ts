import { defineEventHandler, readBody, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  const uuid = event.context.params?.uuid

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'Missing hive UUID in route.' })
  }

  //updates a hive
  if (event.method === 'PUT') {
    const { name, latitude, longitude, description } = await readBody(event)
    if (!name && latitude == null && longitude == null && !description) {
      throw createError({ statusCode: 400, statusMessage: 'Provide at least one field to update.' })
    }

    const updateFields: Record<string, any> = {}
    if (name) updateFields.name = name
    if (latitude != null) updateFields.latitude = latitude
    if (longitude != null) updateFields.longitude = longitude
    if (description) updateFields.description = description

    const { data: hive, error } = await supabase
      .from('hives')
      .update(updateFields)
      .eq('uuid', uuid)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true, hive }
  }

  //deletes a hive
  if (event.method === 'DELETE') {
    const { error } = await supabase
      .from('hives')
      .delete()
      .eq('uuid', uuid)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true, message: 'Hive deleted successfully.' }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
