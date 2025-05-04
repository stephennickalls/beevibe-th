<template>
  <div class="page-layout">
    <div class="left-column">
      <NuxtLink to="/"><img src="/images/bee hollow.png" alt="Bee Icon" class="bee-icon" /></NuxtLink>

        <div class="left-buttons">
          <NuxtLink to="" class="left-btn"><img src="/images/apiary 3.png" alt="Apiary" class="bee-icon" /></NuxtLink>
          <NuxtLink to="" class="left-btn"><img src="/images/sensor hollow 3.png" alt="Apiary" class="bee-icon" /></NuxtLink>
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
  background-color: #d1f661; /* bright lime green background */
}

.left-column {
  width: 10%;
  background-color: #d1f661;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-buttons {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  margin-top: 2rem;
}

.left-btn {
  background-color: transparent;
  color: black;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.settings-btn {
  margin-top: auto;
  margin-bottom: 1rem;
}

/* Icon */
.bee-icon {
  width: 60px;
  height: 60px;
}

/* Right column */
.right-column {
  width: 90%;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: #d1f661;
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
  gap: 2rem;
}

.hive-card {
  display: flex;
  background-color: #2c2c2c; /* dark grey/black card */
  border-radius: 10px;
  color: white;
  padding: 1rem;
  align-items: center;
  justify-content: space-between;
}

.hive-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #d1f661;
  margin-bottom: 1rem;
}

.hive-card p {
  color: white;
}

.no-hives {
  color: #333;
}

/* Home button */
.see-hives-btn {
  display: inline-block;
  margin: 2rem 1rem 0;
  padding: 0.5rem 1rem;
  background-color: black;
  color: #d1f661;
  text-decoration: none;
  border-radius: 4px;
  border: 2px solid #d1f661;
}

.see-hives-btn:hover {
  background-color: #333;
}



</style>
