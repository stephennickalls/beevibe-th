import { defineEventHandler, readBody } from 'h3'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = body

    if (!username || !email || !password) {
      return { status: 400, message: 'All fields are required' }
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)

    if (fetchError) throw fetchError
    if (existingUser && existingUser.length > 0) {
      return { status: 409, message: 'Username or email already exists' }
    }

    const hashedPassword = bcrypt.hashSync(password, 10)

    const { data, error } = await supabase.from('users').insert([
      {
        username,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])

    if (error) throw error

    return { status: 201, message: 'User registered successfully' }
  } catch (err) {
    console.error('Registration error:', err)
    return { status: 500, message: 'Server error'}
  }
})
