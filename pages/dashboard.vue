<template>
  <div class="page-layout">
    <div class="left-column">
      <NuxtLink to="/">
        <!-- <img 
          src="/images/bee hollow.png"
          alt="Bee Icon"
          class="bee-icon"
        />  -->

      </NuxtLink>
      <div class="left-buttons">
        <NuxtLink to="" class="left-btn">
          <!-- <img 
            src="/images/apiary 3.png"
            alt="Apiary"
            class="nav-icon"
          />  -->
        </NuxtLink>
        <NuxtLink to="" class="left-btn">
          <!-- <img 
            src="/images/sensor hollow 3.png"
            alt="Sensor"
            class="nav-icon"
          />  -->
        </NuxtLink>
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
            <form @submit.prevent="submitHive">
              <input
                v-model="form.name"
                type="text"
                placeholder="Hive Name"
                required
              />
              <input
                v-model.number="form.latitude"
                type="text"
                placeholder="Latitude"
                required
              />
              <input
                v-model.number="form.longitude"
                type="text"
                placeholder="Longitude"
                required
              />
              <textarea
                v-model="form.description"
                placeholder="Description"
              ></textarea>
              <div class="modal-actions">
                <button type="button" @click="showModal = false">Cancel</button>

                <button type="submit">
                  {{ isEditing ? 'Update' : 'Save' }}
                </button>

                <button
                  v-if="isEditing"
                  type="button"
                  class="delete-btn"
                  @click="confirmDeleteHive"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>


        <!-- Updated Hive Cards -->
        <div v-if="hives.length" class="hive-grid">
          <div
            v-for="hive in hives"
            :key="hive.id"
            class="example-hive-card"
          >
            <div class="example-left">
              <button class="icon-btn">
                <!-- <img src="/images/temperature.png" alt="Temperature Icon" /> -->
              </button>
              <button class="icon-btn">
                <!-- <img src="/images/humidity.png" alt="Humidity Icon" /> -->
              </button>
              <button class="icon-btn">
                <!-- <img src="/images/weight.png" alt="Weight Icon" /> -->
              </button>
              <button class="icon-btn empty"></button>
              <button class="add-btn" @click="addSensor(hive.id)">Add</button>
            </div>

            <div class="example-right">
              <h3>{{ hive.name }}</h3>

              <div class="card-actions">
                <button class="edit-btn" @click="editHive(hive)">Edit</button>
                <button class="delete-btn" @click="deleteHive(hive.uuid)">Delete</button>
              </div>
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
import { ref, onMounted } from 'vue';

const isEditing = ref(false);
const editingHiveId = ref(null);
const hives = ref([]);
const showModal = ref(false);
const form = ref({ name: '', latitude: null, longitude: null, description: '' });

const fetchHives = async () => {
  try {
    const response = await fetch('/api/hives');
    hives.value = await response.json();
  } catch (error) {
    console.error('Error fetching hives:', error);
  }
};

const submitHive = async () => {
  try {
    const method = isEditing.value ? 'PUT' : 'POST';
    const url = isEditing.value
      ? `/api/hive/${editingHiveId.value}`
      : '/api/hive';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    showModal.value = false;
    resetForm();
    fetchHives();
  } catch (error) {
    console.error('Error saving hive:', error);
  }
};

const confirmDeleteHive = async () => {
  if (!confirm('Are you sure you want to delete this hive?')) return;
  try {
    await fetch(`/api/hive/${editingHiveId.value}`, {
      method: 'DELETE',
    });

    showModal.value = false;
    resetForm();
    fetchHives();
  } catch (error) {
    console.error('Error deleting hive:', error);
  }
};

const resetForm = () => {
  form.value = { name: '', latitude: null, longitude: null, description: '' };
  isEditing.value = false;
  editingHiveId.value = null;
};


const editHive = (hive) => {
  form.value = {
    name: hive.name,
    latitude: hive.latitude,
    longitude: hive.longitude,
    description: hive.description || '',
  };
  editingHiveId.value = hive.uuid;
  isEditing.value = true;
  showModal.value = true;
};




const addSensor = (hiveId) => {
  alert(`Add Sensor to Hive ID: ${hiveId}`);
};

const deleteHive = async (hiveUuid) => {
  if (!confirm('Are you sure you want to delete this hive?')) return;
  try {
    await fetch(`/api/hive/${hiveUuid}`, { method: 'DELETE' });
    fetchHives();
  } catch (error) {
    console.error('Error deleting hive:', error);
  }
};


onMounted(fetchHives);
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
}

.settings-btn {
  margin-top: auto;
  margin-bottom: 1rem;
}

.bee-icon {
  width: 60px;
  height: 60px;
}

.nav-icon {
  width: 40px;
  height: 40px;
}

.right-column {
  width: 90%;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: #d1f661;
}

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

/* Example Hive Card Styles */
.example-hive-card {
  display: flex;
  background-color: #d1f661;
  border: 2px solid #333;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.example-left {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-right: 2px solid #333;
}

.icon-btn {
  background: #d1f661;
  border: 2px solid #333;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn img {
  width: 24px;
  height: 24px;
}

.icon-btn.empty {
  height: 48px;
  border: 2px solid #333;
  background: transparent;
}

.add-btn {
  margin-top: auto;
  padding: 0.5rem;
  border: 2px solid #333;
  background: #d1f661;
  cursor: pointer;
}

.example-right {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.example-right h3 {
  margin-bottom: 0.5rem;
}

.example-graph {
  max-width: 100%;
  height: auto;
}

/* Modal Styles */
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

/* -------------------- */

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}


</style>
