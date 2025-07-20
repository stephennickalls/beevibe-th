<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Alert Banner -->
      <div v-if="criticalAlerts.length > 0" class="bg-red-600 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <span class="font-semibold">Critical Alerts:</span>
          <span>{{ criticalAlerts.length }} hive(s) need immediate attention</span>
        </div>
      </div>

      <!-- Error Banner -->
      <div v-if="error" class="bg-red-600 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <span class="font-semibold">Error:</span>
            <span>{{ error }}</span>
          </div>
          <button @click="error = null" class="text-white hover:text-gray-200">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Subscription Status Strip -->
      <div v-if="user && subscription" class="mb-6">
        <div class="bg-gray-900 rounded-lg p-4 border" :class="subscriptionStripClasses">
          <div class="flex items-center justify-between">
            <!-- Left Side: Plan Info -->
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" :class="planStatusColor"></div>
                <span class="font-medium">{{ subscription.planDisplayName || 'Free' }} Plan</span>
              </div>
              
              <!-- Usage Stats -->
              <div class="flex items-center space-x-4 text-sm">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  <span>Hives:</span>
                  <span class="font-medium" :class="hiveUsageColor">
                    {{ currentUsage.hives || 0 }}/{{ subscription.limits?.max_hives === -1 ? '∞' : subscription.limits?.max_hives || 0 }}
                  </span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
            <div class="flex items-center space-x-3">
              <div v-if="isNearLimits" class="text-xs text-yellow-400 hidden sm:block">
                {{ nearLimitMessage }}
              </div>
              
              <button
                @click="navigateTo('/pricing')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="upgradeButtonClasses"
              >
                <span class="flex items-center space-x-1">
                  <svg v-if="isAtLimits" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"/>
                  </svg>
                  <span>{{ upgradeButtonText }}</span>
                </span>
              </button>
            </div>
          </div>
          
          <!-- Mobile: Near Limit Message -->
          <div v-if="isNearLimits" class="mt-2 text-xs text-yellow-400 sm:hidden">
            {{ nearLimitMessage }}
          </div>
        </div>
      </div>
      <!-- Main Layout: Hives Grid + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Hive Status Overview Section -->
        <div class="lg:col-span-3">
          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Hive Status Overview</h2>
              <div class="text-sm text-gray-400">
                {{ hiveData.length }} {{ hiveData.length === 1 ? 'hive' : 'hives' }} total
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
              <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-400">Loading your hives...</p>
            </div>

            <!-- Authentication Required State -->
            <div v-else-if="!user" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
              </svg>
              <h3 class="text-lg font-semibold mb-2 text-gray-300">Authentication Required</h3>
              <p class="text-gray-400 mb-4">Please log in to view your hives</p>
              <button 
                @click="navigateTo('/auth/login')"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>

            <!-- Enhanced Hive Cards with Sensor Details -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <!-- Existing Hive Cards with Enhanced Sensor Display -->
              <div 
                v-for="hive in hiveData" 
                :key="hive.id"
                @click="navigateToHive(hive)"
                class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600 relative"
              >
                <!-- Hive Header -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-lg truncate">{{ hive.name || `Hive ${hive.id}` }}</h3>
                    <p v-if="hive.description" class="text-xs text-gray-400 truncate">
                      {{ hive.description }}
                    </p>
                    <p v-else class="text-xs text-gray-400">No description</p>
                  </div>
                  <div class="flex items-center space-x-1 flex-shrink-0">
                    <div :class="getHiveStatus(hive).color" class="w-2 h-2 rounded-full"></div>
                    <span class="text-xs" :class="getHiveStatus(hive).textColor">{{ getHiveStatus(hive).status }}</span>
                  </div>
                </div>

                <!-- Quick Metrics Grid (if readings available) -->
                <div v-if="hive.temperature || hive.humidity || hive.weight" class="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-900 rounded-lg">
                  <div class="text-center">
                    <div class="text-xs text-gray-400 mb-1">Temp</div>
                    <div class="font-medium text-sm">
                      {{ hive.temperature ? `${hive.temperature.toFixed(1)}°C` : 'N/A' }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-gray-400 mb-1">Humidity</div>
                    <div class="font-medium text-sm">
                      {{ hive.humidity ? `${hive.humidity.toFixed(1)}%` : 'N/A' }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-gray-400 mb-1">Weight</div>
                    <div class="font-medium text-sm">
                      {{ hive.weight ? `${(hive.weight / 1000).toFixed(1)}kg` : 'N/A' }}
                    </div>
                  </div>
                </div>

                <!-- Detailed Sensors List -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-medium text-gray-300">Sensors</h4>
                    <span class="text-xs text-gray-400">{{ hive.sensor_count || 0 }} total</span>
                  </div>
                  
                  <!-- No Sensors State -->
                  <div v-if="!hive.sensors || hive.sensors.length === 0" class="text-center py-6 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    <p class="text-xs text-gray-500">No sensors installed</p>
                    <p class="text-xs text-gray-600 mt-1">Click to add sensors</p>
                  </div>
                  
                  <!-- Sensors List -->
                  <div v-else class="space-y-2 max-h-32 overflow-y-auto">
                    <div 
                      v-for="sensor in hive.sensors" 
                      :key="sensor.id"
                      class="flex items-center justify-between p-2 bg-gray-900 rounded-lg hover:bg-gray-750 transition-colors"
                      @click.stop="showSensorDetails(sensor, hive)"
                    >
                      <div class="flex items-center space-x-2 flex-1 min-w-0">
                        <!-- Sensor Type Icon -->
                        <div class="flex-shrink-0">
                          <svg v-if="sensor.sensor_type === 'temperature'" class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                          </svg>
                          <svg v-else-if="sensor.sensor_type === 'humidity'" class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
                          </svg>
                          <svg v-else-if="sensor.sensor_type === 'weight'" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                          <svg v-else class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        
                        <!-- Sensor Info -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center space-x-2">
                            <span class="text-xs font-medium truncate">{{ sensor.name || `${sensor.sensor_type} Sensor` }}</span>
                            <div :class="['w-1.5 h-1.5 rounded-full', sensor.is_online ? 'bg-green-400' : 'bg-red-400']"></div>
                          </div>
                          <div class="text-xs text-gray-400">
                            {{ getSensorTypeLabel(sensor.sensor_type) }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- Latest Reading -->
                      <div class="text-right flex-shrink-0">
                        <div v-if="sensor.latest_reading" class="text-xs font-medium">
                          {{ formatSensorValue(sensor.latest_reading.value, sensor.sensor_type, sensor.latest_reading.unit) }}
                        </div>
                        <div v-else class="text-xs text-gray-500">No data</div>
                        <div class="text-xs text-gray-500">
                          {{ sensor.latest_reading ? formatTime(sensor.latest_reading.reading_time) : 'Never' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Hive Footer -->
                <div class="flex justify-between items-center pt-3 border-t border-gray-700">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400">
                      Updated {{ formatTime(hive.last_sensor_reading || hive.updated_at) }}
                    </span>
                    <div v-if="hive.online_sensor_count > 0" class="flex items-center space-x-1">
                      <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span class="text-xs text-green-400">{{ hive.online_sensor_count }}/{{ hive.sensor_count }} online</span>
                    </div>
                  </div>
                  <span class="text-xs text-blue-400">View Details →</span>
                </div>

                <!-- Battery Warning Indicator -->
                <div v-if="hasLowBatterySensors(hive)" class="absolute top-2 right-2">
                  <div class="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center" title="Low battery sensors">
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Add New Hive Card -->
              <div
                v-if="user"
                @click="showAddHiveModal = true"
                class="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-gray-500 hover:bg-gray-750 transition-colors flex flex-col items-center justify-center min-h-[280px]"
              >
                <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 text-gray-300">Add New Hive</h3>
                <p class="text-gray-400 text-sm text-center">
                  Click to add a new hive to your monitoring network
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Alerts & System Info -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Active Alerts -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Active Alerts</h3>
              <span class="text-xs text-gray-400">{{ activeAlerts.length }} active</span>
            </div>
            
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div v-if="!user" class="text-center py-8 text-gray-400">
                <p class="text-sm">Login to view alerts</p>
              </div>
              
              <div v-else-if="activeAlerts.length === 0" class="text-center py-8 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <p class="text-sm">All systems normal</p>
              </div>
              
              <div v-for="alert in activeAlerts.slice(0, 5)" :key="alert.id" 
                   class="p-3 rounded-lg" 
                   :class="alert.severity === 'critical' ? 'bg-red-900/30 border border-red-500/30' : 
                           alert.severity === 'warning' ? 'bg-yellow-900/30 border border-yellow-500/30' : 
                           'bg-blue-900/30 border border-blue-500/30'">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ alert.title }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ alert.hiveName }} • {{ formatTime(alert.created_at) }}</p>
                  </div>
                  <button @click="dismissAlert(alert.id)" class="text-xs text-gray-400 hover:text-white ml-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <h3 class="font-semibold mb-3">System Status</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm">Sensor Network</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Data Sync</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-xs text-green-400">Synced</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Battery Levels</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span class="text-xs text-yellow-400">Good</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Last Update</span>
                <span class="text-xs text-gray-400">{{ lastUpdateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Hive Modal Component -->
      <AddHiveModal
        :show="showAddHiveModal"
        :creating="addingHive"
        :subscription="subscription"
        :current-usage="currentUsage"
        @close="closeModal"
        @create="handleAddHive"
      />

      <!-- Sensor Details Modal -->
      <div v-if="showSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
          <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 class="text-lg font-semibold">Sensor Details</h3>
            <button @click="closeSensorModal" class="text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedSensorDetails" class="p-4 space-y-4">
            <!-- Sensor Basic Info -->
            <div>
              <h4 class="font-medium mb-2">{{ selectedSensorDetails.sensor.name || `${selectedSensorDetails.sensor.sensor_type} Sensor` }}</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">Type:</span>
                  <span class="ml-2">{{ getSensorTypeLabel(selectedSensorDetails.sensor.sensor_type) }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Status:</span>
                  <span class="ml-2" :class="selectedSensorDetails.sensor.is_online ? 'text-green-400' : 'text-red-400'">
                    {{ selectedSensorDetails.sensor.is_online ? 'Online' : 'Offline' }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-400">Battery:</span>
                  <span class="ml-2" :class="getBatteryColor(selectedSensorDetails.sensor.battery_level)">
                    {{ selectedSensorDetails.sensor.battery_level }}%
                  </span>
                </div>
                <div v-if="selectedSensorDetails.sensor.model">
                  <span class="text-gray-400">Model:</span>
                  <span class="ml-2">{{ selectedSensorDetails.sensor.model }}</span>
                </div>
              </div>
            </div>

            <!-- Latest Reading -->
            <div v-if="selectedSensorDetails.sensor.latest_reading" class="border-t border-gray-700 pt-4">
              <h5 class="font-medium mb-2">Latest Reading</h5>
              <div class="bg-gray-900 rounded-lg p-3">
                <div class="text-2xl font-bold mb-1">
                  {{ formatSensorValue(selectedSensorDetails.sensor.latest_reading.value, selectedSensorDetails.sensor.sensor_type, selectedSensorDetails.sensor.latest_reading.unit) }}
                </div>
                <div class="text-sm text-gray-400">
                  {{ formatDateTime(selectedSensorDetails.sensor.latest_reading.reading_time) }}
                </div>
                <div v-if="selectedSensorDetails.sensor.latest_reading.signal_strength" class="text-xs text-gray-500 mt-1">
                  Signal: {{ selectedSensorDetails.sensor.latest_reading.signal_strength }}%
                </div>
              </div>
            </div>

            <!-- No Reading State -->
            <div v-else class="border-t border-gray-700 pt-4 text-center">
              <div class="text-gray-400 py-4">
                <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
                <p class="text-sm">No readings available</p>
              </div>
            </div>

            <!-- Hive Info -->
            <div class="border-t border-gray-700 pt-4">
              <h5 class="font-medium mb-2">Hive Assignment</h5>
              <p class="text-sm text-gray-400">
                Assigned to: <span class="text-white">{{ selectedSensorDetails.hive.name }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AddHiveModal from '~/components/AddHiveModal.vue'

// Meta
definePageMeta({
  title: 'My Hives - BeeVibe Dashboard'
})

// Get user from Supabase auth
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// Reactive data
const loading = ref(true)
const showAddHiveModal = ref(false)
const addingHive = ref(false)
const error = ref(null)

// Enhanced form data for new hive - now handled by component
const newHive = ref({
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  installation_date: new Date().toISOString().split('T')[0]
})

// Data refs
const hiveData = ref([])
const alerts = ref([])
const sensors = ref([])

// Current usage data for the modal (subscription comes from useSubscription)
const currentUsage = ref({ hives: 0, sensors: 0 })

// Sensor modal state
const showSensorModal = ref(false)
const selectedSensorDetails = ref(null)

// Update interval
let updateInterval

// Form validation
const isFormValid = computed(() => {
  return newHive.value.name.trim().length > 0
})

// Computed properties
const activeAlerts = computed(() => {
  return alerts.value
    .filter(alert => !alert.resolved)
    .map(alert => ({
      ...alert,
      hiveName: hiveData.value.find(h => h.id === alert.hive_id)?.name || 'Unknown Hive'
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const criticalAlerts = computed(() => {
  return activeAlerts.value.filter(alert => alert.severity === 'critical')
})

const lastUpdateTime = computed(() => {
  const times = hiveData.value
    .map(h => [h.temperature_time, h.humidity_time, h.weight_time])
    .flat()
    .filter(Boolean)
    .map(t => new Date(t))
  
  if (times.length === 0) return 'Never'
  
  const mostRecent = Math.max(...times)
  return formatTime(mostRecent)
})

// Subscription status computed properties
const isAtLimits = computed(() => {
  if (!subscription.value) return false
  
  const hivesAtLimit = subscription.value.limits?.max_hives !== -1 && 
                      currentUsage.value.hives >= subscription.value.limits?.max_hives
  const sensorsAtLimit = subscription.value.limits?.max_sensors_total !== -1 && 
                        currentUsage.value.sensors >= subscription.value.limits?.max_sensors_total
  
  return hivesAtLimit || sensorsAtLimit
})

const isNearLimits = computed(() => {
  if (!subscription.value) return false
  
  const hivesNearLimit = subscription.value.limits?.max_hives !== -1 && 
                        currentUsage.value.hives >= subscription.value.limits?.max_hives * 0.8
  const sensorsNearLimit = subscription.value.limits?.max_sensors_total !== -1 && 
                          currentUsage.value.sensors >= subscription.value.limits?.max_sensors_total * 0.8
  
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
  if (!subscription.value) return 'text-gray-300'
  
  const limit = subscription.value.limits?.max_hives
  if (limit === -1) return 'text-green-400'
  
  const usage = currentUsage.value.hives
  if (usage >= limit) return 'text-red-400'
  if (usage >= limit * 0.8) return 'text-yellow-400'
  return 'text-green-400'
})

const sensorUsageColor = computed(() => {
  if (!subscription.value) return 'text-gray-300'
  
  const limit = subscription.value.limits?.max_sensors_total
  if (limit === -1) return 'text-green-400'
  
  const usage = currentUsage.value.sensors
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
  if (!subscription.value) return ''
  
  const hiveLimit = subscription.value.limits?.max_hives
  const sensorLimit = subscription.value.limits?.max_sensors_total
  
  if (hiveLimit !== -1 && currentUsage.value.hives >= hiveLimit) {
    return 'Hive limit reached'
  }
  if (sensorLimit !== -1 && currentUsage.value.sensors >= sensorLimit) {
    return 'Sensor limit reached'
  }
  if (hiveLimit !== -1 && currentUsage.value.hives >= hiveLimit * 0.8) {
    return `${hiveLimit - currentUsage.value.hives} hives remaining`
  }
  if (sensorLimit !== -1 && currentUsage.value.sensors >= sensorLimit * 0.8) {
    return `${sensorLimit - currentUsage.value.sensors} sensors remaining`
  }
  
  return ''
})

// Functions
const getHiveStatus = (hive) => {
  const temp = hive.temperature
  const humidity = hive.humidity
  
  if (!temp || !humidity) {
    return { status: 'No Data', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  if (temp < 30 || temp > 40 || humidity < 45 || humidity > 75) {
    return { status: 'Alert', color: 'bg-red-400', textColor: 'text-red-400' }
  } else if (temp < 32 || temp > 38 || humidity < 50 || humidity > 70) {
    return { status: 'Warning', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
  } else {
    return { status: 'Healthy', color: 'bg-green-400', textColor: 'text-green-400' }
  }
}

const getLastUpdateTime = (hive) => {
  const times = [hive.temperature_time, hive.humidity_time, hive.weight_time]
    .filter(Boolean)
    .map(t => new Date(t))
  
  if (times.length === 0) return new Date()
  return Math.max(...times)
}

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

const navigateToHive = (hive) => {
  navigateTo(`/hives/${hive.uuid || hive.id}`)
}

const resetForm = () => {
  // Form reset is now handled by the AddHiveModal component
}

const closeModal = () => {
  showAddHiveModal.value = false
  addingHive.value = false
}

// Sensor detail functions
const showSensorDetails = (sensor, hive) => {
  selectedSensorDetails.value = { sensor, hive }
  showSensorModal.value = true
}

const closeSensorModal = () => {
  showSensorModal.value = false
  selectedSensorDetails.value = null
}

const getSensorTypeLabel = (type) => {
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

const formatSensorValue = (value, type, unit) => {
  if (value === null || value === undefined) return 'N/A'
  
  const numValue = parseFloat(value)
  
  switch (type) {
    case 'temperature':
      return `${numValue.toFixed(1)}°C`
    case 'humidity':
      return `${numValue.toFixed(1)}%`
    case 'weight':
      return `${(numValue / 1000).toFixed(1)}kg`
    default:
      return unit ? `${numValue.toFixed(1)}${unit}` : numValue.toFixed(1)
  }
}

const getBatteryColor = (level) => {
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const hasLowBatterySensors = (hive) => {
  return hive.sensors?.some(sensor => sensor.battery_level < 20) || false
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const handleAddHive = async (hiveData) => {
  if (addingHive.value || !user.value) return
  
  addingHive.value = true
  error.value = null
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch('/api/hives', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: hiveData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      // Ensure hiveData is an array before pushing
      if (!hiveData.value) {
        hiveData.value = []
      }
      // Add to local state
      hiveData.value.push(response.data)
      
      // Update subscription info if provided
      if (response.subscription_info) {
        currentUsage.value = {
          hives: response.subscription_info.hives_used,
          sensors: response.subscription_info.sensors_used
        }
      } else {
        // Fallback: just increment local count
        currentUsage.value.hives = (currentUsage.value.hives || 0) + 1
      }
      
      // Close modal
      closeModal()
    }
  } catch (err) {
    console.error('Failed to add hive:', err)
    error.value = err.message || 'Failed to add hive. Please try again.'
  } finally {
    addingHive.value = false
  }
}

const dismissAlert = async (alertId) => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.value.email || 'User'
      }
    })
    
    if (!response.error) {
      // Remove from local state
      alerts.value = alerts.value.filter(a => a.id !== alertId)
    }
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
    error.value = 'Failed to dismiss alert'
  }
}

// Data fetching functions
const fetchHiveData = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) {
      console.error('No auth token available')
      return
    }

    console.log('Fetching hives for user:', user.value.id)
    
    const response = await $fetch('/api/hives', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('Hives API response:', response)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      hiveData.value = response.data
      console.log(`Loaded ${response.data.length} hives for user`)
    }
  } catch (err) {
    console.error('Failed to fetch hive data:', err)
    error.value = 'Failed to load hive data'
  }
}

const fetchAlerts = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      alerts.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch alerts:', err)
    // Don't show error for alerts as it's not critical
  }
}

const fetchSensors = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/sensors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      sensors.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch sensors:', err)
    // Don't show error for sensors as it's not critical
  }
}

const loadAllData = async () => {
  if (!user.value || loading.value) { // Prevent concurrent loads
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Load subscription first
    await loadSubscription()
    
    await Promise.all([
      fetchHiveData(),
      fetchAlerts(),
      fetchSensors()
    ])
    
    // Update current usage after loading data
    currentUsage.value = {
      hives: hiveData.value?.length || 0,
      sensors: sensors.value?.length || 0
    }
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data. Please refresh the page.'
  } finally {
    loading.value = false
  }
}

// Watch for user changes - but prevent infinite loops
watch(user, async (newUser, oldUser) => {
  // Only fetch if user actually changed (not just reactive updates)
  if (newUser?.id !== oldUser?.id) {
    if (newUser) {
      await loadAllData()
    } else {
      // Clear data when user logs out
      hiveData.value = []
      alerts.value = []
      sensors.value = []
      loading.value = false
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Initial load if user is already authenticated
  if (user.value) {
    await loadAllData()
  }
  
  // Set up auto-refresh every 15 minutes for authenticated users
  updateInterval = setInterval(async () => {
    if (user.value && !loading.value) { // Prevent overlapping requests
      console.log('Auto-refreshing data...')
      await loadAllData()
    }
  }, 900000) // 15 minutes
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar for alerts */
.space-y-3::-webkit-scrollbar {
  width: 4px;
}

.space-y-3::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Hover effects */
.hover\:bg-gray-750:hover {
  background-color: rgb(55, 65, 81, 0.8);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus states for accessibility */
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

.focus\:ring-1:focus {
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Disabled states */
.disabled\:bg-gray-600:disabled {
  background-color: #4b5563;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

/* Grid layout responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Sensor cards overflow */
.max-h-32::-webkit-scrollbar {
  width: 4px;
}

.max-h-32::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-32::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-32::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Card hover animations */
.hive-card {
  transition: all 0.2s ease-in-out;
}

.hive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Status indicator animations */
.status-indicator {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Alert severity colors */
.alert-critical {
  background-color: rgba(153, 27, 27, 0.3);
  border-color: rgba(239, 68, 68, 0.3);
}

.alert-warning {
  background-color: rgba(146, 64, 14, 0.3);
  border-color: rgba(245, 158, 11, 0.3);
}

.alert-info {
  background-color: rgba(30, 58, 138, 0.3);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Button loading state */
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

/* Sensor type icons colors */
.text-red-400 {
  color: #f87171;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-yellow-400 {
  color: #facc15;
}

.text-green-400 {
  color: #4ade80;
}

.text-gray-400 {
  color: #9ca3af;
}

/* Battery level colors */
.text-green-400 {
  color: #4ade80;
}

.text-yellow-400 {
  color: #facc15;
}

.text-red-400 {
  color: #f87171;
}

/* Online/offline status dots */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-red-400 {
  background-color: #f87171;
}

/* Sensor card hover effect */
.hover\:bg-gray-750:hover {
  background-color: rgba(55, 65, 81, 0.9);
}

/* Modal backdrop */
.bg-black.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Scrollbar for modal content */
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

/* Additional responsive adjustments */
@media (max-width: 640px) {
  .p-6 {
    padding: 1rem;
  }
  
  .gap-6 {
    gap: 1rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
}
</style>