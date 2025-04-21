<template>
  <div class="page-layout">
    <div class="left-column">
      <NuxtLink to="/"><img src="/images/bee hollow.png" alt="Bee Icon" class="bee-icon" /></NuxtLink>

        <div class="left-buttons">
          <NuxtLink to="" class="left-btn">Hives</NuxtLink>
          <NuxtLink to="" class="left-btn">Sensors</NuxtLink>
          <NuxtLink to="" class="left-btn">Other</NuxtLink>
          <NuxtLink to="" class="left-btn settings-btn">Settings</NuxtLink>
        </div>

      
    </div>

    <div class="right-column">
      <!-- Hive List -->
      <div id="hive-list" class="hive-list">
        <h2 class="hive-title">Hive List</h2>
        <div v-if="hives.length" class="hive-grid">
          <div
            v-for="hive in hives"
            :key="hive.id"
            class="hive-card"
          >
            <h3 class="hive-name">{{ hive.name }}</h3>
            <p><strong>Location:</strong> {{ hive.location }}</p>
            <p><strong>Description:</strong> {{ hive.description }}</p>
          </div>
        </div>
        <p v-else class="no-hives">No hives found.</p>
      </div>

      <NuxtLink to="/" class="see-hives-btn">Home</NuxtLink>
    </div>
  </div>
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

<style scoped>
.page-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.left-column {
  width: 10%;
  background-color: #f0f0f0;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.left-buttons {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  text-align: center;
}

.left-btn:hover {
  background-color: #0056b3;
}

.settings-btn {
  margin-top: auto;
}


/* Icon */
.bee-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

/* Right column */
.right-column {
  width: 90%;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
}

/* Hive list */
.hive-list {
  padding: 1.5rem;
}

.hive-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hive-grid {
  display: grid;
  gap: 1rem;
}

.hive-card {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.hive-name {
  font-size: 1.25rem;
  font-weight: 600;
}

.no-hives {
  color: #555;
}

/* Home link button */
.see-hives-btn {
  display: inline-block;
  margin: 2rem 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}

.see-hives-btn:hover {
  background-color: #0056b3;
}



</style>
