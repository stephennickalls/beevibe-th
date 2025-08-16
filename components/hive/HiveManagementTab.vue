<template>
  <div>
    <!-- Tab Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Hive Management</h2>
      <div class="flex gap-2">
        <button 
          @click="handleAddHive"
          :disabled="!canAdd"
          class="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 rounded-lg transition-colors flex items-center gap-2"
          :title="!canAdd ? upgradeMessage : 'Add a new hive to this apiary'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Add Hive
        </button>
      </div>
    </div>

    <!-- Subscription Limit Warning (if near limit) -->
    <div v-if="showLimitWarning" class="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"/>
        </svg>
        <div class="flex-1">
          <p class="text-sm text-yellow-300">
            You're using {{ currentUsage.hives }} of {{ subscription?.limits?.max_hives }} hives on your {{ subscription?.planDisplayName }} plan.
          </p>
          <p v-if="!canAdd" class="text-xs text-yellow-200 mt-1">
            {{ upgradeMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Hives Grid -->
    <div v-if="hives.length > 0" class="space-y-4">
      <EnhancedHiveCard
        v-for="hive in hives"
        :key="hive.id"
        :hive="hive"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" viewBox="0 0 55 56" fill="currentColor">
        <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51Z"/>
        <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51Z"/>
        <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51Z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-300 mb-2">No Hives Yet</h3>
      <p class="text-gray-400 mb-4">Start by adding your first hive to this apiary.</p>
      <button 
        @click="handleAddHive"
        :disabled="!canAdd"
        class="px-6 py-3 bg-brand-yellow hover:bg-brand-yellow-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 rounded-lg transition-colors"
        :title="!canAdd ? upgradeMessage : 'Add your first hive to this apiary'"
      >
        {{ canAdd ? 'Add Your First Hive' : 'Upgrade to Add Hives' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EnhancedHiveCard from '../hive/EnhancedHiveCard.vue'

// Props
const props = defineProps({
  hives: {
    type: Array,
    default: () => []
  },
  canAdd: {
    type: Boolean,
    default: true
  },
  subscription: {
    type: Object,
    default: null
  },
  currentUsage: {
    type: Object,
    default: () => ({ hives: 0, sensors: 0 })
  },
  upgradeMessage: {
    type: String,
    default: ''
  }
})

// Events
const emit = defineEmits(['addHive'])

// Computed properties
const showLimitWarning = computed(() => {
  if (!props.subscription || props.subscription.limits.max_hives === -1) return false
  const usagePercent = (props.currentUsage.hives / props.subscription.limits.max_hives) * 100
  return usagePercent >= 80
})

// Methods
const handleAddHive = () => {
  if (!props.canAdd) return
  emit('addHive')
}
</script>

<style scoped>
/* Ensure consistent spacing and responsive grid */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

/* Brand colors - fallbacks for Tailwind */
.bg-brand-yellow {
  background-color: #F9E900;
}

.hover\:bg-brand-yellow-hover:hover {
  background-color: #E6D200;
}
</style>