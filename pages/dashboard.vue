<template>
  <div class="page-layout">
    <div class="left-column">
      <NuxtLink to="/"><img src="/images/bee hollow.png" alt="Bee Icon" class="bee-icon" /></NuxtLink>

        <div class="left-buttons">
          <NuxtLink to="" class="left-btn"><img src="/images/apiary 3.png" alt="Apiary" class="nav-icon" /></NuxtLink>
          <NuxtLink to="" class="left-btn"><img src="/images/sensor hollow 3.png" alt="Sensor" class="nav-icon" /></NuxtLink>
          <NuxtLink to="" class="left-btn">Other</NuxtLink>
          <NuxtLink to="" class="left-btn settings-btn">Settings</NuxtLink>
        </div>

      
    </div>

    <div class="right-column">
      <!-- Hive List -->
      <div id="hive-list" class="hive-list">
        <h2 class="hive-title">Hives</h2>
        <button class="btn" @click="showModal = true">Add Hive</button>

          <!-- Modal Form -->
          <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
              <h3>{{ isEditing ? 'Edit Hive' : 'Add New Hive' }}</h3>
              <form @submit.prevent="addHive">
                <input v-model="form.name" type="text" placeholder="Hive Name" required />
                <input v-model.number="form.latitude" type="text" placeholder="Latitude" required />
                <input v-model.number="form.longitude" type="text" placeholder="Longitude" required />
                <textarea v-model="form.description" placeholder="Description"></textarea>
                <div class="modal-actions">
                  <button type="button" @click="showModal = false">Cancel</button>
                  <button type="submit">{{ isEditing ? 'Update' : 'Save' }}</button>
                </div>
              </form>
            </div>
          </div>

        <div v-if="hives.length" class="hive-grid">
          <div
            v-for="hive in hives"
            :key="hive.id"
            class="hive-card"

            
          >
            <h3 class="hive-name">{{ hive.name }}</h3>
            <p><strong>Location:</strong> {{ hive.location }}</p>
            <p><strong>Description:</strong> {{ hive.description }}</p>

            <!-- Button group -->
            <div class="hive-actions">
              <button class="invert-btn" @click="addSensor(hive.id)">Add Sensor</button>
              <button class="invert-btn" @click="editHive(hive)">Edit Hive</button>
              <button class="invert-btn" @click="deleteHive(hive.id)">Delete Hive</button>
            </div>

          </div>


        </div>
        <p v-else class="no-hives">No hives found.</p>
      </div>

      <NuxtLink to="/" class="btn">Home</NuxtLink>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";

const isEditing = ref(false);
const editingHiveId = ref(null);
const hives = ref([]);
const showModal = ref(false);
const form = ref({
  name: '',
  latitude: null,
  longitude: null,
  description: '',
});


const fetchHives = async () => {
  try {
    const response = await fetch("/api/hives");
    hives.value = await response.json();
  } catch (error) {
    console.error("Error fetching hives:", error);
  }
};



const addHive = async () => {
  try {
    const method = isEditing.value ? 'PUT' : 'POST';
    const url = isEditing.value ? `/api/hives/${editingHiveId.value}` : '/api/hives';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    showModal.value = false;
    form.value = { name: '', latitude: null, longitude: null, description: '' };
    isEditing.value = false;
    editingHiveId.value = null;
    fetchHives(); // Refresh list
  } catch (error) {
    console.error('Error saving hive:', error);
  }
};

const editHive = (hive) => {
  form.value = {
    name: hive.name,
    latitude: hive.latitude,
    longitude: hive.longitude,
    description: hive.description || '',
  };
  editingHiveId.value = hive.id;
  isEditing.value = true;
  showModal.value = true;
};

const addSensor = (hiveId) => {
  // Replace this with actual logic later
  alert(`Add Sensor to Hive ID: ${hiveId}`);
};

const deleteHive = async (hiveId) => {
  if (!confirm("Are you sure you want to delete this hive?")) return;

  try {
    await fetch(`/api/hives/${hiveId}`, {
      method: 'DELETE',
    });
    fetchHives(); // Refresh list
  } catch (error) {
    console.error("Error deleting hive:", error);
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
  background-color: #d1f661;
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

.nav-icon {
  width: 40px;
  height: 40px;
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

.see-hives-btn:hover {
  background-color: #333;
}

 /* ---Modal Section--- */
 .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 1rem;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}



</style>
