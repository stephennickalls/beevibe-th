<template>
  <div 
    @click="handleHiveClick"
    class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600 relative"
  >
    <!-- Hive Header -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-lg truncate">{{ hive.name || `Hive ${hive.id}` }}</h3>
        <p v-if="hive.description" class="text-xs text-gray-400 truncate">
          {{ hive.description }}
        </p>
        <p v-else class="text-xs text-gray-400">No description</p>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <div :class="hiveStatus.color" class="w-2 h-2 rounded-full"></div>
        <span class="text-xs" :class="hiveStatus.textColor">{{ hiveStatus.status }}</span>
      </div>
    </div>

    <!-- Detailed Sensors List -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-300">Sensors</h4>
        <span class="text-xs text-gray-400">{{ hive.sensor_count || 0 }} total</span>
      </div>
      
      <!-- No Sensors State -->
      <div v-if="!hive.sensors || hive.sensors.length === 0" class="text-center py-6 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        <p class="text-xs text-gray-500">No sensors installed</p>
        <p class="text-xs text-gray-600 mt-1">Click to add sensors</p>
      </div>
      
      <!-- Sensors List -->
      <div v-else class="space-y-2 max-h-40 overflow-y-auto">
        <SensorListItem
          v-for="sensor in hive.sensors"
          :key="sensor.id"
          :sensor="sensor"
          @click.stop="handleSensorClick(sensor)"
        />
      </div>
    </div>

    <!-- Hive Footer -->
    <div class="flex justify-between items-center pt-3 border-t border-gray-700">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-400">
          Updated {{ formatTime(hive.last_sensor_reading || hive.updated_at) }}
        </span>
        <div v-if="hive.online_sensor_count > 0" class="flex items-center space-x-1">
          <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          <span class="text-xs text-green-400">{{ hive.online_sensor_count }}/{{ hive.sensor_count }} online</span>
        </div>
      </div>
      <span class="text-xs text-blue-400">View Hive Details →</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SensorListItem from './SensorListItem.vue'

// Props
const props = defineProps({
  hive: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click', 'sensor-click'])

// Handle hive click - navigate directly to hive page using UUID
const handleHiveClick = () => {
  // Use UUID if available, otherwise fall back to numeric ID
  const hiveIdentifier = props.hive.uuid || props.hive.id
  
  console.log('HiveCard: Navigating to hive:', {
    name: props.hive.name,
    id: props.hive.id,
    uuid: props.hive.uuid,
    using: hiveIdentifier
  })
  
  // Navigate directly to the hive details page
  navigateTo(`/hives/${hiveIdentifier}`)
}

// Handle sensor click (prevent event bubbling)
const handleSensorClick = (sensor) => {
  emit('sensor-click', sensor, props.hive)
}

// Utility function to format time
const formatTime = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

// Computed properties
const hiveStatus = computed(() => {
  const temp = props.hive.temperature
  const humidity = props.hive.humidity
  
  if (!temp || !humidity) {
    return { status: 'No Data', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  if (temp < 30 || temp > 40 || humidity < 45 || humidity > 75) {
    return { status: 'Alert', color: 'bg-red-400', textColor: 'text-red-400' }
  } else if (temp < 32 || temp > 38 || humidity < 50 || humidity > 70) {
    return { status: 'Warning', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
  } else {
    return { status: 'Healthy', color: 'bg-green-400', textColor: 'text-green-400' }
  }
})
</script>