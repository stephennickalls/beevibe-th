<!-- components/AlertCard.vue -->
<template>
  <div 
    :class="[
      'bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 transition-all duration-200',
      getSeverityClasses(alert.severity),
      !alert.resolved ? 'hover:bg-gray-800' : 'opacity-75'
    ]"
  >
    <!-- Mobile Layout -->
    <div class="block sm:hidden">
      <!-- Alert Header -->
      <div class="flex items-center mb-3">
        <div :class="['w-3 h-3 rounded-full mr-2', getSeverityDotClasses(alert.severity)]"></div>
        <span :class="['px-2 py-1 rounded-full text-xs font-medium mr-3', getSeverityBadgeClasses(alert.severity)]">
          {{ alert.severity.toUpperCase() }}
        </span>
        <span v-if="alert.resolved" class="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium">
          RESOLVED
        </span>
      </div>

      <!-- Title and Message -->
      <h3 class="text-base font-semibold mb-4">{{ alert.title }}</h3>
      <p class="text-gray-300 text-sm mb-3">{{ alert.message }}</p>
      
      <!-- Metadata - Mobile Grid -->
      <div class="grid grid-cols-1 gap-2 text-xs mb-3">
        <div class="flex justify-between">
          <span class="text-gray-400">Hive:</span>
          <span class="font-medium">{{ alert.hive_name }}</span>
        </div>
        <div v-if="alert.sensor_name" class="flex justify-between">
          <span class="text-gray-400">Sensor:</span>
          <span class="font-medium">{{ alert.sensor_name }}</span>
        </div>
        <div v-if="alert.threshold_value" class="flex justify-between">
          <span class="text-gray-400">Threshold:</span>
          <span class="font-medium">{{ alert.threshold_value }}</span>
        </div>
        <div v-if="alert.actual_value" class="flex justify-between">
          <span class="text-gray-400">Actual:</span>
          <span class="font-medium">{{ alert.actual_value }}</span>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
        <span>{{ formatDateTime(alert.created_at) }}</span>
        <span v-if="alert.resolved_at">Resolved {{ formatDateTime(alert.resolved_at) }}</span>
        <span v-if="alert.resolved_by">by {{ alert.resolved_by }}</span>
      </div>

      <!-- Resolution Notes -->
      <div v-if="alert.resolved_notes" class="mb-3 p-3 bg-gray-800 rounded-lg">
        <span class="text-xs text-gray-400">Resolution Notes:</span>
        <p class="text-xs mt-1">{{ alert.resolved_notes }}</p>
      </div>

      <!-- Action Buttons - Mobile -->
      <div class="flex space-x-2">
        <button 
          v-if="!alert.resolved" 
          @click="$emit('resolve', alert)"
          class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors cursor-pointer"
        >
          Resolve
        </button>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden sm:flex justify-between items-start">
      <div class="flex-1">
        <!-- Alert Header -->
        <div class="flex items-center mb-2">
          <div :class="['w-3 h-3 rounded-full mr-3', getSeverityDotClasses(alert.severity)]"></div>
          <h3 class="text-lg font-semibold" style="margin-right: 1.5rem;">{{ alert.title }}</h3>
          <span :class="['px-2 py-1 rounded-full text-xs font-medium mr-3', getSeverityBadgeClasses(alert.severity)]">
            {{ alert.severity.toUpperCase() }}
          </span>
          <span v-if="alert.resolved" class="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium">
            RESOLVED
          </span>
        </div>

        <!-- Alert Details -->
        <p class="text-gray-300 mb-3">{{ alert.message }}</p>
        
        <!-- Alert Metadata -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Hive:</span>
            <span class="ml-2 font-medium">{{ alert.hive_name }}</span>
          </div>
          <div v-if="alert.sensor_name">
            <span class="text-gray-400">Sensor:</span>
            <span class="ml-2 font-medium">{{ alert.sensor_name }}</span>
          </div>
          <div v-if="alert.threshold_value">
            <span class="text-gray-400">Threshold:</span>
            <span class="ml-2 font-medium">{{ alert.threshold_value }}</span>
          </div>
          <div v-if="alert.actual_value">
            <span class="text-gray-400">Actual:</span>
            <span class="ml-2 font-medium">{{ alert.actual_value }}</span>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>Created: {{ formatDateTime(alert.created_at) }}</span>
          <span v-if="alert.resolved_at">Resolved: {{ formatDateTime(alert.resolved_at) }}</span>
          <span v-if="alert.resolved_by">By: {{ alert.resolved_by }}</span>
        </div>

        <!-- Resolution Notes -->
        <div v-if="alert.resolved_notes" class="mt-3 p-3 bg-gray-800 rounded-lg">
          <span class="text-sm text-gray-400">Resolution Notes:</span>
          <p class="text-sm mt-1">{{ alert.resolved_notes }}</p>
        </div>
      </div>

      <!-- Action Buttons - Desktop -->
      <div class="flex flex-col space-y-2 ml-4">
        <button 
          v-if="!alert.resolved" 
          @click="$emit('resolve', alert)"
          class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors cursor-pointer"
        >
          Resolve
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['resolve'])

// Helper functions
const getSeverityClasses = (severity) => {
  switch (severity) {
    case 'critical': return 'border-red-500 bg-red-900/10'
    case 'warning': return 'border-yellow-500 bg-yellow-900/10'
    case 'info': return 'border-blue-500 bg-blue-900/10'
    default: return 'border-gray-500 bg-gray-900/10'
  }
}

const getSeverityDotClasses = (severity) => {
  switch (severity) {
    case 'critical': return 'bg-red-500'
    case 'warning': return 'bg-yellow-500'
    case 'info': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

const getSeverityBadgeClasses = (severity) => {
  switch (severity) {
    case 'critical': return 'bg-red-900/30 text-red-400'
    case 'warning': return 'bg-yellow-900/30 text-yellow-400'
    case 'info': return 'bg-blue-900/30 text-blue-400'
    default: return 'bg-gray-900/30 text-gray-400'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>