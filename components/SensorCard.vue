<template>
  <div
    @click="$emit('click', sensor)"
    class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section: Main Info -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- Sensor Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <svg v-if="sensor.sensor_type === 'temperature'" class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'humidity'" class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'weight'" class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'sound'" class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'vibration'" class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 001.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'activity'" class="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 001.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900',
            sensor.is_online ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
        </div>

        <!-- Sensor Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-white truncate">
              {{ sensor.name || `${formatSensorType(sensor.sensor_type)} Sensor` }}
            </h3>
            <!-- Sensor Type Badge with matching colors -->
            <span :class="[
              'px-2 py-0.5 text-xs font-medium rounded-full',
              getSensorTypeBadgeColor(sensor.sensor_type)
            ]">
              {{ formatSensorType(sensor.sensor_type) }}
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>{{ sensor.hives?.name || 'Unassigned' }}</span>
            </div>
            
            <div v-if="sensor.model" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>{{ sensor.model }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Status & Metrics -->
      <div class="flex items-center space-x-4">
        <!-- Latest Reading -->
        <div v-if="sensor.latest_reading" class="text-right">
          <div class="text-lg font-semibold text-white">
            {{ formatSensorValue(sensor.latest_reading.value, sensor.latest_reading.unit) }}
          </div>
          <div class="text-xs text-gray-400">
            {{ formatLastSeen(sensor.latest_reading.reading_time) }}
          </div>
        </div>

        <!-- Battery Level -->
        <div class="flex flex-col items-center">
          <div :class="[
            'text-xs font-medium mb-1',
            getBatteryColor(sensor.battery_level)
          ]">
            {{ sensor.battery_level || 0 }}%
          </div>
          <div class="w-6 h-10 bg-gray-700 rounded border flex flex-col justify-end">
            <div 
              :class="[
                'rounded transition-all duration-300',
                getBatteryFillColor(sensor.battery_level)
              ]"
              :style="{ height: `${sensor.battery_level || 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex flex-col items-end space-y-1">
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            sensor.is_online 
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-red-900/30 text-red-400 border border-red-500/30'
          ]">
            {{ sensor.is_online ? 'Online' : 'Offline' }}
          </span>
        </div>

        <!-- Arrow Icon -->
        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  sensor: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click'])

// Enhanced styling function for badges using the same color scheme
const getSensorTypeBadgeColor = (type) => {
  const colors = {
    'temperature': 'bg-red-900/30 text-red-400 border border-red-500/30',
    'humidity': 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
    'weight': 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
    'sound': 'bg-green-900/30 text-green-400 border border-green-500/30',
    'vibration': 'bg-purple-900/30 text-purple-400 border border-purple-500/30',
    'activity': 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30'
  }
  return colors[type] || 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
}

// Using same color scheme as SensorListItem
const getBatteryColor = (level) => {
  if (!level) return 'text-gray-400'
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const getBatteryFillColor = (level) => {
  if (level >= 50) return 'bg-green-400'
  if (level >= 20) return 'bg-yellow-400'
  return 'bg-red-400'
}

// Utility functions matching SensorListItem
const formatSensorType = (type) => {
  const labels = {
    'temperature': 'Temperature',
    'humidity': 'Humidity', 
    'weight': 'Weight Scale',
    'sound': 'Sound Level',
    'vibration': 'Vibration',
    'activity': 'Activity'
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const formatSensorValue = (value, unit) => {
  if (value === null || value === undefined) return 'No data'
  
  const numValue = parseFloat(value)
  const type = props.sensor.sensor_type
  
  switch (type) {
    case 'temperature':
      return `${numValue.toFixed(1)}°C`
    case 'humidity':
      return `${numValue.toFixed(1)}%`
    case 'weight':
      return `${(numValue / 1000).toFixed(1)}kg`
    default:
      return unit ? `${numValue.toFixed(1)}${unit}` : numValue.toFixed(1)
  }
}

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never'
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>

<style scoped>
/* Transition effects matching SensorListItem */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Hover effects */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Status indicator colors matching SensorListItem */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-red-400 {
  background-color: #f87171;
}

.bg-yellow-400 {
  background-color: #facc15;
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

.text-blue-400 {
  color: #60a5fa;
}

.text-purple-400 {
  color: #c084fc;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-gray-400 {
  color: #9ca3af;
}

/* Background colors - matching dashboard scheme */
.bg-gray-900 {
  background-color: #111827;
}

.bg-gray-800 {
  background-color: #1f2937;
}

.bg-gray-700 {
  background-color: #374151;
}

.border-gray-700 {
  border-color: #374151;
}

.border-gray-600 {
  border-color: #4b5563;
}

/* Badge background with opacity - matching icon colors */
.bg-red-900\/30 {
  background-color: rgba(127, 29, 29, 0.3);
}

.bg-blue-900\/30 {
  background-color: rgba(30, 58, 138, 0.3);
}

.bg-yellow-900\/30 {
  background-color: rgba(113, 63, 18, 0.3);
}

.bg-green-900\/30 {
  background-color: rgba(20, 83, 45, 0.3);
}

.bg-purple-900\/30 {
  background-color: rgba(88, 28, 135, 0.3);
}

.bg-indigo-900\/30 {
  background-color: rgba(49, 46, 129, 0.3);
}

.bg-gray-900\/30 {
  background-color: rgba(17, 24, 39, 0.3);
}

/* Border colors with opacity - matching icon colors */
.border-red-500\/30 {
  border-color: rgba(239, 68, 68, 0.3);
}

.border-blue-500\/30 {
  border-color: rgba(59, 130, 246, 0.3);
}

.border-yellow-500\/30 {
  border-color: rgba(234, 179, 8, 0.3);
}

.border-green-500\/30 {
  border-color: rgba(34, 197, 94, 0.3);
}

.border-purple-500\/30 {
  border-color: rgba(168, 85, 247, 0.3);
}

.border-indigo-500\/30 {
  border-color: rgba(99, 102, 241, 0.3);
}

.border-gray-500\/30 {
  border-color: rgba(107, 114, 128, 0.3);
}
</style>