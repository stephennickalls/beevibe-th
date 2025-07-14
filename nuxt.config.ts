export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/', '/auth/login', '/auth/register', '/auth/forgot-password']
    }
  },
  
  // Add this for debugging
  ssr: false, // Disable SSR temporarily to isolate the issue
  
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY
      }
    }
  },
  
  css: [
    '@/assets/css/normalize.css',
    '@/assets/css/main.css'
  ]
})