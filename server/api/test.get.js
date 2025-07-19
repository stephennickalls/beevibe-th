// server/api/test.get.js - Simple test to verify API routing works
export default defineEventHandler(async (event) => {
  console.log('Test endpoint called!')
  
  return {
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  }
})