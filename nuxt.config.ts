export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  runtimeConfig: {
    // Server-side only
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    
    // Public (available on both client and server)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  },
  
  css: [
    '@/assets/css/normalize.css',
    '@/assets/css/main.css'
  ]
})