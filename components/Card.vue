<template>
  <div class="news-card">
    <div class="news-header">
      <span class="news-title">{{ title }}</span>
      <svg class="news-options" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </div>
    <div class="news-image"></div>
    <div class="news-text">
      {{ description }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>

<style scoped>
.news-card {
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
  /* box-shadow: 0 0 10px rgba(0,0,0,0.1); */
  overflow: hidden;
  font-family: sans-serif;
  /* background: white; */
  border: 1.5px solid #000000;
}

.news-header {
  font-weight: bold;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  /* background: #fff; */
  border-bottom: 1.5px solid #000000;
}

.news-options {
  cursor: pointer;
  fill: #000;
}

.news-image {
  height: 160px;
  background-color: #e0e0e0; 
}

.news-text {
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  border-top: 1.5px solid #000000;
}

.news-text .highlight {
  background-color: #ffc107;
  color: black;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
