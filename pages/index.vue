<template>
  <div class="page-container">
    <div class="container">
      <!-- Header -->
      <header class="main-header">
        <img src="/images/bee hollow.png" alt="Bee Icon" class="bee-icon" />
        <!-- nav goes here -->
      </header>

      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">
          Real-Time Insights<br />For a Healthier Hive
        </h1>
        <NuxtLink to="/dashboard" class="btn">See Hives</NuxtLink>
      </div>

      

      <!-- Features Section -->
      <div class="features-section">
        <h2 class="features-heading">BeeVibe</h2>
        <div class="card-grid">
          <Card 
            title="Open Source Electronics" 
            description="God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys 
            God. Man creates Dinosaurs. Just my luck, no ice. Just my luck, no ice. Life finds a way. 
            " 
          />
          <Card 
            title="Open Source Code" 
            description="God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys 
            God. Man creates Dinosaurs. Just my luck, no ice. Just my luck, no ice. Life finds a way." 
          />
          <Card 
            title="Get Started" 
            description="God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys 
            God. Man creates Dinosaurs. Just my luck, no ice. Just my luck, no ice. Life finds a way." 
          />
        </div>
        <!-- <button class="btn more-info">More Info</button> -->
      </div>

      <!-- Footer -->
      <footer class="footer">
        <img src="/images/bee-footer-line.png" alt="Bee Icon" class="" />
        <div class="footer-columns-wrapper">
          <div class="footer-columns">

            <div class="footer-nav-1">
              <h4 class="footer-heading">Company</h4>
              <ul class="footer-links">
                <li><a href="/blog">Blog</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/jobs">Jobs</a></li>
              </ul>
            </div>
            
            <div class="footer-nav-2">
              <h4 class="footer-heading">Product</h4>
              <ul class="footer-links">
                <li>Features</li>
                <li>Pricing</li>
                <li>Help Center</li>
              </ul>
            </div>
            <div class="footer-nav-3">
              <h4 class="footer-heading">Q&A</h4>
              <ul class="footer-links">
                <li>Common Q</li>
                <li>Media</li>
                <li>Contact Info</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-logo">
          <img src="/images/Footer Logo.png" alt="Bee Icon" class="" />
        </div>
        <div class="footer-bottom">
          <p>Privacy policy · Privacy settings · Terms of service · Report issue</p>
        </div>
      </footer>
    </div>
  </div>
</template>


<script setup>
import Card from '@/components/Card.vue'
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap");

.page-container {
  min-height: 100vh;
  background-color: #d1f661;
  font-family: "Open Sans", sans-serif;
  color: #212121;
}

/* Header */
.main-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  position: relative;
}

.main-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 3px;
  background-color: black;
}

.bee-icon {
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

/* Hero Section */
.hero-section {
  text-align: left;
  padding: 5rem 1.5rem;
}

.hero-title {
  font-size: 6rem;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.5rem;
}

/* Button */
.btn {
  background-color: #d4ff57;
  border: 2px solid #000;
  color: #000;
  text-decoration: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  display: inline-block;
  margin: 1rem auto;
}

.see-hives-btn:hover {
  background-color: #c4f04e;
}

.more-info {
  margin-bottom: 3rem;
}

/* Features Section */
.features-section {
  text-align: center;
  padding: 0 1.5rem;
}

.features-heading {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 50px;
  margin-bottom: 2rem;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2rem 1.5rem 1rem;
}

.footer-columns {
  display: flex;
  justify-content: space-around;
  gap: 24px;
  margin-bottom: 1.5rem;
}

.footer-columns-wrapper::after {
  content: "";
  display: block;
  width: 100%;
  height: 3px;
  background-color: black;
  margin-top: 1rem;
}



.footer-heading {
  font-weight: bold;
  font-size: 1.15rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.footer-links li {
  margin-bottom: 1rem; /* Increased vertical spacing */
}

.footer-links a {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #555; /* Optional hover effect */
}


.footer-logo {
  
  width: 100%;
}

.footer-brand {
  font-size: 2.25rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.footer-bottom {
  font-size: 1rem;
  padding-bottom: 1rem;
  text-align: left;
}

.footer-nav-1 {
  text-align: left;
}

.footer-nav-3 {
  text-align: right;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

</style>
