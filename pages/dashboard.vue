<template>
    <div id="hive-list" class="p-6">
      <h2 class="text-2xl font-bold mb-4">Hive List</h2>

      <div v-if="hives.length" class="grid gap-4">
        <div
          v-for="hive in hives"
          :key="hive.id"
          class="border p-4 rounded-lg shadow-lg bg-white"
        >
          <h3 class="text-xl font-semibold">{{ hive.name }}</h3>
          <p><strong>Location:</strong> {{ hive.location }}</p>
          <p><strong>Description:</strong> {{ hive.description }}</p>
        </div>
      </div>

      <p v-else class="text-gray-700">No hives found.</p>
    </div>

    <NuxtLink to="/" class="see-hives-btn">Home</NuxtLink>
</template>

<script setup>
import { ref, onMounted } from "vue";

const hives = ref([]);

const fetchHives = async () => {
  try {
    const response = await fetch("/api/hives");
    hives.value = await response.json();
  } catch (error) {
    console.error("Error fetching hives:", error);
  }
};

onMounted(fetchHives);

const scrollToHives = () => {
  document.getElementById("hive-list").scrollIntoView({ behavior: "smooth" });
};
</script>

<style lang="scss" scoped>

</style>