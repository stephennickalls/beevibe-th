<template>
  <div
    class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer"
    @click="handleViewDetails"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section: Main Info -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- Hive Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <!-- Hive Icon -->
            <svg class="w-6 h-6 text-blue-400" viewBox="0 0 55 56" fill="currentColor">
              <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51Z"/>
              <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51Z"/>
              <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51Z"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900',
            hiveStatusColor
          ]"></div>
        </div>

        <!-- Hive Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-white truncate">
              {{ hive.name || `Hive ${hive.id}` }}
            </h3>
            <!-- Active Badge -->
            <span v-if="hive.is_active" class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-500/30">
              Active
            </span>
            <span v-else class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-900/30 text-gray-400 border border-gray-500/30">
              Inactive
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <!-- Apiary Assignment -->
            <div v-if="hive.apiary" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>{{ hive.apiary.name }}</span>
            </div>
            
            <!-- Sensor Count -->
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z"/>
              </svg>
              <span>{{ sensorCount }} sensors</span>
            </div>

            <!-- Installation Date -->
            <div v-if="hive.installation_date" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
              </svg>
              <span>{{ formatDate(hive.installation_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Sensor Status & Metrics -->
      <div class="flex items-center space-x-4">
        <!-- Last Reading -->
        <div class="text-right">
          <div class="text-sm font-medium text-white">
            Last Reading
          </div>
          <div class="text-xs text-gray-400">
            {{ formatLastReading(hive.last_sensor_reading || hive.updated_at) }}
          </div>
        </div>

        <!-- Sensor Status Grid -->
        <div v-if="hive.sensors && hive.sensors.length > 0" class="flex gap-2 min-w-[200px]">
          <!-- Temperature Sensor -->
          <div v-if="temperatureSensor" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-orange-400">
              Temp
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ formatTemperature(temperatureSensor.latest_reading) }}
            </div>
            <div :class="[
              'w-2 h-2 rounded-full mt-1',
              temperatureSensor.is_online ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
          </div>

          <!-- Weight Sensor -->
          <div v-if="weightSensor" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-blue-400">
              Weight
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ formatWeight(weightSensor.latest_reading) }}
            </div>
            <div :class="[
              'w-2 h-2 rounded-full mt-1',
              weightSensor.is_online ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
          </div>

          <!-- Humidity Sensor -->
          <div v-if="humiditySensor" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-cyan-400">
              Humidity
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ formatHumidity(humiditySensor.latest_reading) }}
            </div>
            <div :class="[
              'w-2 h-2 rounded-full mt-1',
              humiditySensor.is_online ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
          </div>

          <!-- Sound Sensor -->
          <div v-if="soundSensor" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-purple-400">
              Sound
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ formatSound(soundSensor.latest_reading) }}
            </div>
            <div :class="[
              'w-2 h-2 rounded-full mt-1',
              soundSensor.is_online ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
          </div>
        </div>

        <!-- No Sensors State -->
        <div v-else class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[120px]">
          <div class="text-xs font-medium mb-1 text-gray-400">
            No Sensors
          </div>
          <div class="text-xs text-gray-500">
            Click to add
          </div>
        </div>

        <!-- Online Status Badge -->
        <div class="flex flex-col items-end space-y-1">
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            hasOnlineSensors
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : sensorCount > 0
                ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
          ]">
            {{ getStatusText() }}
          </span>
          <div v-if="sensorCount > 0" class="text-xs text-gray-400">
            {{ onlineSensorCount }}/{{ sensorCount }} online
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  hive: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click'])

// Computed properties
const sensorCount = computed(() => props.hive.sensors?.length || 0)

const onlineSensorCount = computed(() => {
  return props.hive.sensors?.filter(sensor => sensor.is_online).length || 0
})

const hasOnlineSensors = computed(() => onlineSensorCount.value > 0)

const hiveStatusColor = computed(() => {
  if (!props.hive.is_active) return 'bg-gray-400'
  if (hasOnlineSensors.value) return 'bg-green-400'
  if (sensorCount.value > 0) return 'bg-yellow-400'
  return 'bg-gray-400'
})

// Sensor type computed properties
const temperatureSensor = computed(() => {
  return props.hive.sensors?.find(sensor => 
    sensor.sensor_type === 'temperature' || sensor.sensor_type === 'temp'
  )
})

const weightSensor = computed(() => {
  return props.hive.sensors?.find(sensor => 
    sensor.sensor_type === 'weight' || sensor.sensor_type === 'scale'
  )
})

const humiditySensor = computed(() => {
  return props.hive.sensors?.find(sensor => 
    sensor.sensor_type === 'humidity'
  )
})

const soundSensor = computed(() => {
  return props.hive.sensors?.find(sensor => 
    sensor.sensor_type === 'sound' || sensor.sensor_type === 'audio'
  )
})

// Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatLastReading = (dateStr) => {
  if (!dateStr) return 'Never'
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const formatTemperature = (reading) => {
  if (!reading || !reading.value) return 'N/A'
  return `${parseFloat(reading.value).toFixed(1)}°C`
}

const formatWeight = (reading) => {
  if (!reading || !reading.value) return 'N/A'
  return `${parseFloat(reading.value).toFixed(1)}kg`
}

const formatHumidity = (reading) => {
  if (!reading || !reading.value) return 'N/A'
  return `${parseFloat(reading.value).toFixed(0)}%`
}

const formatSound = (reading) => {
  if (!reading || !reading.value) return 'N/A'
  return `${parseFloat(reading.value).toFixed(0)}dB`
}

const getStatusText = () => {
  if (!props.hive.is_active) return 'Inactive'
  if (sensorCount.value === 0) return 'No Sensors'
  if (hasOnlineSensors.value) return 'Online'
  return 'Offline'
}

// Event handlers
const handleViewDetails = () => {
  // Navigate to hive details page
  const identifier = props.hive.uuid || props.hive.id
  navigateTo(`/hives/${identifier}`)
}
</script>

<style scoped>
/* Transition effects */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Hover effects */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Status indicator colors */
.bg-green-400 { background-color: #4ade80; }
.bg-yellow-400{ background-color: #facc15; }
.bg-red-400   { background-color: #f87171; }
.bg-gray-400  { background-color: #9ca3af; }

.text-green-400  { color: #4ade80; }
.text-yellow-400 { color: #facc15; }
.text-red-400    { color: #f87171; }
.text-blue-400   { color: #60a5fa; }
.text-orange-400 { color: #fb923c; }
.text-purple-400 { color: #c084fc; }
.text-cyan-400   { color: #22d3ee; }
.text-gray-400   { color: #9ca3af; }
.text-gray-500   { color: #6b7280; }

/* Background colors */
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }

.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }

/* Badge backgrounds with opacity */
.bg-green-900\/30  { background-color: rgba(20, 83, 45, 0.3); }
.bg-red-900\/30    { background-color: rgba(127, 29, 29, 0.3); }
.bg-gray-900\/30   { background-color: rgba(17, 24, 39, 0.3); }

/* Border colors with opacity */
.border-green-500\/30  { border-color: rgba(34, 197, 94, 0.3); }
.border-red-500\/30    { border-color: rgba(239, 68, 68, 0.3); }
.border-gray-500\/30   { border-color: rgba(107, 114, 128, 0.3); }
</style>