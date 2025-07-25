<!-- pages/index.vue - Fixed to use existing Card component -->
<template>
  <div class="min-h-screen bg-gray-900 font-open-sans">
    <!-- Navigation -->
    <nav class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <img 
              src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-White.svg" 
              alt="BeeVibe Logo" 
              class="h-10 w-auto"
            />
          </div>

          <!-- Navigation Menu -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-300 hover:text-brand-yellow transition-colors">Features</a>
            <a href="#pricing" class="text-gray-300 hover:text-brand-yellow transition-colors">Pricing</a>
            <NuxtLink to="/about" class="text-gray-300 hover:text-brand-yellow transition-colors">About</NuxtLink>
          </div>

          <!-- Auth Section -->
          <div class="flex items-center space-x-4">
            <div v-if="user" class="flex items-center space-x-4">
              <NuxtLink 
                to="/dashboard-v2" 
                class="bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </NuxtLink>
              <button 
                @click="handleSignOut"
                class="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            <div v-else class="hidden md:flex items-center space-x-4">
              <NuxtLink 
                to="/auth/login" 
                class="text-gray-300 hover:text-brand-yellow font-medium transition-colors"
              >
                Sign In
              </NuxtLink>
              <NuxtLink 
                to="/auth/register" 
                class="bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="text-gray-300 hover:text-white"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden pb-4">
          <div class="flex flex-col space-y-4">
            <a href="#features" class="text-gray-300 hover:text-brand-yellow transition-colors">Features</a>
            <a href="#pricing" class="text-gray-300 hover:text-brand-yellow transition-colors">Pricing</a>
            <NuxtLink to="/about" class="text-gray-300 hover:text-brand-yellow transition-colors">About</NuxtLink>
            <div v-if="!user" class="pt-4 border-t border-gray-700">
              <NuxtLink 
                to="/auth/login" 
                class="block text-gray-300 hover:text-brand-yellow font-medium transition-colors mb-2"
              >
                Sign In
              </NuxtLink>
              <NuxtLink 
                to="/auth/register" 
                class="inline-block bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <!-- Left Content -->
          <div class="mb-12 lg:mb-0">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8">
              Real-Time Insights<br>
              <span class="text-brand-yellow">For a Healthier Hive</span>
            </h1>
            
            <p class="text-xl text-gray-300 mb-10 leading-relaxed">
              Monitor your beehives with precision using our open-source IoT sensors. 
              Track temperature, humidity, and weight in real-time for healthier, more productive colonies.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <NuxtLink 
                v-if="user"
                to="/dashboard-v2" 
                class="inline-flex items-center justify-center px-8 py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
                <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
              
              <NuxtLink 
                v-else
                to="/auth/register" 
                class="inline-flex items-center justify-center px-8 py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
                <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
              
              <button 
                v-if="!user"
                @click="requestDemo"
                class="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-600 text-gray-300 hover:border-brand-yellow hover:text-brand-yellow font-semibold rounded-lg transition-all"
              >
                Watch Demo
                <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

          </div>

          <!-- Right Content - Visual Element -->
          <div class="relative">
            <div class="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
              <!-- Mock Dashboard Preview -->
              <div class="bg-gray-900 rounded-xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-white font-semibold">Hive #1 - Garden Colony</h3>
                  <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-800 rounded-lg p-4">
                    <div class="text-brand-yellow text-2xl font-bold">72°F</div>
                    <div class="text-gray-400 text-sm">Temperature</div>
                  </div>
                  <div class="bg-gray-800 rounded-lg p-4">
                    <div class="text-brand-yellow text-2xl font-bold">65%</div>
                    <div class="text-gray-400 text-sm">Humidity</div>
                  </div>
                </div>
                
                <div class="bg-gray-800 rounded-lg p-4">
                  <div class="text-brand-yellow text-2xl font-bold">45.2 lbs</div>
                  <div class="text-gray-400 text-sm">Total Weight</div>
                  <div class="text-green-400 text-xs mt-1">↗ +2.1 lbs this week</div>
                </div>

                <!-- Simple chart representation -->
                <div class="bg-gray-800 rounded-lg p-4">
                  <div class="text-gray-300 text-sm mb-2">Activity Chart</div>
                  <div class="flex items-end space-x-1 h-16">
                    <div class="bg-brand-yellow w-2 h-8 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-12 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-6 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-16 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-10 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-14 rounded-t"></div>
                    <div class="bg-brand-yellow w-2 h-4 rounded-t"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section with properly structured grid -->
    <section id="features" class="py-20 bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
            Everything You Need for <span class="text-brand-yellow">Smart Beekeeping</span>
          </h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform combines hardware, software, and community to revolutionize how you monitor and manage your beehives.
          </p>
        </div>

        <!-- Fixed grid: 3 cols on lg+, 2 cols on md, 1 col on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Open Source Hardware -->
          <FeatureCard 
            title="Open Source Hardware"
            description="Build your own IoT sensors with our open-source designs. Monitor temperature, humidity, and weight with affordable, customizable components."
            icon-path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />

          <!-- Real-Time Monitoring -->
          <FeatureCard 
            title="Real-Time Monitoring"
            description="Get instant alerts and insights about your hive conditions. Never miss critical changes that could affect your colony's health."
            icon-path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />

          <!-- Community Driven -->
          <FeatureCard 
            title="Community Driven"
            description="Join a growing community of beekeepers and developers. Share insights, contribute code, and learn from experienced apiarians."
            icon-path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />

          <!-- Easy Setup -->
          <FeatureCard 
            title="Easy Setup"
            description="Get started quickly with our comprehensive guides and documentation. From hardware assembly to software deployment."
            icon-path="M13 10V3L4 14h7v7l9-11h-7z"
          />

          <!-- Data Analytics -->
          <FeatureCard 
            title="Data Analytics"
            description="Understand patterns and trends in your hive data. Make informed decisions based on historical and real-time insights."
            icon-path="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />

          <!-- Mobile Ready -->
          <FeatureCard 
            title="Mobile Ready"
            description="Access your hive data anywhere, anytime. Our responsive design works perfectly on all your devices."
            icon-path="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Beekeeping?
        </h2>
        <p class="text-xl text-gray-300 mb-10">
          Join hundreds of beekeepers using BeeVibe to monitor their hives and improve colony health.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <NuxtLink 
            v-if="user"
            to="/dashboard-v2" 
            class="inline-flex items-center justify-center px-8 py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Dashboard
          </NuxtLink>
          <NuxtLink 
            v-else
            to="/auth/register" 
            class="inline-flex items-center justify-center px-8 py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Start Free Today
          </NuxtLink>
          <NuxtLink 
            v-if="!user"
            to="/auth/login" 
            class="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-600 text-gray-300 hover:border-brand-yellow hover:text-brand-yellow font-semibold rounded-lg transition-all"
          >
            Sign In
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Bee Divider -->
        <div class="flex items-center justify-center mb-8">
          <hr class="flex-1 border-t-[1.5px] border-gray-600" />
          <img src="/images/BeeVibe-Logos/SVGs/Bee-White.svg" alt="Bee Icon" class="mx-5 w-10 h-auto" />
          <hr class="flex-1 border-t-[1.5px] border-gray-600" />
        </div>

        <!-- Footer Columns -->
        <div class="footer-columns-wrapper">
          <div class="flex justify-around gap-6 mb-6">
            <div class="text-left">
              <h4 class="font-bold text-lg mb-4 text-white">Company</h4>
              <ul class="space-y-4 text-sm">
                <li><NuxtLink to="/about" class="text-gray-400 hover:text-brand-yellow transition-colors">About</NuxtLink></li>
                <li><a href="#" class="text-gray-400 hover:text-brand-yellow transition-colors">Jobs</a></li>
                <li><a href="#" class="text-gray-400 hover:text-brand-yellow transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div class="text-center">
              <h4 class="font-bold text-lg mb-4 text-white">Product</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#features" class="text-gray-400 hover:text-brand-yellow transition-colors">Features</a></li>
                <li><a href="#pricing" class="text-gray-400 hover:text-brand-yellow transition-colors">Pricing</a></li>
                <li><NuxtLink to="/auth/register" class="text-gray-400 hover:text-brand-yellow transition-colors">Sign Up</NuxtLink></li>
              </ul>
            </div>
            
            <div class="text-right">
              <h4 class="font-bold text-lg mb-4 text-white">Support</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#" class="text-gray-400 hover:text-brand-yellow transition-colors">Help Center</a></li>
                <li><a href="#" class="text-gray-400 hover:text-brand-yellow transition-colors">Contact</a></li>
                <li><a href="#" class="text-gray-400 hover:text-brand-yellow transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Footer Logo - Full Width of Main Container (like original) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-900 py-6">
      <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-White.svg" alt="BeeVibe Logo" class="w-full h-auto" />
    </div>

    <!-- Footer Bottom - Back in Container (like original) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div class="text-center text-base pb-4">
        <p class="text-gray-400">
          <NuxtLink to="/privacy" class="hover:text-brand-yellow hover:underline transition-colors">Privacy policy</NuxtLink> · 
          <NuxtLink to="/terms" class="hover:text-brand-yellow hover:underline transition-colors">Terms of service</NuxtLink> · 
          <a href="#" class="hover:text-brand-yellow hover:underline transition-colors">Report issue</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get Supabase client and user
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Reactive state
const mobileMenuOpen = ref(false)

// Add a watcher to see when user changes
watch(user, (newUser) => {
  console.log('👤 User changed:', newUser)
}, { immediate: true })

// Get user display name
const getUserName = () => {
  if (!user.value) return ''
  return user.value.user_metadata?.first_name || 
         user.value.user_metadata?.full_name || 
         user.value.email?.split('@')[0] || 
         'User'
}

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

.hover\:text-brand-yellow:hover {
  color: #F9E900;
}

.hover\:bg-brand-yellow-hover:hover {
  background-color: #E6D200;
}

.hover\:border-brand-yellow:hover {
  border-color: #F9E900;
}

/* Gray colors - fallbacks */
.bg-gray-850 {
  background-color: #1f2937;
}

.bg-gray-750 {
  background-color: #374151;
}

/* Feature card border hover - ADDED THIS */
.feature-card-border:hover {
  border-color: #9CA3AF !important; /* gray-400 */
}

/* Footer columns wrapper bottom border (like original) */
.footer-columns-wrapper::after {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: #4b5563; /* gray-600 */
  margin-top: 1rem;
}
</style>