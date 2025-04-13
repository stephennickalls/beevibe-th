<template>
  <div class="page-container">
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
    </div>

    <NuxtLink to="/dashboard" class="see-hives-btn">See Hives</NuxtLink>

    <!-- Features Section -->
    <div class="features-section">
      <h2 class="features-heading">BeeVibe</h2>
      <div class="card-grid">
        <Card 
          title="Open Source" 
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s..." 
        />
        <Card 
          title="Open Code" 
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s..." 
        />
        <Card 
          title="Get Started" 
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s..." 
        />
      </div>
      <button class="see-hives-btn more-info">More Info</button>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-columns">
        <div>
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-links">
            <li>Blog</li>
            <li>About</li>
            <li>Jobs</li>
          </ul>
        </div>
        <div>
          <h4 class="footer-heading">Product</h4>
          <ul class="footer-links">
            <li>Features</li>
            <li>Pricing</li>
            <li>Help Center</li>
          </ul>
        </div>
        <div>
          <h4 class="footer-heading">Q&A</h4>
          <ul class="footer-links">
            <li>Common Q</li>
            <li>Media</li>
            <li>Contact Info</li>
          </ul>
        </div>
      </div>
      <div class="footer-logo">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="28" stroke="black" stroke-width="3"/>
          <text x="18" y="38" font-size="16" fill="black">Bee</text>
        </svg>
        <h1 class="footer-brand">BeeVibe</h1>
      </div>
      <div class="footer-bottom">
        <p>Privacy policy · Privacy settings · Terms of service · Report issue</p>
      </div>
    </footer>
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
  height: 2px;
  background-color: black;
}

.bee-icon {
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 5rem 1.5rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.3;
  margin-top: 1.5rem;
}

/* Button */
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
  margin-bottom: 2rem;
}

/* Footer */
.footer {
  text-align: center;
  border-top: 1px solid black;
  padding: 2rem 1.5rem 1rem;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.footer-heading {
  font-weight: bold;
}

.footer-links {
  list-style: none;
  padding: 0;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.footer-links li {
  margin-bottom: 0.25rem;
}

.footer-logo {
  padding: 1.5rem 0;
}

.footer-brand {
  font-size: 2.25rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.footer-bottom {
  font-size: 0.75rem;
  padding-bottom: 1rem;
}
</style>
