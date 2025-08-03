
<template>
  <div class="pricing-page">
    <div class="container">
      <!-- Compact Header -->
      <div class="header">
        <h1>Choose Your Plan 🐝</h1>
        <p>Monitor your beehives with real-time IoT sensors. Pick the perfect plan for your beekeeping needs.</p>
      </div>

      <!-- Compact Pricing Cards -->
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3 class="card-title">Starter</h3>
          <div class="card-price">$29<span>/mo</span></div>
          <p class="card-description">For hobbyist beekeepers</p>
          <ul class="card-features">
            <li>3 hives max</li>
            <li>Temp & humidity</li>
            <li>Email alerts</li>
            <li>7-day history</li>
            <li>Mobile app</li>
          </ul>
          <button class="cta-button" @click="handleSubscription('starter')">
            Start Buzzing
          </button>
        </div>

        <div class="pricing-card featured">
          <h3 class="card-title">Professional</h3>
          <div class="card-price">$79<span>/mo</span></div>
          <p class="card-description">For serious beekeepers</p>
          <ul class="card-features">
            <li>10 hives max</li>
            <li>Full sensor suite</li>
            <li>SMS & push alerts</li>
            <li>90-day history</li>
            <li>Analytics dashboard</li>
            <li>Priority support</li>
          </ul>
          <button class="cta-button" @click="handleSubscription('professional')">
            Go Pro
          </button>
        </div>

        <div class="pricing-card">
          <h3 class="card-title">Enterprise</h3>
          <div class="card-price">$199<span>/mo</span></div>
          <p class="card-description">For commercial operations</p>
          <ul class="card-features">
            <li>Unlimited hives</li>
            <li>AI insights</li>
            <li>API access</li>
            <li>24/7 support</li>
            <li>Custom integrations</li>
            <li>Team tools</li>
          </ul>
          <button class="cta-button" @click="handleSubscription('enterprise')">
            Scale Up
          </button>
        </div>
      </div>

      <!-- Compact Comparison Table -->
      <div class="comparison">
        <h2>Quick Comparison</h2>
        <div class="table-container">
          <div class="table-header">
            <div>Feature</div>
            <div>Starter</div>
            <div>Professional</div>
            <div>Enterprise</div>
          </div>
          
          <div 
            v-for="feature in comparisonFeatures" 
            :key="feature.name"
            class="table-row"
          >
            <div>{{ feature.name }}</div>
            <div v-html="feature.starter"></div>
            <div v-html="feature.professional"></div>
            <div v-html="feature.enterprise"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta tags for SEO
useHead({
  title: 'Pricing - BeeVibe Hive Monitoring',
  meta: [
    { 
      name: 'description', 
      content: 'Choose the perfect BeeVibe plan for your beehive monitoring needs. From hobbyist to commercial operations.' 
    }
  ]
})

// Page meta
definePageMeta({
  title: 'Pricing - BeeVibe'
})

// Reactive data for comparison table
const comparisonFeatures = ref([
  {
    name: 'Hive Limit',
    starter: '3',
    professional: '10',
    enterprise: '∞'
  },
  {
    name: 'Temperature',
    starter: '<span class="checkmark">✓</span>',
    professional: '<span class="checkmark">✓</span>',
    enterprise: '<span class="checkmark">✓</span>'
  },
  {
    name: 'Weight Monitor',
    starter: '<span class="cross">✗</span>',
    professional: '<span class="checkmark">✓</span>',
    enterprise: '<span class="checkmark">✓</span>'
  },
  {
    name: 'SMS Alerts',
    starter: '<span class="cross">✗</span>',
    professional: '<span class="checkmark">✓</span>',
    enterprise: '<span class="checkmark">✓</span>'
  },
  {
    name: 'AI Insights',
    starter: '<span class="cross">✗</span>',
    professional: '<span class="cross">✗</span>',
    enterprise: '<span class="checkmark">✓</span>'
  },
  {
    name: 'API Access',
    starter: '<span class="cross">✗</span>',
    professional: '<span class="cross">✗</span>',
    enterprise: '<span class="checkmark">✓</span>'
  }
])

// Methods
const handleSubscription = async (planType) => {
  console.log(`Selected plan: ${planType}`)
  
  // Example: Navigate to checkout or show modal
  // await navigateTo(`/checkout?plan=${planType}`)
  
  // Example: Call API to create subscription
  // const { data } = await $fetch('/api/subscriptions', {
  //   method: 'POST',
  //   body: { plan: planType }
  // })
  
  // For now, just show an alert
  alert(`You selected the ${planType} plan! Redirecting to checkout...`)
}

// Lifecycle
onMounted(() => {
  // Add hover effects after component mounts
  nextTick(() => {
    const cards = document.querySelectorAll('.pricing-card')
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = card.classList.contains('featured') 
          ? 'translateY(-5px) scale(1.02)' 
          : 'translateY(-5px)'
      })
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = card.classList.contains('featured') 
          ? 'scale(1.02)' 
          : ''
      })
    })
  })
})
</script>

<style scoped>
/* Import Open Sans font */
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap");

.pricing-page {
  font-family: 'Open Sans', sans-serif;
  background-color: #d1f661;
  color: #212121;
  min-height: 100vh;
  line-height: 1.4;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
}

/* Compact Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeIn 0.8s ease-out;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
  margin: 0 auto;
}

/* Compact Pricing Cards */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pricing-card {
  background: white;
  border: 2px solid #212121;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  animation: slideUp 0.6s ease-out;
}

.pricing-card:nth-child(1) { animation-delay: 0.1s; }
.pricing-card:nth-child(2) { animation-delay: 0.2s; }
.pricing-card:nth-child(3) { animation-delay: 0.3s; }

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(33, 33, 33, 0.15);
}

.pricing-card.featured {
  border-color: #212121;
  border-width: 3px;
  transform: scale(1.02);
}

.pricing-card.featured::before {
  content: '⭐ POPULAR';
  position: absolute;
  top: -10px;
  right: -10px;
  background: #212121;
  color: #d1f661;
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  transform: rotate(12deg);
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.card-price {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.card-price span {
  font-size: 0.9rem;
  opacity: 0.7;
}

.card-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.card-features {
  list-style: none;
  text-align: left;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  padding: 0;
}

.card-features li {
  padding: 0.4rem 0;
  position: relative;
  padding-left: 1.2rem;
}

.card-features li::before {
  content: '🐝';
  position: absolute;
  left: 0;
  font-size: 0.9rem;
}

.cta-button {
  background: #212121;
  color: #d1f661;
  border: 2px solid #212121;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cta-button:hover {
  background: #d1f661;
  color: #212121;
  transform: translateY(-2px);
}

/* Compact Comparison Table */
.comparison {
  margin-top: 1.5rem;
}

.comparison h2 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.table-container {
  background: white;
  border: 2px solid #212121;
  border-radius: 15px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: #212121;
  color: #d1f661;
}

.table-header > div {
  padding: 0.8rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
}

.table-header > div:first-child {
  text-align: left;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid rgba(33, 33, 33, 0.1);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row > div {
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 500;
}

.table-row > div:first-child {
  justify-content: flex-start;
  font-weight: 600;
}

:deep(.checkmark) {
  color: #16a34a;
  font-size: 1.2rem;
  font-weight: bold;
}

:deep(.cross) {
  color: #dc2626;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pricing-card.featured {
    transform: none;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-header > div:first-child,
  .table-row > div:first-child {
    text-align: center;
    background: rgba(209, 246, 97, 0.3);
    font-weight: 700;
  }

  .table-row > div {
    padding: 0.6rem;
  }
}
</style>