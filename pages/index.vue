

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Hive List</h1>
    
    <div v-if="hives.length" class="grid gap-4">
      <div v-for="hive in hives" :key="hive.id" class="border p-4 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold">{{ hive.name }}</h2>
        <p><strong>Location:</strong> {{ hive.location }}</p>
        <p><strong>Description:</strong> {{ hive.description }}</p>
      </div>
    </div>

    <p v-else class="text-gray-500">No hives found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const hives = ref([]);

const fetchHives = async () => {
  try {
    const response = await fetch('/api/hives');
    hives.value = await response.json();
  } catch (error) {
    console.error('Error fetching hives:', error);
  }
};

onMounted(fetchHives);
</script>

<style scoped>
/* Optional Styling */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
