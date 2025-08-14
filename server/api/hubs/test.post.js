// server/api/hubs/test.post.js - Simple test
export default defineEventHandler(async (event) => {
  console.log('🚀 HUBS TEST ENDPOINT CALLED')
  
  const body = await readBody(event)
  console.log('Request body:', body)
  
  return {
    success: true,
    message: 'Hubs endpoint is reachable',
    receivedData: body
  }
})