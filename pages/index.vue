<template>
  <div class="min-h-screen bg-brand-yellow font-open-sans text-gray-800">
    <div class="max-w-6xl mx-auto px-6">
      <!-- Header -->
      <header class="flex items-center justify-between py-4 relative header-border">
        <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-Black.svg" alt="BeeVibe Logo" class="w-auto h-15 mr-3" />
        
        <!-- Auth Button -->
        <div class="flex items-center space-x-3">
          <!-- Show user info and dashboard link if logged in -->
          <div v-if="user" class="flex items-center space-x-3">
            <NuxtLink 
              to="/dashboard-v2" 
              class="inline-block px-4 py-2 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              Dashboard
            </NuxtLink>
            <button 
              @click="handleSignOut"
              class="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          <!-- Show login button if not logged in -->
          <NuxtLink 
            v-else
            to="/auth/login" 
            class="inline-block px-4 py-2 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            Sign In
          </NuxtLink>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="text-left py-20 hero-border">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-tight mt-6 mb-8 text-gray-900">
          Real-Time Insights<br />For a Healthier Hive
        </h1>
        
        <!-- Dynamic CTA based on auth status -->
        <div class="flex items-center space-x-4">
          <NuxtLink 
            v-if="user"
            to="/dashboard-v2" 
            class="inline-block px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            Go to Dashboard
          </NuxtLink>
          <NuxtLink 
            v-else
            to="/auth/register" 
            class="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
          >
            Get Started
          </NuxtLink>
          
          <!-- Demo button for non-users -->
          <button 
            v-if="!user"
            @click="requestDemo"
            class="inline-block px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            Request Demo
          </button>
        </div>
      </section>

      <!-- Features Section -->
      <section class="text-center py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12 justify-items-center">
          <Card 
            title="Open Source Electronics" 
            description="Build your own IoT sensors with our open-source hardware designs. Monitor temperature, humidity, and weight with affordable, customizable components designed specifically for beehive monitoring."
          />
          <Card 
            title="Open Source Code" 
            description="Access our complete codebase and contribute to the future of beekeeping technology. Built with modern web technologies and designed for scalability and ease of use."
          />
          <Card 
            title="Get Started" 
            description="Jump into beehive monitoring with our comprehensive guides and documentation. From hardware assembly to software deployment, we'll help you every step of the way."
          />
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center py-8 pb-4">
        <!-- Bee Divider -->
        <div class="flex items-center justify-center mb-5">
          <hr class="flex-1 border-t-[1.5px] border-gray-800" />
          <img src="/images/BeeVibe-Logos/SVGs/Bee-Black.svg" alt="Bee Icon" class="mx-5 w-10 h-auto" />
          <hr class="flex-1 border-t-[1.5px] border-gray-800" />
        </div>

        <!-- Footer Columns -->
        <div class="footer-columns-wrapper">
          <div class="flex justify-around gap-6 mb-6">
            <div class="text-left">
              <h4 class="font-bold text-lg mb-4 text-gray-900">Company</h4>
              <ul class="space-y-4 text-sm">
                <li><NuxtLink to="/blog" class="text-gray-700 hover:text-gray-900 transition-colors">Blog</NuxtLink></li>
                <li><NuxtLink to="/about" class="text-gray-700 hover:text-gray-900 transition-colors">About</NuxtLink></li>
                <li><NuxtLink to="/jobs" class="text-gray-700 hover:text-gray-900 transition-colors">Jobs</NuxtLink></li>
              </ul>
            </div>
            
            <div class="text-center">
              <h4 class="font-bold text-lg mb-4 text-gray-900">Product</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#features" class="text-gray-700 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#pricing" class="text-gray-700 hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><NuxtLink to="/auth/register" class="text-gray-700 hover:text-gray-900 transition-colors">Sign Up</NuxtLink></li>
              </ul>
            </div>
            
            <div class="text-right">
              <h4 class="font-bold text-lg mb-4 text-gray-900">Support</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Footer Logo - Full Width of Main Container -->
    <div class="max-w-6xl mx-auto px-6 bg-brand-yellow py-6">
      <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-Black.svg" alt="BeeVibe Logo" class="w-full h-auto" />
    </div>

    <!-- Footer Bottom - Back in Container -->
    <div class="max-w-6xl mx-auto px-6 bg-brand-yellow">
      <div class="text-left text-base pb-4">
        <p class="text-gray-700">
          <NuxtLink to="/privacy" class="hover:text-gray-900 hover:underline transition-colors">Privacy policy</NuxtLink> · 
          <NuxtLink to="/terms" class="hover:text-gray-900 hover:underline transition-colors">Terms of service</NuxtLink> · 
          <a href="#" class="hover:text-gray-900 hover:underline transition-colors">Report issue</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'

console.log('🏠 Homepage loading...')

// Get Supabase client and user
const supabase = useSupabaseClient()
console.log('📡 Supabase client loaded')

const user = useSupabaseUser()
console.log('👤 User state:', user.value)

const router = useRouter()
console.log('🛣️ Router loaded')

// Add a watcher to see when user changes
watch(user, (newUser) => {
  console.log('👤 User changed:', newUser)
}, { immediate: true })

// Handle sign out
const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    // User will automatically be redirected due to reactivity
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// Handle demo request
const requestDemo = () => {
  // You could implement this as:
  // 1. Modal with demo request form
  // 2. Redirect to dedicated demo page
  // 3. Email link for now
  alert('Demo request: Please email us at demo@beevibe.com')
}

// Meta tags for SEO
useHead({
  title: 'BeeVibe - Real-Time Beehive Monitoring',
  meta: [
    { name: 'description', content: 'Monitor your beehives in real-time with open-source IoT sensors. Track temperature, humidity, and weight for healthier, more productive hives.' }
  ]
})
</script>

<style scoped>
/* Import Open Sans font */
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap");

/* Tailwind custom color fallbacks */
.font-open-sans {
  font-family: "Open Sans", sans-serif;
}

/* Brand colors - fallbacks for Tailwind */
.bg-brand-yellow {
  background-color: #F9E900;
}

.text-brand-yellow {
  color: #F9E900;
}

.hover\:text-brand-yellow-hover:hover {
  color: #E6D200;
}

.hover\:bg-brand-yellow-hover:hover {
  background-color: #E6D200;
}

/* Custom CSS for specific design elements */

/* Header bottom border */
.header-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  background-color: #1f2937; /* gray-800 */
}

/* Hero section bottom border */
.hero-border::after {
  content: "";
  display: block;
  width: 100%;
  height: 1.5px;
  background-color: #1f2937; /* gray-800 */
  margin-top: 6rem;
}

/* Footer columns wrapper bottom border */
.footer-columns-wrapper::after {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #1f2937; /* gray-800 */
  margin-top: 1rem;
}
</style>