export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  supabase: {
    url: 'https://jodtcluxbgohacounvyf.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNTU2NTAsImV4cCI6MjA1MjgzMTY1MH0.uaeJVW8SdAOreMwjAeT7nkvpQStNXwfDXpu2i5YYXEk',
    redirectOptions: {
      login: '/auth/login',
      callback: '/confirm',
      exclude: ['/', '/auth/register']
    }
  },
  
  runtimeConfig: {
    // Server-side
    supabaseUrl: 'https://jodtcluxbgohacounvyf.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNTU2NTAsImV4cCI6MjA1MjgzMTY1MH0.uaeJVW8SdAOreMwjAeT7nkvpQStNXwfDXpu2i5YYXEk',
    
    // Public
    public: {
      supabaseUrl: 'https://jodtcluxbgohacounvyf.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNTU2NTAsImV4cCI6MjA1MjgzMTY1MH0.uaeJVW8SdAOreMwjAeT7nkvpQStNXwfDXpu2i5YYXEk'
    }
  },
  
  css: [
    '@/assets/css/normalize.css',
    '@/assets/css/main.css'
  ]
})