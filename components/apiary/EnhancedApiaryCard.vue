<template>
  <div 
    @click="$emit('click', apiary)"
    class="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-gray-600 hover:shadow-lg group"
  >
    <!-- Header with Status -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="font-semibold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
            {{ apiary.name }}
          </h3>
          <div class="flex items-center gap-1">
            <div :class="statusIndicatorClass"></div>
            <span :class="statusTextClass">
              {{ statusText }}
            </span>
          </div>
        </div>
        
        <p class="text-sm text-gray-400 line-clamp-2">
          {{ apiary.description || 'No description provided' }}
        </p>
      </div>
      
      <!-- Health Score -->
      <div class="ml-4 text-right">
        <div class="text-xs text-gray-400 mb-1">Health</div>
        <div :class="healthScoreClass">
          {{ healthScore }}%
        </div>
      </div>
    </div>

    <!-- Location Info -->
    <div v-if="locationText" class="mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <span class="truncate">{{ locationText }}</span>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <!-- Hives -->
      <div class="text-center">
        <div class="text-xl font-bold text-blue-400">{{ hiveCount }}</div>
        <div class="text-xs text-gray-400">Hives</div>
      </div>
      
      <!-- Hubs -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1">
          <div class="text-xl font-bold text-purple-400">{{ hubCount }}</div>
          <div v-if="hasOnlineHub" class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div class="text-xs text-gray-400">Hubs</div>
      </div>
      
      <!-- Alerts -->
      <div class="text-center">
        <div class="text-xl font-bold text-red-400">{{ alertCount }}</div>
        <div class="text-xs text-gray-400">Alerts</div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mb-4">
      <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>Recent Activity</span>
        <span>{{ lastActivity }}</span>
      </div>
      
      <!-- Activity indicators -->
      <div class="flex gap-2">
        <!-- Hub connectivity indicator -->
        <div v-if="hubCount > 0" class="flex-1">
          <div class="flex items-center gap-1 mb-1">
            <svg class="w-3 h-3" :class="hubStatusClass" fill="currentColor" viewBox="0 0 694 825">
              <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
            </svg>
            <span class="text-xs" :class="hubStatusClass">
              Hub {{ hasOnlineHub ? 'Online' : 'Offline' }}
            </span>
          </div>
        </div>
        
        <!-- Data flow indicator -->
        <div v-if="hasLiveData" class="flex items-center gap-1">
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span class="text-xs text-blue-400">Live Data</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-2">
      <button 
        @click.stop="handleQuickAction('manage')"
        class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
      >
        Manage
      </button>
      
      <button 
        v-if="alertCount > 0"
        @click.stop="handleQuickAction('view-alerts')"
        class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
      >
        {{ alertCount }} Alert{{ alertCount !== 1 ? 's' : '' }}
      </button>
      
      <button 
        v-if="showAddHubButton"
        @click.stop="handleQuickAction('add-hub')"
        class="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-sm rounded-lg transition-colors"
      >
        Add Hub
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  apiary: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click', 'quick-action'])

// Computed properties
const hiveCount = computed(() => props.apiary.hive_count || 0)
const hubCount = computed(() => (props.apiary.hubs || []).length)
const alertCount = computed(() => props.apiary.alert_count || 0)
const healthScore = computed(() => props.apiary.health_score || 85)

const hasOnlineHub = computed(() => {
  if (!props.apiary.hubs || props.apiary.hubs.length === 0) return false
  return props.apiary.hubs.some(hub => isHubOnline(hub))
})

const hasLiveData = computed(() => hasOnlineHub.value)

const showAddHubButton = computed(() => {
  return !hasOnlineHub.value && hubCount.value === 0
})

const locationText = computed(() => {
  if (props.apiary.address) return props.apiary.address
  if (props.apiary.latitude && props.apiary.longitude) {
    const lat = parseFloat(props.apiary.latitude).toFixed(4)
    const lng = parseFloat(props.apiary.longitude).toFixed(4)
    return `${lat}, ${lng}`
  }
  return null
})

const statusIndicatorClass = computed(() => {
  const baseClasses = 'w-2 h-2 rounded-full'
  if (!props.apiary.is_active) return `${baseClasses} bg-gray-400`
  if (alertCount.value > 0) return `${baseClasses} bg-red-400`
  if (hasOnlineHub.value) return `${baseClasses} bg-green-400`
  return `${baseClasses} bg-yellow-400`
})

const statusTextClass = computed(() => {
  const baseClasses = 'text-xs font-medium'
  if (!props.apiary.is_active) return `${baseClasses} text-gray-400`
  if (alertCount.value > 0) return `${baseClasses} text-red-400`
  if (hasOnlineHub.value) return `${baseClasses} text-green-400`
  return `${baseClasses} text-yellow-400`
})

const statusText = computed(() => {
  if (!props.apiary.is_active) return 'Inactive'
  if (alertCount.value > 0) return 'Needs Attention'
  if (hasOnlineHub.value) return 'Active'
  if (hubCount.value === 0) return 'No Hub'
  return 'Offline'
})

const healthScoreClass = computed(() => {
  const baseClasses = 'text-lg font-bold'
  const score = healthScore.value
  if (score >= 90) return `${baseClasses} text-green-400`
  if (score >= 70) return `${baseClasses} text-yellow-400`
  if (score >= 50) return `${baseClasses} text-orange-400`
  return `${baseClasses} text-red-400`
})

const hubStatusClass = computed(() => {
  return hasOnlineHub.value ? 'text-green-400' : 'text-red-400'
})

const lastActivity = computed(() => {
  if (hasOnlineHub.value) return 'Just now'
  if (props.apiary.updated_at) {
    const diff = Date.now() - new Date(props.apiary.updated_at).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }
  return 'No activity'
})

// Helper functions
const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000 // 5 minutes
}

const handleQuickAction = (action) => {
  emit('quick-action', { action, apiary: props.apiary })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>