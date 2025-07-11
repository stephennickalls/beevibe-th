<template>
  <div class="min-h-screen bg-[#d1f661] font-open-sans text-[#212121]">
    <div class="max-w-6xl mx-auto px-6">
      <!-- Header -->
      <header class="flex items-center py-4 relative header-border">
        <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-Black.svg" alt="BeeVibe Logo" class="w-auto h-15 mr-3" />
        <!-- Navigation can be added here -->
      </header>

      <!-- Hero Section -->
      <section class="text-left py-20 hero-border">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-tight mt-6 mb-8">
          Real-Time Insights<br />For a Healthier Hive
        </h1>
        <NuxtLink 
          to="/dashboard-v2" 
          class="inline-block px-4 py-1.5 border-2 border-black text-black rounded-lg font-medium hover:bg-black hover:text-white transition-all duration-200"
        >
          Dashboard
        </NuxtLink>
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
          <hr class="flex-1 border-t-[1.5px] border-black" />
          <img src="/images/BeeVibe-Logos/SVGs/Bee-Black.svg" alt="Bee Icon" class="mx-5 w-10 h-auto" />
          <hr class="flex-1 border-t-[1.5px] border-black" />
        </div>

        <!-- Footer Columns -->
        <div class="footer-columns-wrapper">
          <div class="flex justify-around gap-6 mb-6">
            <div class="text-left">
              <h4 class="font-bold text-lg mb-4">Company</h4>
              <ul class="space-y-4 text-sm">
                <li><NuxtLink to="/blog" class="hover:text-gray-600 transition-colors">Blog</NuxtLink></li>
                <li><NuxtLink to="/about" class="hover:text-gray-600 transition-colors">About</NuxtLink></li>
                <li><NuxtLink to="/jobs" class="hover:text-gray-600 transition-colors">Jobs</NuxtLink></li>
              </ul>
            </div>
            
            <div class="text-center">
              <h4 class="font-bold text-lg mb-4">Product</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#" class="hover:text-gray-600 transition-colors">Features</a></li>
                <li><a href="#" class="hover:text-gray-600 transition-colors">Pricing</a></li>
                <li><a href="#" class="hover:text-gray-600 transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div class="text-right">
              <h4 class="font-bold text-lg mb-4">Q&A</h4>
              <ul class="space-y-4 text-sm">
                <li><a href="#" class="hover:text-gray-600 transition-colors">Common Q</a></li>
                <li><a href="#" class="hover:text-gray-600 transition-colors">Media</a></li>
                <li><a href="#" class="hover:text-gray-600 transition-colors">Contact Info</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Footer Logo - Full Width of Main Container -->
    <div class="max-w-6xl mx-auto px-6 bg-[#d1f661] py-6">
      <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-Black.svg" alt="BeeVibe Logo" class="w-full h-auto" />
    </div>

    <!-- Footer Bottom - Back in Container -->
    <div class="max-w-6xl mx-auto px-6 bg-[#d1f661]">
      <div class="text-left text-base pb-4">
        <p>Privacy policy · Privacy settings · Terms of service · Report issue</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'

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

/* Custom CSS for specific design elements that can't be done with Tailwind */

/* Header bottom border */
.header-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5px;
  background-color: black;
}

/* Hero section bottom border */
.hero-border::after {
  content: "";
  display: block;
  width: 100%;
  height: 1.5px;
  background-color: black;
  margin-top: 6rem;
}

/* Footer columns wrapper bottom border */
.footer-columns-wrapper::after {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: black;
  margin-top: 1rem;
}

/* Custom font family class */
.font-open-sans {
  font-family: "Open Sans", sans-serif;
}
</style>