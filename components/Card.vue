<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>

<style scoped>
.card {
  
  border: 2px solid black;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  min-height: 200px;

}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card h3 {
  font-size: 1.25rem;
  font-weight: bold;
  position: relative;
  margin-bottom: 1rem;
}

.card h3::after {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background-color: black;
  margin-top: 0.5rem;
}


.card p {
  font-size: 0.9rem;
  color: #333;
}
</style>
