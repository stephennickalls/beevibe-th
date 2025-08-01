// server/api/hives/[id].put.js - Update a hive (properly updated for apiary structure)
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== UPDATE HIVE START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase service role key'
      })
    }

    // Step 1: Authenticate user
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Step 2: Get hive ID from route params
    const hiveId = getRouterParam(event, 'id')
    if (!hiveId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive ID is required'
      })
    }

    console.log('Updating hive:', hiveId, 'for user:', user.id)

    // Step 3: Get request body and validate
    const body = await readBody(event)
    
    if (!body.name || !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive name is required'
      })
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 4: Verify hive exists and belongs to user
    const { data: existingHive, error: fetchError } = await serviceClient
      .from('hives')
      .select('id, user_id, name, apiary_id')
      .eq('id', hiveId)
      .single()

    if (fetchError || !existingHive) {
      console.error('Hive fetch error:', fetchError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found'
      })
    }

    if (existingHive.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only update your own hives'
      })
    }

    // Step 5: Validate apiary ownership if apiary_id is being changed
    if (body.apiary_id && body.apiary_id !== existingHive.apiary_id) {
      const { data: apiary, error: apiaryError } = await serviceClient
        .from('apiaries')
        .select('id')
        .eq('id', body.apiary_id)
        .eq('user_id', user.id)
        .single()

      if (apiaryError || !apiary) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only assign hives to your own apiaries'
        })
      }
    }

    // Step 6: Prepare update data (NO GPS coordinates - only apiary relationship)
    const updateData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      apiary_id: body.apiary_id || null,
      installation_date: body.installation_date || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log('Update data:', updateData)

    // Step 7: Update the hive and return with apiary data
    const { data, error } = await serviceClient
      .from('hives')
      .update(updateData)
      .eq('id', hiveId)
      .eq('user_id', user.id) // Double-check ownership
      .select(`
        *,
        apiary:apiaries(
          id,
          name,
          description,
          latitude,
          longitude,
          address
        )
      `)
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    console.log('✅ Hive updated successfully:', data)
    console.log('=== UPDATE HIVE END ===')
    
    return { 
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Update hive error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update hive'
    })
  }
})