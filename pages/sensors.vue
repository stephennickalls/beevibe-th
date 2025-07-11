<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold">Sensors</h1>
          <p class="text-gray-400 mt-1">Manage all sensors across your hives</p>
        </div>
        <div class="flex space-x-3">
          <button @click="showAddSensorModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Sensor</span>
          </button>
          <button @click="refreshSensors" :disabled="loading" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

    <!-- Compact Filters Section -->
      <div class="bg-gray-900 rounded-lg mb-6">
        <!-- Filter Header -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-4">
            <button 
              @click="showFilters = !showFilters"
              class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg 
                class="w-4 h-4 transform transition-transform" 
                :class="{ 'rotate-180': showFilters }"
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
              <span class="font-medium">Filters & Search</span>
            </button>
            
            <!-- Active Filter Indicators -->
            <div v-if="hasActiveFilters" class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span class="text-xs text-blue-400">{{ activeFilterCount }} active</span>
              </div>
              <button 
                @click="clearFilters" 
                class="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="text-sm text-gray-400">
            {{ filteredSensors.length }} of {{ sensors.length }} sensors
          </div>
        </div>

        <!-- Expandable Filter Content -->
        <div 
          v-show="showFilters" 
          class="border-t border-gray-700 p-4 space-y-4"
        >
          <!-- Search Row -->
          <div>
            <label class="block text-sm font-medium mb-2">Search Sensors</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, type, model, or hive..."
                class="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
              </svg>
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-3 text-gray-400 hover:text-gray-300 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Controls Grid (2x2) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Sensor Type Filter -->
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <select v-model="filterType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option value="">All Types</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="weight">Weight</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-2">Status</label>
              <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <!-- Hive Assignment Filter -->
            <div>
              <label class="block text-sm font-medium mb-2">Assignment</label>
              <select v-model="filterAssignment" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option value="">All Sensors</option>
                <option value="assigned">Assigned to Hive</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            <!-- Battery Level Filter -->
            <div>
              <label class="block text-sm font-medium mb-2">Battery Level</label>
              <select v-model="filterBattery" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option value="">All Levels</option>
                <option value="high">High (>50%)</option>
                <option value="medium">Medium (20-50%)</option>
                <option value="low">Low (<20%)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center space-x-3">
              <button 
                v-if="hasActiveFilters"
                @click="clearFilters" 
                class="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
                <span>Clear All Filters</span>
              </button>
              
              <!-- Save/Load Filter Presets (Future feature) -->
              <button 
                class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer"
                disabled
                title="Save filter presets (coming soon)"
              >
                Save Preset
              </button>
            </div>
            
            <button 
              @click="showFilters = false"
              class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer"
            >
              Hide Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading sensors...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Error Loading Sensors</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button @click="refreshSensors" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      </div>

      <!-- No Sensors State -->
      <div v-else-if="filteredSensors.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-semibold mb-2">No Sensors Found</h3>
        <p class="text-gray-400 mb-4">
          {{ hasActiveFilters ? 'No sensors match your current filters.' : 'Get started by adding your first sensor.' }}
        </p>
        <button 
          v-if="!hasActiveFilters" 
          @click="showAddSensorModal = true" 
          class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Add First Sensor
        </button>
      </div>

      <!-- Sensors Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="sensor in filteredSensors"
          :key="sensor.id"
          class="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <!-- Sensor Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-1">
                {{ sensor.name || `${sensor.sensor_type} Sensor` }}
              </h3>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-400 capitalize">{{ sensor.sensor_type }}</span>
                <span class="text-gray-500">•</span>
                <span class="text-sm text-gray-400">{{ sensor.model || 'Unknown model' }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <div :class="sensor.is_online ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full"></div>
              <span :class="sensor.is_online ? 'text-green-400' : 'text-red-400'" class="text-xs">
                {{ sensor.is_online ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>

          <!-- Sensor Details -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Battery:</span>
              <span :class="getBatteryColor(sensor.battery_level)">
                {{ sensor.battery_level || 'Unknown' }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Hive:</span>
              <span v-if="sensor.hive_name" class="text-blue-400 hover:text-blue-300">
                <NuxtLink :to="`/hives/${sensor.hive_id}`">
                  {{ sensor.hive_name }}
                </NuxtLink>
              </span>
              <span v-else class="text-gray-500">Unassigned</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Last Reading:</span>
              <span class="text-gray-300">{{ formatTime(sensor.last_reading_at) || 'No readings' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Created:</span>
              <span class="text-gray-300">{{ formatDate(sensor.created_at) }}</span>
            </div>
          </div>
                    <!-- Sensor UUID Section -->
          <div class="mb-4 p-3 bg-gray-800 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-300">Sensor UUID</span>
              <div class="flex items-center space-x-2">
                <button 
                  @click="toggleSensorUuid(sensor.id)" 
                  class="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                  :title="showSensorUuids[sensor.id] ? 'Hide UUID' : 'Show UUID'"
                >
                  <svg v-if="showSensorUuids[sensor.id]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </button>
                <button 
                  v-if="showSensorUuids[sensor.id] && sensor.uuid" 
                  @click="copyToClipboard(sensor.uuid, 'Sensor UUID')"
                  class="text-gray-400 hover:text-white text-xs cursor-pointer"
                  title="Copy UUID"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="font-mono text-xs bg-gray-700 px-3 py-2 rounded border">
              <span v-if="!showSensorUuids[sensor.id]" class="text-gray-400">••••••••-••••-••••-••••-••••••••••••</span>
              <span v-else class="text-gray-300 break-all">{{ sensor.uuid || 'Not set' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between">
            <button
              @click="openDeleteSensorModal(sensor)"
              class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              @click="openSensorDetailModal(sensor)"
              class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      <!-- Add Sensor Modal -->
      <div v-if="showAddSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 class="text-xl font-semibold">Add New Sensor</h3>
            <button @click="closeAddSensorModal" class="text-gray-400 hover:text-white cursor-pointer">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Sensor Type</label>
              <select v-model="newSensor.sensor_type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="">Select type...</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="weight">Weight</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Sensor Name</label>
              <input v-model="newSensor.name" type="text" placeholder="e.g., Main Temperature Sensor" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Model</label>
              <input v-model="newSensor.model" type="text" placeholder="e.g., DHT22, DS18B20" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Battery Level (%)</label>
              <input v-model="newSensor.battery_level" type="number" min="0" max="100" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Assign to Hive (Optional)</label>
              <select v-model="newSensor.hive_id" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="">Leave unassigned</option>
                <option v-for="hive in availableHives" :key="hive.id" :value="hive.id">
                  {{ hive.name || `Hive ${hive.id}` }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
            <button @click="closeAddSensorModal" class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer">Cancel</button>
            <button @click="addSensor" :disabled="!newSensor.sensor_type || addingSensor" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg cursor-pointer">
              {{ addingSensor ? 'Adding...' : 'Add Sensor' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sensor Edit Modal -->
      <SensorEditModal
        :show="showSensorDetailModal"
        :sensor="selectedSensor"
        :available-hives="availableHives"
        :updating="updatingSensor"
        @close="closeSensorDetailModal"
        @save="handleSensorSave"
      />

      <!-- Delete Sensor Confirmation Modal -->
      <div v-if="showDeleteSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center space-x-3 mb-4">
              <svg class="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
              </svg>
              <h3 class="text-lg font-semibold">Delete Sensor</h3>
            </div>
            
            <div class="mb-6">
              <p class="text-gray-300 mb-4">
                Are you sure you want to delete the sensor "{{ deleteSensorForm.sensorToDelete?.name || `${deleteSensorForm.sensorToDelete?.sensor_type} Sensor` }}"?
              </p>
              <p class="text-gray-300 mb-4">
                This action cannot be undone and will permanently remove the sensor and all its historical data.
              </p>
              
              <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p class="text-red-300 text-sm mb-2">
                  To confirm deletion, please type the sensor name below:
                </p>
                <p class="text-white font-mono text-sm mb-3 bg-gray-900 px-3 py-2 rounded">
                  {{ deleteSensorForm.sensorToDelete?.name || `${deleteSensorForm.sensorToDelete?.sensor_type} Sensor` }}
                </p>
                <input
                  v-model="deleteSensorForm.confirmationName"
                  type="text"
                  placeholder="Type sensor name to confirm"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  :class="{ 'border-red-500': deleteSensorForm.confirmationName && !canDeleteSensor }"
                />
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button @click="closeDeleteSensorModal" class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer" :disabled="deletingSensor">
                Cancel
              </button>
              <button 
                @click="deleteSensor" 
                :disabled="!canDeleteSensor || deletingSensor" 
                class="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg v-if="deletingSensor" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ deletingSensor ? 'Deleting...' : 'Delete Sensor' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import SensorEditModal from '~/components/SensorEditModal.vue'

// Meta
definePageMeta({
  title: 'Sensors - BeeVibe Dashboard'
})

// Reactive data
const loading = ref(true)
const error = ref(null)
const sensors = ref([])
const availableHives = ref([])
const activeAlerts = ref([])

// Filter states
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterAssignment = ref('')
const filterBattery = ref('')

// Modal states
const showAddSensorModal = ref(false)
const showSensorDetailModal = ref(false)
const showDeleteSensorModal = ref(false)

// Loading states
const addingSensor = ref(false)
const updatingSensor = ref(false)
const deletingSensor = ref(false)

// UI states
const showSensorUuids = ref({})
const showFilters = ref(false)

// Form data
const newSensor = ref({
  sensor_type: '',
  name: '',
  model: '',
  battery_level: 100,
  hive_id: ''
})

const deleteSensorForm = ref({
  sensorToDelete: null,
  confirmationName: ''
})

// Component-related data
const selectedSensor = ref(null)

// Computed properties
const filteredSensors = computed(() => {
  let filtered = sensors.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sensor => 
      (sensor.name && sensor.name.toLowerCase().includes(query)) ||
      sensor.sensor_type.toLowerCase().includes(query) ||
      (sensor.model && sensor.model.toLowerCase().includes(query)) ||
      (sensor.hive_name && sensor.hive_name.toLowerCase().includes(query))
    )
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter(sensor => sensor.sensor_type === filterType.value)
  }

  // Status filter
  if (filterStatus.value) {
    const isOnline = filterStatus.value === 'online'
    filtered = filtered.filter(sensor => sensor.is_online === isOnline)
  }

  // Assignment filter
  if (filterAssignment.value) {
    if (filterAssignment.value === 'assigned') {
      filtered = filtered.filter(sensor => sensor.hive_id)
    } else if (filterAssignment.value === 'unassigned') {
      filtered = filtered.filter(sensor => !sensor.hive_id)
    }
  }

  // Battery filter
  if (filterBattery.value) {
    filtered = filtered.filter(sensor => {
      const level = sensor.battery_level
      if (filterBattery.value === 'high') return level > 50
      if (filterBattery.value === 'medium') return level >= 20 && level <= 50
      if (filterBattery.value === 'low') return level < 20
      if (filterBattery.value === 'unknown') return !level
      return true
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterType.value || filterStatus.value || filterAssignment.value || filterBattery.value
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterType.value) count++
  if (filterStatus.value) count++
  if (filterAssignment.value) count++
  if (filterBattery.value) count++
  return count
})

const canDeleteSensor = computed(() => {
  if (!deleteSensorForm.value.sensorToDelete) return false
  const sensorName = deleteSensorForm.value.sensorToDelete.name || `${deleteSensorForm.value.sensorToDelete.sensor_type} Sensor`
  return deleteSensorForm.value.confirmationName.trim() === sensorName
})

// Utility functions
const formatTime = (date) => {
  if (!date) return 'No recent data'
  
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

const formatDate = (date) => {
  if (!date) return 'Not set'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getBatteryColor = (level) => {
  if (!level) return 'text-gray-400'
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// UUID functions
const toggleSensorUuid = (sensorId) => {
  showSensorUuids.value[sensorId] = !showSensorUuids.value[sensorId]
}

// Filter functions
const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
  filterAssignment.value = ''
  filterBattery.value = ''
}

// Modal functions
const closeAddSensorModal = () => {
  showAddSensorModal.value = false
  newSensor.value = {
    sensor_type: '',
    name: '',
    model: '',
    battery_level: 100,
    hive_id: ''
  }
}

const closeSensorDetailModal = () => {
  selectedSensor.value = null
  showSensorDetailModal.value = false
  updatingSensor.value = false
}

const closeDeleteSensorModal = () => {
  showDeleteSensorModal.value = false
  deleteSensorForm.value = {
    sensorToDelete: null,
    confirmationName: ''
  }
  deletingSensor.value = false
}

const openSensorDetailModal = (sensor) => {
  selectedSensor.value = sensor
  showSensorDetailModal.value = true
}

const openDeleteSensorModal = (sensor) => {
  deleteSensorForm.value.sensorToDelete = sensor
  deleteSensorForm.value.confirmationName = ''
  showDeleteSensorModal.value = true
}

// API functions
const fetchSensors = async () => {
  try {
    const { data, error: sensorsError } = await $fetch('/api/sensors')
    
    if (sensorsError) {
      error.value = sensorsError
      return
    }
    
    sensors.value = data || []
    
  } catch (err) {
    error.value = 'Failed to load sensors'
    console.error('Error fetching sensors:', err)
  }
}

const fetchHives = async () => {
  try {
    const { data, error: hivesError } = await $fetch('/api/hives')
    
    if (!hivesError && data) {
      availableHives.value = data
    }
  } catch (err) {
    console.error('Error fetching hives:', err)
  }
}

const fetchAlerts = async () => {
  try {
    const { data, error: alertsError } = await $fetch('/api/alerts')
    
    if (!alertsError && data) {
      activeAlerts.value = data.filter(alert => !alert.resolved)
    }
  } catch (err) {
    console.error('Error fetching alerts:', err)
  }
}

const refreshSensors = async () => {
  loading.value = true
  error.value = null
  
  await Promise.all([
    fetchSensors(),
    fetchHives(),
    fetchAlerts()
  ])
  
  loading.value = false
}

const addSensor = async () => {
  addingSensor.value = true
  
  try {
    const { data, error: sensorError } = await $fetch('/api/sensors', {
      method: 'POST',
      body: {
        sensor_type: newSensor.value.sensor_type,
        name: newSensor.value.name.trim() || `${newSensor.value.sensor_type} Sensor`,
        model: newSensor.value.model.trim() || null,
        battery_level: newSensor.value.battery_level,
        hive_id: newSensor.value.hive_id || null,
        is_online: true
      }
    })
    
    if (!sensorError && data) {
      // Add hive name to the sensor if assigned
      if (data.hive_id) {
        const hive = availableHives.value.find(h => h.id === data.hive_id)
        if (hive) {
          data.hive_name = hive.name || `Hive ${hive.id}`
        }
      }
      
      sensors.value.push(data)
      closeAddSensorModal()
    }
  } catch (err) {
    console.error('Error adding sensor:', err)
    alert('Failed to add sensor. Please try again.')
  } finally {
    addingSensor.value = false
  }
}

const handleSensorSave = async (formData) => {
  if (!selectedSensor.value || updatingSensor.value) return
  
  updatingSensor.value = true
  
  try {
    const { data, error: updateError } = await $fetch(`/api/sensors/${selectedSensor.value.id}`, {
      method: 'PUT',
      body: {
        name: formData.name.trim() || `${selectedSensor.value.sensor_type} Sensor`,
        model: formData.model.trim() || null,
        battery_level: formData.battery_level,
        is_online: formData.is_online,
        hive_id: formData.hive_id || null
      }
    })
    
    if (!updateError && data) {
      // Add hive name to the updated sensor
      if (data.hive_id) {
        const hive = availableHives.value.find(h => h.id === data.hive_id)
        if (hive) {
          data.hive_name = hive.name || `Hive ${hive.id}`
        }
      } else {
        data.hive_name = null
      }
      
      // Update the sensor in the local array
      const sensorIndex = sensors.value.findIndex(s => s.id === selectedSensor.value.id)
      if (sensorIndex !== -1) {
        sensors.value[sensorIndex] = { ...sensors.value[sensorIndex], ...data }
      }
      closeSensorDetailModal()
    }
  } catch (err) {
    console.error('Error updating sensor:', err)
    alert('Failed to update sensor. Please try again.')
  } finally {
    updatingSensor.value = false
  }
}

const deleteSensor = async () => {
  if (!canDeleteSensor.value || deletingSensor.value) return
  
  deletingSensor.value = true
  
  try {
    const { error: deleteError } = await $fetch(`/api/sensors/${deleteSensorForm.value.sensorToDelete.id}`, {
      method: 'DELETE'
    })
    
    if (!deleteError) {
      sensors.value = sensors.value.filter(s => s.id !== deleteSensorForm.value.sensorToDelete.id)
      closeDeleteSensorModal()
    }
  } catch (err) {
    console.error('Error deleting sensor:', err)
    alert('Failed to delete sensor. Please try again.')
  } finally {
    deletingSensor.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await refreshSensors()
})
</script>

<style scoped>
/* Custom scrollbar for modals */
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>

<style scoped>
/* Custom scrollbar for modals */
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
