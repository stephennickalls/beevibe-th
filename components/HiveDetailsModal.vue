<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
      
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">{{ hive?.name || `Hive ${hive?.id}` }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 max-h-[75vh] overflow-y-auto space-y-6">
        
        <!-- Hive Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Info -->
          <div class="space-y-4">
            <div class="bg-gray-900 rounded-lg p-4">
              <h4 class="text-lg font-medium mb-3">Basic Information</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="text-white">{{ hive?.name || 'Unnamed Hive' }}</p>
                </div>
                <div v-if="hive?.description">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="text-white">{{ hive.description }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <div class="flex items-center space-x-2">
                    <div :class="hive?.is_active ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full"></div>
                    <span :class="hive?.is_active ? 'text-green-400' : 'text-red-400'">
                      {{ hive?.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                <div v-if="hive?.installation_date">
                  <label class="block text-sm font-medium text-gray-400">Installation Date</label>
                  <p class="text-white">{{ formatDate(hive.installation_date) }}</p>
                </div>
                <div v-if="hive?.uuid">
                  <label class="block text-sm font-medium text-gray-400">Hive ID</label>
                  <div class="flex items-center space-x-2">
                    <code class="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{{ hive.uuid }}</code>
                    <button 
                      @click="copyToClipboard(hive.uuid, 'Hive ID')" 
                      class="text-gray-400 hover:text-white"
                      title="Copy to clipboard"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Info -->
          <div class="space-y-4">
            <div class="bg-gray-900 rounded-lg p-4">
              <h4 class="text-lg font-medium mb-3">Location</h4>
              <div class="space-y-3">
                <div v-if="hive?.latitude || hive?.longitude">
                  <label class="block text-sm font-medium text-gray-400">Coordinates</label>
                  <div class="space-y-1">
                    <p class="text-white text-sm">
                      Lat: {{ hive?.latitude ? parseFloat(hive.latitude).toFixed(6) : 'Not set' }}
                    </p>
                    <p class="text-white text-sm">
                      Lng: {{ hive?.longitude ? parseFloat(hive.longitude).toFixed(6) : 'Not set' }}
                    </p>
                  </div>
                  <button 
                    v-if="hive?.latitude && hive?.longitude"
                    @click="openInMaps"
                    class="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    View on Maps
                  </button>
                </div>
                <div v-else>
                  <p class="text-gray-400">No location data available</p>
                </div>
              </div>
            </div>

            <!-- Health Status -->
            <div class="bg-gray-900 rounded-lg p-4">
              <h4 class="text-lg font-medium mb-3">Health Status</h4>
              <div class="flex items-center space-x-3">
                <div :class="healthStatus.color" class="w-3 h-3 rounded-full"></div>
                <span :class="healthStatus.textColor" class="font-medium">{{ healthStatus.status }}</span>
              </div>
              <p class="text-gray-400 text-sm mt-2">{{ healthStatus.description }}</p>
              
              <!-- Health Metrics -->
              <div v-if="healthMetrics.length > 0" class="mt-3 space-y-2">
                <div v-for="metric in healthMetrics" :key="metric.type" class="flex justify-between items-center text-sm">
                  <span class="text-gray-400">{{ metric.label }}:</span>
                  <span :class="metric.status === 'good' ? 'text-green-400' : metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'">
                    {{ metric.value }}{{ metric.unit }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sensors Section -->
        <div class="bg-gray-900 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-medium">Sensors ({{ sensorCount }})</h4>
            <div class="flex items-center space-x-4 text-sm text-gray-400">
              <span>{{ onlineSensorCount }} online</span>
              <span v-if="lowBatterySensorCount > 0" class="text-yellow-400">{{ lowBatterySensorCount }} low battery</span>
            </div>
          </div>
          
          <!-- No Sensors State -->
          <div v-if="!hive?.sensors || hive.sensors.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            <p class="text-gray-400">No sensors installed</p>
            <p class="text-gray-500 text-sm mt-1">Sensors will appear here once they're added to this hive</p>
          </div>
          
          <!-- Sensors List -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="sensor in hive.sensors" 
              :key="sensor.id"
              class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium">{{ sensor.name || formatSensorType(sensor.sensor_type) }}</span>
                    <div :class="sensor.is_online ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full"></div>
                  </div>
                  <p class="text-xs text-gray-400">{{ formatSensorType(sensor.sensor_type) }}</p>
                  
                  <!-- Latest Reading -->
                  <div v-if="sensor.latest_reading" class="mt-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium">{{ sensor.latest_reading.value }}{{ sensor.latest_reading.unit }}</span>
                      <span class="text-xs text-gray-400">{{ formatTime(sensor.latest_reading.reading_time) }}</span>
                    </div>
                  </div>
                  <div v-else class="mt-2">
                    <span class="text-xs text-gray-500">No recent data</span>
                  </div>
                  
                  <!-- Battery Level -->
                  <div v-if="sensor.battery_level !== null && sensor.battery_level !== undefined" class="mt-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-400">Battery:</span>
                      <div class="flex items-center space-x-1">
                        <div class="w-6 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            :class="getBatteryColor(sensor.battery_level)" 
                            class="h-full rounded-full transition-all duration-300"
                            :style="{ width: `${Math.max(sensor.battery_level, 5)}%` }"
                          ></div>
                        </div>
                        <span class="text-xs" :class="getBatteryTextColor(sensor.battery_level)">
                          {{ sensor.battery_level }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity/Alerts -->
        <div v-if="recentAlerts && recentAlerts.length > 0" class="bg-gray-900 rounded-lg p-4">
          <h4 class="text-lg font-medium mb-3">Recent Alerts</h4>
          <div class="space-y-2">
            <div 
              v-for="alert in recentAlerts.slice(0, 3)" 
              :key="alert.id"
              class="p-3 rounded-lg"
              :class="getAlertStyles(alert.severity)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium">{{ alert.title }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ formatTime(alert.created_at) }}</p>
                </div>
                <span :class="getAlertBadgeClass(alert.severity)" class="px-2 py-1 text-xs rounded-full">
                  {{ alert.severity }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div v-if="hive?.sensors && hive.sensors.length > 0" class="bg-gray-900 rounded-lg p-4">
          <h4 class="text-lg font-medium mb-3">Quick Stats</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-400">{{ sensorCount }}</p>
              <p class="text-xs text-gray-400">Total Sensors</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-400">{{ onlineSensorCount }}</p>
              <p class="text-xs text-gray-400">Online</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold" :class="lowBatterySensorCount > 0 ? 'text-yellow-400' : 'text-green-400'">
                {{ lowBatterySensorCount }}
              </p>
              <p class="text-xs text-gray-400">Low Battery</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-purple-400">{{ lastReadingTime }}</p>
              <p class="text-xs text-gray-400">Last Reading</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700">
        <div class="flex space-x-3">
          <button @click="$emit('edit')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Edit Hive
          </button>
          <NuxtLink :to="`/hives/${hive?.id}`" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors no-underline text-white">
            View Details
          </NuxtLink>
        </div>
        <button @click="$emit('delete', hive)" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
          Delete Hive
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  hive: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'edit', 'delete'])

// Computed properties
const sensorCount = computed(() => props.hive?.sensors?.length || 0)

const onlineSensorCount = computed(() => {
  if (!props.hive?.sensors) return 0
  return props.hive.sensors.filter(s => s.is_online).length
})

const lowBatterySensorCount = computed(() => {
  if (!props.hive?.sensors) return 0
  return props.hive.sensors.filter(s => s.battery_level < 20).length
})

const lastReadingTime = computed(() => {
  if (!props.hive?.sensors) return 'Never'
  
  const readings = props.hive.sensors
    .map(s => s.latest_reading?.reading_time)
    .filter(Boolean)
    .map(time => new Date(time))
  
  if (readings.length === 0) return 'Never'
  
  const latest = new Date(Math.max(...readings))
  return formatTime(latest.toISOString())
})

const healthStatus = computed(() => {
  if (!props.hive?.sensors || props.hive.sensors.length === 0) {
    return {
      status: 'No Data',
      color: 'bg-gray-400',
      textColor: 'text-gray-400',
      description: 'No sensors installed to monitor hive health'
    }
  }

  // Check for critical issues
  const criticalIssues = props.hive.sensors.some(sensor => {
    if (!sensor.latest_reading) return false
    const { value, sensor_type } = sensor.latest_reading
    
    if (sensor_type === 'temperature') {
      return value < 30 || value > 40
    } else if (sensor_type === 'humidity') {
      return value < 45 || value > 75
    }
    return false
  })

  if (criticalIssues) {
    return {
      status: 'Critical',
      color: 'bg-red-400',
      textColor: 'text-red-400',
      description: 'Critical readings detected - immediate attention required'
    }
  }

  // Check for warnings
  const warnings = props.hive.sensors.some(sensor => {
    if (!sensor.latest_reading) return false
    const { value, sensor_type } = sensor.latest_reading
    
    if (sensor_type === 'temperature') {
      return value < 32 || value > 38
    } else if (sensor_type === 'humidity') {
      return value < 50 || value > 70
    }
    return false
  })

  if (warnings) {
    return {
      status: 'Warning',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      description: 'Some readings are outside optimal ranges'
    }
  }

  return {
    status: 'Healthy',
    color: 'bg-green-400',
    textColor: 'text-green-400',
    description: 'All readings are within normal ranges'
  }
})

const healthMetrics = computed(() => {
  if (!props.hive?.sensors) return []
  
  const metrics = []
  
  // Get latest temperature reading
  const tempSensor = props.hive.sensors.find(s => s.sensor_type === 'temperature' && s.latest_reading)
  if (tempSensor) {
    const temp = tempSensor.latest_reading.value
    metrics.push({
      type: 'temperature',
      label: 'Temperature',
      value: temp,
      unit: '°C',
      status: temp >= 32 && temp <= 38 ? 'good' : temp >= 30 && temp <= 40 ? 'warning' : 'critical'
    })
  }
  
  // Get latest humidity reading
  const humSensor = props.hive.sensors.find(s => s.sensor_type === 'humidity' && s.latest_reading)
  if (humSensor) {
    const humidity = humSensor.latest_reading.value
    metrics.push({
      type: 'humidity',
      label: 'Humidity',
      value: humidity,
      unit: '%',
      status: humidity >= 50 && humidity <= 70 ? 'good' : humidity >= 45 && humidity <= 75 ? 'warning' : 'critical'
    })
  }
  
  return metrics
})

const recentAlerts = computed(() => {
  // This would come from the alerts data in a real implementation
  return []
})

// Functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return 'No recent data'
  
  const now = new Date()
  const date = new Date(dateString)
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

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

const getBatteryColor = (level) => {
  if (level > 50) return 'bg-green-500'
  if (level > 20) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getBatteryTextColor = (level) => {
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const getAlertStyles = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/30 border border-red-500/30'
    case 'warning':
      return 'bg-yellow-900/30 border border-yellow-500/30'
    default:
      return 'bg-blue-900/30 border border-blue-500/30'
  }
}

const getAlertBadgeClass = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 text-white'
    case 'warning':
      return 'bg-yellow-600 text-white'
    default:
      return 'bg-blue-600 text-white'
  }
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const openInMaps = () => {
  if (props.hive?.latitude && props.hive?.longitude) {
    const url = `https://www.google.com/maps?q=${props.hive.latitude},${props.hive.longitude}`
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
/* Custom scrollbar */
.max-h-\[75vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[75vh\]::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-\[75vh\]::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-\[75vh\]::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

.no-underline {
  text-decoration: none;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>