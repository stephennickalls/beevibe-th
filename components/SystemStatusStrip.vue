<template>
  <div v-if="showStatus" class="mb-2">
    <div class="bg-gray-900 rounded px-3 py-1 border border-gray-700">
      <div class="flex items-center justify-between">
        <!-- Left Side: Status Items -->
        <div class="flex items-center space-x-4">
          <span class="text-xs text-gray-400 font-medium">System:</span>
          
          <div class="flex items-center space-x-3 text-xs">
            <!-- Sensor Network Status -->
            <div class="flex items-center space-x-1">
              <div :class="['w-1.5 h-1.5 rounded-full', sensorNetworkStatus.color]"></div>
              <span class="text-gray-300">Network</span>
              <span :class="sensorNetworkStatus.textColor">{{ sensorNetworkStatus.label }}</span>
            </div>
            
            <!-- Data Sync Status -->
            <div class="flex items-center space-x-1">
              <div :class="['w-1.5 h-1.5 rounded-full', dataSyncStatus.color]"></div>
              <span class="text-gray-300">Sync</span>
              <span :class="dataSyncStatus.textColor">{{ dataSyncStatus.label }}</span>
            </div>
            
            <!-- Battery Status -->
            <div class="flex items-center space-x-1">
              <div :class="['w-1.5 h-1.5 rounded-full', batteryStatus.color]"></div>
              <span class="text-gray-300">Battery</span>
              <span :class="batteryStatus.textColor">{{ batteryStatus.label }}</span>
            </div>
          </div>
        </div>
        
        <!-- Right Side: Last Update -->
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-400">Updated {{ lastUpdateFormatted }}</span>
          <button 
            v-if="showRefresh"
            @click="$emit('refresh')"
            :disabled="refreshing"
            class="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            <svg :class="['w-3 h-3', refreshing && 'animate-spin']" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Status data
  onlineSensors: {
    type: Number,
    default: 0
  },
  totalSensors: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: [String, Date],
    default: null
  },
  lowBatterySensors: {
    type: Number,
    default: 0
  },
  dataSync: {
    type: Boolean,
    default: true
  },
  // UI options
  showStatus: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['refresh'])

// Computed properties
const sensorNetworkStatus = computed(() => {
  const total = props.totalSensors
  const online = props.onlineSensors
  
  if (total === 0) {
    return {
      color: 'bg-gray-400',
      textColor: 'text-gray-400',
      label: 'No sensors'
    }
  }
  
  const percentage = (online / total) * 100
  
  if (percentage >= 80) {
    return {
      color: 'bg-green-400',
      textColor: 'text-green-400',
      label: 'Online'
    }
  } else if (percentage >= 50) {
    return {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      label: 'Partial'
    }
  } else {
    return {
      color: 'bg-red-400',
      textColor: 'text-red-400',
      label: 'Issues'
    }
  }
})

const dataSyncStatus = computed(() => {
  if (props.dataSync) {
    return {
      color: 'bg-green-400',
      textColor: 'text-green-400',
      label: 'Synced'
    }
  } else {
    return {
      color: 'bg-red-400',
      textColor: 'text-red-400',
      label: 'Error'
    }
  }
})

const batteryStatus = computed(() => {
  const lowBattery = props.lowBatterySensors
  const total = props.totalSensors
  
  if (total === 0) {
    return {
      color: 'bg-gray-400',
      textColor: 'text-gray-400',
      label: 'N/A'
    }
  }
  
  if (lowBattery === 0) {
    return {
      color: 'bg-green-400',
      textColor: 'text-green-400',
      label: 'Good'
    }
  } else if (lowBattery <= total * 0.2) {
    return {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      label: 'Low'
    }
  } else {
    return {
      color: 'bg-red-400',
      textColor: 'text-red-400',
      label: 'Critical'
    }
  }
})

const lastUpdateFormatted = computed(() => {
  if (!props.lastUpdate) return 'Never'
  
  const now = new Date()
  const updateTime = new Date(props.lastUpdate)
  const diff = now - updateTime
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
})
</script>

<style scoped>
/* Status indicator colors */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-yellow-400 {
  background-color: #facc15;
}

.bg-red-400 {
  background-color: #f87171;
}

.bg-gray-400 {
  background-color: #9ca3af;
}

.text-green-400 {
  color: #4ade80;
}

.text-yellow-400 {
  color: #facc15;
}

.text-red-400 {
  color: #f87171;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-300 {
  color: #d1d5db;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-blue-300 {
  color: #93c5fd;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Spin animation for refresh button */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Border styles */
.border-gray-700 {
  border-color: #374151;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-x-4 {
    gap: 0.5rem;
  }
  
  .space-x-3 {
    gap: 0.4rem;
  }
  
  .text-xs {
    font-size: 0.6rem;
    line-height: 0.875rem;
  }
}
</style>