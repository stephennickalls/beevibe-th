<template>
  <div class="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-2">
          <h1 class="text-3xl font-bold text-white">{{ apiary.name }}</h1>
          
          <!-- Live Status Indicator -->
          <div class="flex items-center gap-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              statusColor,
              { 'animate-pulse': isLive }
            ]"></div>
            <span :class="statusTextColor" class="text-sm font-medium">
              {{ statusText }}
            </span>
          </div>
          
          <!-- Health Score Badge -->
          <div :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            healthScoreBadgeClass
          ]">
            Health: {{ healthScore }}%
          </div>
        </div>
        
        <p class="text-gray-400 mb-4">{{ apiary.description || 'No description provided' }}</p>
        
        <!-- Quick Info Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-xs text-gray-400">Location</div>
            <div class="text-sm text-white">
              {{ locationText }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Established</div>
            <div class="text-sm text-white">{{ formatDate(apiary.installation_date) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Last Activity</div>
            <div class="text-sm text-white">{{ lastActivity }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Weather</div>
            <div class="text-sm text-white">{{ weatherText }}</div>
          </div>
        </div>
      </div>
      
      <!-- Settings & Action Buttons -->
      <div class="flex gap-2 ml-6">
        <button 
          @click="toggleSettingsDropdown"
          class="relative px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
          Settings
          
          <!-- Settings Dropdown -->
          <div v-if="showSettingsDropdown" class="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            <div class="py-1">
              <button 
                @click="handleEditApiary"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Edit Apiary
              </button>
              <button 
                @click="handleAlertSettings"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"/>
                </svg>
                Alert Settings
              </button>
              <div class="border-t border-gray-700 my-1"></div>
              <button 
                @click="handleDeleteApiary"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                </svg>
                Delete Apiary
              </button>
            </div>
          </div>
        </button>
        
        <button 
          @click="$emit('refresh')"
          :disabled="refreshing"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': refreshing }" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  apiary: {
    type: Object,
    required: true
  },
  healthScore: {
    type: Number,
    default: 100
  },
  isLive: {
    type: Boolean,
    default: false
  },
  hasOnlineHub: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: String,
    default: 'No recent activity'
  },
  weatherText: {
    type: String,
    default: '22°C, Sunny'
  }
})

// Emits
const emit = defineEmits([
  'refresh',
  'editApiary', 
  'alertSettings', 
  'deleteApiary'
])

// Local state
const showSettingsDropdown = ref(false)

// Computed properties
const statusColor = computed(() => {
  if (!props.apiary?.is_active) return 'bg-gray-400'
  if (props.hasOnlineHub) return 'bg-green-400'
  return 'bg-yellow-400'
})

const statusTextColor = computed(() => {
  if (!props.apiary?.is_active) return 'text-gray-400'
  if (props.hasOnlineHub) return 'text-green-400'
  return 'text-yellow-400'
})

const statusText = computed(() => {
  if (!props.apiary?.is_active) return 'Inactive'
  if (props.hasOnlineHub) return 'Active & Connected'
  return 'Setup Required'
})

const healthScoreBadgeClass = computed(() => {
  const score = props.healthScore
  if (score >= 90) return 'bg-green-900/30 text-green-400 border border-green-500/30'
  if (score >= 70) return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
  return 'bg-red-900/30 text-red-400 border border-red-500/30'
})

const locationText = computed(() => {
  if (props.apiary.address) return props.apiary.address
  const lat = parseFloat(props.apiary.latitude || 0).toFixed(4)
  const lng = parseFloat(props.apiary.longitude || 0).toFixed(4)
  return `${lat}, ${lng}`
})

// Methods
const formatDate = (dateStr) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString()
}

const toggleSettingsDropdown = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value
}

const handleEditApiary = () => {
  showSettingsDropdown.value = false
  emit('editApiary')
}

const handleAlertSettings = () => {
  showSettingsDropdown.value = false
  emit('alertSettings')
}

const handleDeleteApiary = () => {
  showSettingsDropdown.value = false
  emit('deleteApiary')
}

// Click outside handler
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showSettingsDropdown.value = false
  }
}

// Expose method for parent to close dropdown
defineExpose({
  closeDropdown: () => {
    showSettingsDropdown.value = false
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>