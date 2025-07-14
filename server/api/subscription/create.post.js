// server/api/subscription/create.post.js
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseClient(event)
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  const body = await readBody(event)
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: user.id,
    mode: 'subscription',
    line_items: [{
      price: body.priceId,
      quantity: 1
    }],
    success_url: `${body.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${body.origin}/pricing`
  })
  
  return { url: session.url }
})