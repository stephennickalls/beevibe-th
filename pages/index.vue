<template>
  <div class="min-h-screen bg-custom-green font-sans text-custom-gray">
    
    <!-- Hero Section -->
    <div class="text-center py-20 px-6">
      <div class="flex justify-start items-center px-6">
        <!-- Bee Icon -->
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="14" stroke="black" stroke-width="2"/>
          <text x="7" y="20" font-size="12" fill="black">Bee</text>
        </svg>
      </div>

      <!-- Short black line under Bee logo -->
      <div class="flex px-6 mt-2">
        <div class="h-1 w-16 bg-black rounded-full"></div>
      </div>


      <h1 class="text-4xl font-bold leading-tight mt-6">
        Real-Time Insights<br />For a Healthier Hive
      </h1>
      <NuxtLink to="/dashboard" class="see-hives-btn mt-4 inline-block">See Hives</NuxtLink>
    </div>

    <!-- Features Section -->
    <div class="text-center px-6">
      <h2 class="text-2xl font-bold mb-6">BeeVibe</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Card 1 -->
        <div class="bg-[#d4ff57] border border-black rounded-md p-6 text-left">
          <h3 class="font-bold text-lg mb-2">Open Source</h3>
          <p class="text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>
        <!-- Card 2 -->
        <div class="bg-[#d4ff57] border border-black rounded-md p-6 text-left">
          <h3 class="font-bold text-lg mb-2">Open Code</h3>
          <p class="text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>
        <!-- Card 3 -->
        <div class="bg-[#d4ff57] border border-black rounded-md p-6 text-left">
          <h3 class="font-bold text-lg mb-2">Get Started</h3>
          <p class="text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>
      </div>
      <button class="see-hives-btn mb-12">More Info</button>
    </div>



    <!-- Footer -->
    <footer class="text-center border-t border-black pt-6 px-6">
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <h4 class="font-bold">Company</h4>
          <ul class="text-sm mt-2">
            <li>Blog</li>
            <li>About</li>
            <li>Jobs</li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold">Product</h4>
          <ul class="text-sm mt-2">
            <li>Features</li>
            <li>Pricing</li>
            <li>Help Center</li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold">Q&A</h4>
          <ul class="text-sm mt-2">
            <li>Common Q</li>
            <li>Media</li>
            <li>Contact Info</li>
          </ul>
        </div>
      </div>
      <!-- BeeVibe Logo Bottom -->
      <div class="py-6">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="28" stroke="black" stroke-width="3"/>
          <text x="18" y="38" font-size="16" fill="black">Bee</text>
        </svg>
        <h1 class="text-4xl font-bold mt-2">BeeVibe</h1>
      </div>
      <div class="text-xs text-center pb-4">
        <p>Privacy policy · Privacy settings · Terms of service · Report issue</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap");

/* Custom background color */
.bg-custom-green {
  background-color: #d1f661;
}

/* Text color */
.text-custom-gray {
  color: #212121;
}

/* Apply Open Sans font */
.font-sans {
  font-family: "Open Sans", sans-serif;
}

/* Grid layout for cards and footer */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Global page reset */
html,
body {
  margin: 0;
  padding: 0;
  background-color: #d1f661;
}

/* Button styling */
.see-hives-btn {
  background-color: #d4ff57;
  border: 1px solid #000;
  color: #000;
  text-decoration: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.see-hives-btn:hover {
  background-color: #c4f04e;
}
</style>

