import { defineEventHandler, readBody, setResponseStatus, getRequestHeader } from 'h3'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const jwtSecret = process.env.JWT_SECRET!

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      setResponseStatus(event, 400)
      return { message: 'Email and password are required' }
    }

    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (fetchError) throw fetchError

    if (!users || users.length === 0) {
      setResponseStatus(event, 401)
      return { message: 'Invalid email or password' }
    }

    const user = users[0]

    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (!passwordMatch) {
      setResponseStatus(event, 401)
      return { message: 'Invalid email or password' }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username
      },
      jwtSecret,
      { expiresIn: '2h' }
    )

    setResponseStatus(event, 200)
    return { message: 'Login successful', token }
  } catch (err) {
    console.error('Login error:', err)
    setResponseStatus(event, 500)
    return { message: 'Server error' }
  }
})
