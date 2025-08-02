export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/leaflet'
  ],
  
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    
    redirectOptions: {
      login: '/auth/login',
      callback: '/confirm',
      exclude: ['/', '/auth/register']
    }
  },
  
  runtimeConfig: {
    // Server-side (private)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Public (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  
  css: [
    '@/assets/css/normalize.css',
    '@/assets/css/main.css'
  ]
})