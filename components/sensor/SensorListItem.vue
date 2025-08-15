<template>
  <div 
    :class="containerClasses"
    @click="$emit('click', sensor)"
  >
    <div class="flex items-center space-x-2 flex-1 min-w-0">
      <!-- Sensor Type Icon -->
      <div class="flex-shrink-0">
        <svg v-if="canonicalType === 'temperature'" class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.88 2.12z"/>
        </svg>
        <svg v-else-if="canonicalType === 'humidity'" class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3s-6 5.419-6 8a6 6 0 1012 0c0-2.581-6-8-6-8z"/>
        </svg>
        <svg v-else-if="canonicalType === 'weight'" class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 48 50">
          <path d="M3.8267 49.0903C2.93437 48.8741 2.13088 48.4093 1.44276 47.7117C0.429767 46.6847 0 45.6519 0 44.2445C0 43.7521 0.673992 39.4787 2.11696 30.8218C3.28128 23.8366 4.30398 17.8184 4.38963 17.4481C4.7943 15.6984 6.08237 14.2863 7.78466 13.7262C8.37711 13.5312 8.64529 13.5157 12.0481 13.4783C14.0453 13.4556 15.6794 13.4193 15.6794 13.3959C15.6794 13.3732 15.5773 13.1491 15.4522 12.8996C14.3821 10.7618 14.2998 7.87953 15.2424 5.55942C16.1715 3.27304 18.2794 1.29654 20.6552 0.484173C25.6745 -1.23219 31.0758 1.774 32.3346 6.98465C32.7812 8.83322 32.5164 11.2325 31.682 12.8996C31.5569 13.1491 31.4548 13.3725 31.4548 13.3959C31.4548 13.4186 33.0888 13.4563 35.0861 13.4783C39.1807 13.5232 39.3969 13.5557 40.5519 14.303C41.7567 15.0823 42.4823 16.1939 42.7943 17.738C42.9009 18.2663 43.9212 24.29 45.0613 31.1241C46.4487 39.4407 47.1342 43.784 47.1342 44.2582C47.1342 45.6513 46.701 46.6881 45.6914 47.7117C44.9885 48.4242 44.1984 48.8744 43.2634 49.0948C42.3882 49.3011 4.67871 49.2959 3.8267 49.0903ZM24.4848 12.6335C26.0732 12.2198 27.1944 10.881 27.2975 9.27482C27.4384 7.07899 25.7594 5.28183 23.5672 5.28183C21.3664 5.28183 19.6954 7.07045 19.8368 9.27482C19.9385 10.8591 21.0559 12.2116 22.6076 12.6286C23.2987 12.8141 23.7856 12.8168 24.4848 12.6335Z"/>
        </svg>
        <svg v-else class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      </div>
      
      <!-- Sensor Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <span :class="mode === 'card' ? 'text-xs' : 'text-sm'" class="font-medium truncate">
            {{ sensor.name || `${formatLabel(canonicalType)} Sensor` }}
          </span>
          <div :class="['w-1.5 h-1.5 rounded-full', sensor.is_online ? 'bg-green-400' : 'bg-red-400']"></div>
        </div>
        <div :class="mode === 'card' ? 'text-xs' : 'text-sm'" class="text-gray-400">
          {{ sensorTypeLabel }}
        </div>
        
        <!-- Page Mode: Additional Details -->
        <div v-if="mode === 'page' " class="mt-1 space-y-1">
          <div v-if="sensor.model" class="text-xs text-gray-500">
            Model: {{ sensor.model }}
          </div>
          <div v-if="sensor.latest_reading?.signal_strength != null" class="text-xs text-gray-500">
            Signal: {{ sensor.latest_reading.signal_strength }}%
          </div>
        </div>
      </div>
    </div>
    
    <!-- Latest Reading -->
    <div class="text-right flex-shrink-0">
      <div v-if="sensor.latest_reading" class="text-xs font-medium">
        {{ formattedSensorValue }}
      </div>
      <div v-else class="text-xs text-gray-500">No data</div>
      <div class="text-xs text-gray-500">
        {{ sensor.latest_reading ? formatTime(sensor.latest_reading.reading_time) : 'Never' }}
      </div>
      
      <!-- Page Mode: Additional Info -->
      <div v-if="mode === 'page' && sensor.battery_level != null" class="text-xs mt-1" :class="batteryColor">
        Battery: {{ sensor.battery_level }}%
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
  },
  mode: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'page'].includes(value)
  }
})

// Events
defineEmits(['click'])

/** ---------- Type normalization & alias mapping ---------- */
const rawType = computed(() =>
  (props.sensor?.sensor_type ?? '').toString().trim().toLowerCase()
)

/* Extend this with any hardware model strings you store in sensor_type */
const aliasMap = {
  // temperature
  temperature: 'temperature',
  temp: 'temperature',
  dht11: 'temperature',
  dht22: 'temperature',
  ds18b20: 'temperature',
  // humidity
  humidity: 'humidity',
  hum: 'humidity',
  rh: 'humidity',
  bme280_h: 'humidity',
  // weight / scale
  weight: 'weight',
  scale: 'weight',
  hx711: 'weight'
}

const canonicalType = computed(() => aliasMap[rawType.value] || rawType.value || 'unknown')

/** ---------- UI classes & labels ---------- */
const containerClasses = computed(() => {
  const base = 'flex items-center justify-between rounded-lg transition-colors cursor-pointer'
  return props.mode === 'card'
    ? `${base} p-2 bg-gray-900 hover:bg-gray-750`
    : `${base} p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600`
})

const formatLabel = (t) => {
  if (!t) return 'Sensor'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const sensorTypeLabel = computed(() => {
  const labels = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    weight: 'Weight Scale',
    activity: 'Activity'
  }
  return labels[canonicalType.value] || formatLabel(canonicalType.value)
})

/** ---------- Values & colors ---------- */
const formattedSensorValue = computed(() => {
  const r = props.sensor.latest_reading
  if (!r || r.value == null) return 'N/A'

  const v = Number(r.value)
  const unit = r.unit
  if (Number.isNaN(v)) return String(r.value)

  switch (canonicalType.value) {
    case 'temperature': return `${v.toFixed(1)}°C`
    case 'humidity':    return `${v.toFixed(1)}%`
    case 'weight':      return `${(v / 1000).toFixed(1)}kg` // adjust if stored in kg already
    default:            return unit ? `${v.toFixed(1)}${unit}` : v.toFixed(1)
  }
})

const batteryColor = computed(() => {
  const level = props.sensor.battery_level
  if (level == null) return 'text-gray-400'
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
})

/** ---------- Helpers ---------- */
const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
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
/* Hover effects */
.hover\:bg-gray-750:hover { background-color: rgba(55, 65, 81, 0.9); }

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Sensor type icon colors */
.text-red-400 { color: #f87171; }
.text-blue-400 { color: #60a5fa; }
.text-yellow-400 { color: #facc15; }
.text-gray-400 { color: #9ca3af; }

/* Online/offline status dots */
.bg-green-400 { background-color: #4ade80; }
.bg-red-400 { background-color: #f87171; }
</style>
