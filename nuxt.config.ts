// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
    },
  
  },
    css: [
      '@/assets/css/normalize.css',
      '@/assets/css/main.css' // your custom styles
    ]
  
})

