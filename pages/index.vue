<template>
  <div class="min-h-screen bg-custom-green font-sans text-custom-gray">
    <!-- Hero Section -->
    <div class="text-center py-20 px-6">
      <div class="flex justify-start items-center px-6">
        <!--img src="@/assets/logo.svg" alt="Bee Logo" class="w-8 h-8"-->
      </div>
      <hr class="border-black my-4">
      <h1 class="text-4xl font-bold">Real-Time Insights<br>For a Healthier Hive</h1>
      <button class="mt-4 px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100" @click="scrollToHives">
        See Hives
      </button>
    </div>

    <!-- Hive List Section -->
    <div id="hive-list" class="p-6">
      <h2 class="text-2xl font-bold mb-4">Hive List</h2>
      
      <div v-if="hives.length" class="grid gap-4">
        <div v-for="hive in hives" :key="hive.id" class="border p-4 rounded-lg shadow-lg bg-white">
          <h3 class="text-xl font-semibold">{{ hive.name }}</h3>
          <p><strong>Location:</strong> {{ hive.location }}</p>
          <p><strong>Description:</strong> {{ hive.description }}</p>
        </div>
      </div>

      <p v-else class="text-gray-700">No hives found.</p>
    </div>
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

const scrollToHives = () => {
  document.getElementById('hive-list').scrollIntoView({ behavior: 'smooth' });
};
</script>

<style>
/* Custom background color */
.bg-custom-green {
  background-color: #D1F661;
}

/* Text color */
.text-custom-gray {
  color: #212121;
}

/* Apply Open Sans font */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

.font-sans {
  font-family: 'Open Sans', sans-serif;
}

/* Ensure grid layout adapts */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Remove white space around edges */
html, body {
  margin: 0;
  padding: 0;
  background-color: #D1F661;
}
</style>
