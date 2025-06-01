// server/api/hives/[uuid].ts
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

  const { name } = await readBody<{ name?: string }>(event)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Request body must include a `name` field.' })
  }

  const { data: hive, error } = await supabase
    .from('hives')
    .update({ name })
    .eq('uuid', uuid)      // ← filter on your UUID column
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, hive }
})
