<template>
  <div v-if="user && subscription" class="mb-3">
    <div class="bg-gray-900 rounded-lg px-4 py-1.5 border" :class="subscriptionStripClasses">
      <div class="flex items-center justify-between">
        <!-- Left Side: Plan Info -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-400 font-medium">Subscription Plan:</span>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full" :class="planStatusColor"></div>
              <span class="font-medium text-sm">{{ subscription.planDisplayName || 'Free' }}</span>
            </div>
          </div>
          
          <!-- Usage Stats -->
          <div class="flex items-center space-x-3 text-xs">
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>Hives:</span>
              <span class="font-medium" :class="hiveUsageColor">
                {{ currentUsage.hives || 0 }}/{{ subscription.limits?.max_hives === -1 ? '∞' : subscription.limits?.max_hives || 0 }}
              </span>
            </div>
            
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0112.12 15.12z"/>
              </svg>
              <span>Sensors:</span>
              <span class="font-medium" :class="sensorUsageColor">
                {{ currentUsage.sensors || 0 }}/{{ subscription.limits?.max_sensors_total === -1 ? '∞' : subscription.limits?.max_sensors_total || 0 }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Right Side: Upgrade Button -->
        <div class="flex items-center space-x-2">
          <div v-if="isNearLimits" class="text-xs text-yellow-400 hidden sm:block">
            {{ nearLimitMessage }}
          </div>
          
          <button
            @click="$emit('upgrade')"
            class="px-2 py-0.5 rounded text-xs font-medium transition-all duration-200 leading-none"
            :class="upgradeButtonClasses"
          >
            <span class="flex items-center space-x-1">
              <svg v-if="isAtLimits" class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              <svg v-else class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"/>
              </svg>
              <span class="text-xs">{{ upgradeButtonText }}</span>
            </span>
          </button>
        </div>
      </div>
      
      <!-- Mobile: Near Limit Message -->
      <div v-if="isNearLimits" class="mt-1 text-xs text-yellow-400 sm:hidden">
        {{ nearLimitMessage }}
      </div>
      
      <!-- DEBUG: Show raw data (remove this after debugging) -->
      <div v-if="debugMode" class="mt-2 p-2 bg-gray-800 rounded text-xs">
        <div class="text-yellow-300 mb-1">DEBUG INFO:</div>
        <div>currentUsage: {{ JSON.stringify(currentUsage) }}</div>
        <div>subscription.limits: {{ JSON.stringify(subscription?.limits) }}</div>
        <div>user: {{ user ? 'Present' : 'Missing' }}</div>
        <div>subscription: {{ subscription ? 'Present' : 'Missing' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  subscription: {
    type: Object,
    default: null
  },
  currentUsage: {
    type: Object,
    default: () => ({ hives: 0, sensors: 0 })
  },
  debugMode: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['upgrade'])

// Computed properties for subscription status
const isAtLimits = computed(() => {
  if (!props.subscription) return false
  
  const hivesAtLimit = props.subscription.limits?.max_hives !== -1 && 
                      props.currentUsage.hives >= props.subscription.limits?.max_hives
  const sensorsAtLimit = props.subscription.limits?.max_sensors_total !== -1 && 
                        props.currentUsage.sensors >= props.subscription.limits?.max_sensors_total
  
  return hivesAtLimit || sensorsAtLimit
})

const isNearLimits = computed(() => {
  if (!props.subscription) return false
  
  const hivesNearLimit = props.subscription.limits?.max_hives !== -1 && 
                        props.currentUsage.hives >= props.subscription.limits?.max_hives * 0.8
  const sensorsNearLimit = props.subscription.limits?.max_sensors_total !== -1 && 
                          props.currentUsage.sensors >= props.subscription.limits?.max_sensors_total * 0.8
  
  return (hivesNearLimit || sensorsNearLimit) && !isAtLimits.value
})

const subscriptionStripClasses = computed(() => {
  if (isAtLimits.value) return 'border-red-500 bg-red-900/20'
  if (isNearLimits.value) return 'border-yellow-500 bg-yellow-900/20'
  return 'border-gray-700'
})

const planStatusColor = computed(() => {
  if (isAtLimits.value) return 'bg-red-400'
  if (isNearLimits.value) return 'bg-yellow-400'
  return 'bg-green-400'
})

const hiveUsageColor = computed(() => {
  if (!props.subscription) return 'text-gray-300'
  
  const limit = props.subscription.limits?.max_hives
  if (limit === -1) return 'text-green-400'
  
  const usage = props.currentUsage.hives
  if (usage >= limit) return 'text-red-400'
  if (usage >= limit * 0.8) return 'text-yellow-400'
  return 'text-green-400'
})

const sensorUsageColor = computed(() => {
  if (!props.subscription) return 'text-gray-300'
  
  const limit = props.subscription.limits?.max_sensors_total
  if (limit === -1) return 'text-green-400'
  
  const usage = props.currentUsage.sensors
  if (usage >= limit) return 'text-red-400'
  if (usage >= limit * 0.8) return 'text-yellow-400'
  return 'text-green-400'
})

const upgradeButtonClasses = computed(() => {
  if (isAtLimits.value) {
    return 'bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse'
  }
  if (isNearLimits.value) {
    return 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md'
  }
  return 'bg-blue-600 hover:bg-blue-700 text-white'
})

const upgradeButtonText = computed(() => {
  if (isAtLimits.value) return 'Upgrade Now'
  if (isNearLimits.value) return 'Upgrade Plan'
  return 'Upgrade'
})

const nearLimitMessage = computed(() => {
  if (!props.subscription) return ''
  
  const hiveLimit = props.subscription.limits?.max_hives
  const sensorLimit = props.subscription.limits?.max_sensors_total
  
  if (hiveLimit !== -1 && props.currentUsage.hives >= hiveLimit) {
    return 'Hive limit reached'
  }
  if (sensorLimit !== -1 && props.currentUsage.sensors >= sensorLimit) {
    return 'Sensor limit reached'
  }
  if (hiveLimit !== -1 && props.currentUsage.hives >= hiveLimit * 0.8) {
    return `${hiveLimit - props.currentUsage.hives} hives remaining`
  }
  if (sensorLimit !== -1 && props.currentUsage.sensors >= sensorLimit * 0.8) {
    return `${sensorLimit - props.currentUsage.sensors} sensors remaining`
  }
  
  return ''
})
</script>

<style scoped>
/* Custom animations for critical state */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-x-4 {
    gap: 0.5rem;
  }
  
  .space-x-3 {
    gap: 0.5rem;
  }
  
  .text-xs {
    font-size: 0.7rem;
    line-height: 1rem;
  }
}

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

.text-gray-300 {
  color: #d1d5db;
}

/* Button states */
.bg-red-600 {
  background-color: #dc2626;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.bg-yellow-600 {
  background-color: #d97706;
}

.hover\:bg-yellow-700:hover {
  background-color: #b45309;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

/* Shadow effects */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Border styles */
.border-red-500 {
  border-color: #ef4444;
}

.border-yellow-500 {
  border-color: #eab308;
}

.border-gray-700 {
  border-color: #374151;
}

/* Background with opacity */
.bg-red-900\/20 {
  background-color: rgba(127, 29, 29, 0.2);
}

.bg-yellow-900\/20 {
  background-color: rgba(113, 63, 18, 0.2);
}
</style>