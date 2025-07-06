// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxtjs/tailwindcss'],

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.supabaseUrl,
      supabaseKey: process.env.supabaseKey,
      JWT_SECRET: process.env.JWT_SECRET,
    },
  
  },
    css: [
      '@/assets/css/normalize.css',
      '@/assets/css/main.css' // your custom styles
    ]
  
})

