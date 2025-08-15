<template>
  <div 
    @click="$emit('click', apiary)"
    class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-gray-600 group"
  >
    <div class="flex items-center gap-4">
      <!-- Apiary Icon with Status -->
      <div class="relative flex-shrink-0">
        <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
          <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </div>
        <!-- Status indicator -->
        <div :class="[
          'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800',
          getStatusColor(apiary)
        ]"></div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-1">
          <h3 class="font-medium text-lg text-white truncate group-hover:text-blue-400 transition-colors">
            {{ apiary.name }}
          </h3>
          
          <!-- Status badges -->
          <div class="flex items-center gap-2">
            <span :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusBadgeClass(apiary)
            ]">
              {{ getStatusText(apiary) }}
            </span>
            
            <div v-if="hasOnlineHub" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-xs text-green-400">Live</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6 text-sm text-gray-400">
          <!-- Description -->
          <span class="truncate max-w-md">
            {{ apiary.description || 'No description' }}
          </span>
          
          <!-- Location -->
          <div v-if="apiary.address || (apiary.latitude && apiary.longitude)" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            <span class="truncate max-w-xs">
              {{ apiary.address || `${parseFloat(apiary.latitude).toFixed(2)}, ${parseFloat(apiary.longitude).toFixed(2)}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="flex items-center gap-6 text-center">
        <!-- Hives -->
        <div>
          <div class="text-lg font-bold text-blue-400">{{ apiary.hive_count || 0 }}</div>
          <div class="text-xs text-gray-400">Hives</div>
        </div>
        
        <!-- Hubs -->
        <div>
          <div class="flex items-center justify-center gap-1">
            <div class="text-lg font-bold text-purple-400">{{ (apiary.hubs || []).length }}</div>
            <div v-if="hasOnlineHub" class="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div class="text-xs text-gray-400">Hubs</div>
        </div>
        
        <!-- Health Score -->
        <div>
          <div :class="[
            'text-lg font-bold',
            getHealthScoreColor(apiary.health_score)
          ]">
            {{ apiary.health_score || 85 }}%
          </div>
          <div class="text-xs text-gray-400">Health</div>
        </div>
        
        <!-- Alerts -->
        <div>
          <div class="text-lg font-bold text-red-400">{{ apiary.alert_count || 0 }}</div>
          <div class="text-xs text-gray-400">Alerts</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2 ml-4">
        <button 
          v-if="apiary.alert_count > 0"
          @click.stop="$emit('quick-action', { action: 'view-alerts', apiary })"
          class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          title="View alerts"
        >
          {{ apiary.alert_count }}
        </button>
        
        <button 
          v-if="!hasOnlineHub && (apiary.hubs || []).length === 0"
          @click.stop="$emit('quick-action', { action: 'add-hub', apiary })"
          class="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xs rounded transition-colors"
          title="Add hub"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 694 825">
            <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
          </svg>
        </button>
        
        <button 
          @click.stop="$emit('quick-action', { action: 'manage', apiary })"
          class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          title="Manage apiary"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>
      </div>
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
const hasOnlineHub = computed(() => {
  if (!props.apiary.hubs || props.apiary.hubs.length === 0) return false
  return props.apiary.hubs.some(hub => isHubOnline(hub))
})

// Helper functions
const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000 // 5 minutes
}

const getStatusColor = (apiary) => {
  if (!apiary.is_active) return 'bg-gray-400'
  if (apiary.alert_count > 0) return 'bg-red-400'
  if (hasOnlineHub.value) return 'bg-green-400'
  return 'bg-yellow-400'
}

const getStatusBadgeClass = (apiary) => {
  if (!apiary.is_active) return 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
  if (apiary.alert_count > 0) return 'bg-red-900/30 text-red-400 border border-red-500/30'
  if (hasOnlineHub.value) return 'bg-green-900/30 text-green-400 border border-green-500/30'
  return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
}

const getStatusText = (apiary) => {
  if (!apiary.is_active) return 'Inactive'
  if (apiary.alert_count > 0) return 'Alert'
  if (hasOnlineHub.value) return 'Active'
  if ((apiary.hubs || []).length === 0) return 'Setup'
  return 'Offline'
}

const getHealthScoreColor = (score = 85) => {
  if (score >= 90) return 'text-green-400'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}
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
</style>