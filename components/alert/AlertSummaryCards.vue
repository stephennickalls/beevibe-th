<!-- components/alert/AlertSummaryCards.vue -->
<template>
  <div class="bg-gray-900 rounded-lg p-3 mb-4">
    <div class="flex items-center justify-between gap-4">
      <!-- Critical Alerts -->
      <div class="flex items-center space-x-2 flex-1">
        <div class="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
        </div>
        <div>
          <span class="text-lg font-bold">{{ criticalCount }}</span>
          <span class="text-xs text-gray-400 ml-1">Critical</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-gray-700"></div>

      <!-- Warning Alerts -->
      <div class="flex items-center space-x-2 flex-1">
        <div class="w-5 h-5 bg-yellow-600 rounded flex items-center justify-center">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
        </div>
        <div>
          <span class="text-lg font-bold">{{ warningCount }}</span>
          <span class="text-xs text-gray-400 ml-1">Warning</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-gray-700"></div>

      <!-- Info Alerts -->
      <div class="flex items-center space-x-2 flex-1">
        <div class="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
        </div>
        <div>
          <span class="text-lg font-bold">{{ infoCount }}</span>
          <span class="text-xs text-gray-400 ml-1">Info</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-gray-700"></div>

      <!-- Resolved Today -->
      <div class="flex items-center space-x-2 flex-1">
        <div class="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
        </div>
        <div>
          <span class="text-lg font-bold">{{ resolvedCount }}</span>
          <span class="text-xs text-gray-400 ml-1">Resolved</span>
        </div>
      </div>
    </div>

    <!-- Mobile Layout - Stack vertically on very small screens -->
    <div class="sm:hidden">
      <div class="grid grid-cols-2 gap-2 mt-3">
        <!-- Critical & Warning on top row -->
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-bold">{{ criticalCount }}</span>
            <span class="text-xs text-gray-400 ml-1">Critical</span>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-yellow-600 rounded flex items-center justify-center">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-bold">{{ warningCount }}</span>
            <span class="text-xs text-gray-400 ml-1">Warning</span>
          </div>
        </div>

        <!-- Info & Resolved on bottom row -->
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-bold">{{ infoCount }}</span>
            <span class="text-xs text-gray-400 ml-1">Info</span>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-bold">{{ resolvedCount }}</span>
            <span class="text-xs text-gray-400 ml-1">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  criticalCount: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  },
  infoCount: {
    type: Number,
    default: 0
  },
  resolvedCount: {
    type: Number,
    default: 0
  }
})
</script>