<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="0" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-400 mb-4">{{ error }}</div>
        <button @click="loadData" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Try Again
        </button>
      </div>

      <!-- Apiary Management Center -->
      <div v-else-if="apiary">
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <NuxtLink to="/apiaries" class="hover:text-white transition-colors">My Apiaries</NuxtLink>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
          <span class="text-white">{{ apiary.name }}</span>
        </nav>

        <!-- Header Section with Settings -->
        <div class="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-2">
                <h1 class="text-3xl font-bold text-white">{{ apiary.name }}</h1>
                
                <!-- Live Status Indicator -->
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-3 h-3 rounded-full',
                    getApiaryStatusColor(),
                    { 'animate-pulse': isLive }
                  ]"></div>
                  <span :class="getApiaryStatusTextColor()" class="text-sm font-medium">
                    {{ getApiaryStatusText() }}
                  </span>
                </div>
                
                <!-- Health Score Badge -->
                <div :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getHealthScoreBadgeClass()
                ]">
                  Health: {{ healthScore }}%
                </div>
              </div>
              
              <p class="text-gray-400 mb-4">{{ apiary.description || 'No description provided' }}</p>
              
              <!-- Quick Info Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div class="text-xs text-gray-400">Location</div>
                  <div class="text-sm text-white">
                    {{ apiary.address || `${parseFloat(apiary.latitude || 0).toFixed(4)}, ${parseFloat(apiary.longitude || 0).toFixed(4)}` }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-400">Established</div>
                  <div class="text-sm text-white">{{ formatDate(apiary.installation_date) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400">Last Activity</div>
                  <div class="text-sm text-white">{{ getLastActivity() }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400">Weather</div>
                  <div class="text-sm text-white">22°C, Sunny</div>
                </div>
              </div>
            </div>
            
            <!-- Settings & Action Buttons -->
            <div class="flex gap-2 ml-6">
              <button 
                @click="showSettingsDropdown = !showSettingsDropdown"
                class="relative px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
                Settings
                
                <!-- Settings Dropdown -->
                <div v-if="showSettingsDropdown" class="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <div class="py-1">
                    <button 
                      @click="showEditApiaryModal = true; showSettingsDropdown = false"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      Edit Apiary
                    </button>
                    <button 
                      @click="showAlertSettingsModal = true; showSettingsDropdown = false"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"/>
                      </svg>
                      Alert Settings
                    </button>
                    <div class="border-t border-gray-700 my-1"></div>
                    <button 
                      @click="showDeleteConfirmModal = true; showSettingsDropdown = false"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                      </svg>
                      Delete Apiary
                    </button>
                  </div>
                </div>
              </button>
              
              <button 
                @click="refreshData"
                :disabled="refreshing"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" :class="{ 'animate-spin': refreshing }" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Main Management Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-700">
            <nav class="flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                ]"
              >
                <component :is="tab.icon" class="w-4 h-4" />
                {{ tab.name }}
                <span v-if="tab.badge" :class="[
                  'px-2 py-1 text-xs rounded-full',
                  tab.badgeClass || 'bg-gray-700 text-gray-300'
                ]">
                  {{ tab.badge }}
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
          <!-- Hives Overview Tab -->
          <div v-if="activeTab === 'hives'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Hive Management</h2>
              <div class="flex gap-2">
                <button 
                  @click="showAddHiveModal = true"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                  </svg>
                  Add Hive
                </button>
              </div>
            </div>

            <!-- Hives Grid -->
            <div v-if="apiaryHives.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <HiveCard
                v-for="hive in apiaryHives"
                :key="hive.id"
                :hive="hive"
                @click="navigateToHiveDetails"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" viewBox="0 0 55 56" fill="currentColor">
                <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51Z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-300 mb-2">No Hives Yet</h3>
              <p class="text-gray-400 mb-4">Start by adding your first hive to this apiary.</p>
              <button 
                @click="showAddHiveModal = true"
                class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Add Your First Hive
              </button>
            </div>
          </div>

          <!-- Connectivity Hub Tab -->
          <div v-if="activeTab === 'connectivity'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Hub & Sensor Units</h2>
              <div class="flex gap-2">
                <button 
                  v-if="!apiary.hub"
                  @click="showAddHubModal = true"
                  class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 694 825">
                    <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
                  </svg>
                  Add Hub
                </button>
              </div>
            </div>

            <!-- Hub Status -->
            <div v-if="apiary.hub" class="mb-6">
              <ApiaryHubCard
                :hub="apiary.hub"
                @click="navigateToHubDetails"
              />
            </div>

            <!-- Network Summary -->
            <div class="bg-gray-800 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4">Network Summary</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                  <div class="text-2xl font-bold" :class="apiary.hub ? (hasOnlineHub ? 'text-green-400' : 'text-red-400') : 'text-gray-400'">
                    {{ apiary.hub ? (hasOnlineHub ? 'ONLINE' : 'OFFLINE') : 'NO HUB' }}
                  </div>
                  <div class="text-sm text-gray-400">Hub Status</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-400">{{ apiaryHives.length }}</div>
                  <div class="text-sm text-gray-400">Connected Hives</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-400">{{ totalSensors }}</div>
                  <div class="text-sm text-gray-400">Total Sensors</div>
                </div>
              </div>
            </div>

            <!-- No Hub State -->
            <div v-if="!apiary.hub" class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" viewBox="0 0 694 825" fill="currentColor">
                <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z" opacity="0.5"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-300 mb-2">No Hub Assigned</h3>
              <p class="text-gray-400 mb-4">This apiary needs a hub to enable sensor data collection and monitoring.</p>
              <button 
                @click="showAddHubModal = true"
                class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors"
              >
                Add Hub
              </button>
            </div>
          </div>

          <!-- Live Data Tab -->
          <div v-if="activeTab === 'data'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Live Data Stream</h2>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span class="text-sm text-green-400">Live Data</span>
                </div>
                <select v-model="dataTimeRange" class="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </div>

            <!-- Real-time Data Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Temperature Overview -->
              <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Temperature Overview</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-orange-400">24.5°C</div>
                    <div class="text-sm text-gray-400">Average</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-400">28.1°C</div>
                    <div class="text-sm text-gray-400">Peak</div>
                  </div>
                </div>
                <!-- Mini chart placeholder -->
                <div class="mt-4 h-32 bg-gray-700 rounded flex items-center justify-center">
                  <span class="text-gray-400 text-sm">Temperature Chart</span>
                </div>
              </div>

              <!-- Weight Changes -->
              <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Weight Monitoring</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-400">45.2kg</div>
                    <div class="text-sm text-gray-400">Average</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-400">+1.2kg</div>
                    <div class="text-sm text-gray-400">24h Change</div>
                  </div>
                </div>
                <!-- Mini chart placeholder -->
                <div class="mt-4 h-32 bg-gray-700 rounded flex items-center justify-center">
                  <span class="text-gray-400 text-sm">Weight Chart</span>
                </div>
              </div>

              <!-- Activity Summary -->
              <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Bee Activity</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Flight Activity</span>
                    <span class="text-green-400 font-medium">High</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Sound Level</span>
                    <span class="text-yellow-400 font-medium">Normal</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Last Reading</span>
                    <span class="text-white font-medium">2 min ago</span>
                  </div>
                </div>
              </div>

              <!-- Environmental Conditions -->
              <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Environment</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Humidity</span>
                    <span class="text-blue-400 font-medium">65%</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Weather</span>
                    <span class="text-yellow-400 font-medium">Sunny, 22°C</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">Wind</span>
                    <span class="text-gray-300 font-medium">Light, 5 km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alerts Tab -->
          <div v-if="activeTab === 'alerts'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Alerts & Issues</h2>
            </div>

            <!-- Empty Alerts State -->
            <div class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-300 mb-2">No Active Alerts</h3>
              <p class="text-gray-400 mb-4">Your apiary is running smoothly! Alerts will appear here when attention is needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddHiveModal
      :show="showAddHiveModal"
      :creating="false"
      :subscription="subscription"
      :current-usage="currentUsage"
      :can-add="canAddHive"
      :upgrade-message="upgradeMessage"
      @close="showAddHiveModal = false"
      @create="handleHiveAdded"
    />

    <AddHubModal
      :show="showAddHubModal"
      :apiaries="[apiary]"
      :selected-apiary-id="apiary?.id"
      @close="showAddHubModal = false"
      @success="handleHubAdded"
    />

    <EditApiaryModal
      :show="showEditApiaryModal"
      :apiary="apiary"
      @close="showEditApiaryModal = false"
      @success="handleApiaryUpdated"
    />

    <!-- Alert Settings Modal -->
    <div v-if="showAlertSettingsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 class="text-xl font-semibold">Alert Settings</h3>
          <button @click="showAlertSettingsModal = false" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Temperature Alerts -->
          <div>
            <h4 class="font-medium mb-3">Temperature Alerts</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-4">
                <label class="text-sm text-gray-400 w-24">High:</label>
                <input type="number" value="35" class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span class="text-sm text-gray-400">°C</span>
              </div>
              <div class="flex items-center gap-4">
                <label class="text-sm text-gray-400 w-24">Low:</label>
                <input type="number" value="5" class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span class="text-sm text-gray-400">°C</span>
              </div>
            </div>
          </div>

          <!-- Weight Alerts -->
          <div>
            <h4 class="font-medium mb-3">Weight Alerts</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-4">
                <label class="text-sm text-gray-400 w-24">Daily Loss:</label>
                <input type="number" value="2" class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span class="text-sm text-gray-400">kg</span>
              </div>
              <div class="flex items-center gap-4">
                <label class="text-sm text-gray-400 w-24">Weekly Loss:</label>
                <input type="number" value="5" class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span class="text-sm text-gray-400">kg</span>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div>
            <h4 class="font-medium mb-3">Notifications</h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">Email Alerts</div>
                  <div class="text-sm text-gray-400">Receive critical alerts via email</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">SMS Alerts</div>
                  <div class="text-sm text-gray-400">Emergency notifications via SMS</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end p-6 border-t border-gray-700">
          <div class="flex gap-3">
            <button 
              @click="showAlertSettingsModal = false"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="saveAlertSettings"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Delete Apiary</h3>
              <p class="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          
          <p class="text-gray-300 mb-4">
            Are you sure you want to delete "{{ apiary.name }}"? 
            {{ apiaryHives.length > 0 ? `This will unassign ${apiaryHives.length} hive${apiaryHives.length > 1 ? 's' : ''} from this apiary.` : '' }}
          </p>
          
          <div class="flex gap-3">
            <button 
              @click="showDeleteConfirmModal = false"
              class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="handleDeleteApiary"
              :disabled="deletingApiary"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ deletingApiary ? 'Deleting...' : 'Delete Apiary' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import HiveCard from '~/components/hive/HiveCard.vue'
import AddHiveModal from '~/components/hive/AddHiveModal.vue'
import ApiaryHubCard from '~/components/apiary/ApiaryHubCard.vue'
import AddHubModal from '~/components/hub/AddHubModal.vue'
import EditApiaryModal from '~/components/apiary/EditApiaryModal.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Page Metadata
definePageMeta({
  title: 'Apiary Management - BeeVibe Dashboard',
  middleware: ['auth']
})

// State
const loading = ref(true)
const error = ref(null)
const refreshing = ref(false)
const deletingApiary = ref(false)
const apiary = ref(null)

// UI State
const activeTab = ref('hives')
const dataTimeRange = ref('24h')
const showSettingsDropdown = ref(false)

// Modal State
const showAddHiveModal = ref(false)
const showAddHubModal = ref(false)
const showEditApiaryModal = ref(false)
const showAlertSettingsModal = ref(false)
const showDeleteConfirmModal = ref(false)

// Data from composables
const { 
  hivesWithSensorData, 
  sensorsWithLatestReadings,
  loading: hiveDataLoading,
  refreshData: refreshHiveData,
  clearError
} = useHiveData()

const { subscription, loadSubscription } = useSubscription()

// Computed property to get hives for this specific apiary
const apiaryHives = computed(() => {
  if (!apiary.value?.id) return []
  return hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.value.id)
})

// Computed for hive management
const currentUsage = computed(() => ({
  hives: apiaryHives.value?.length || 0,
  sensors: totalSensors.value
}))

const canAddHive = computed(() => {
  if (!subscription.value) return false
  const maxHives = subscription.value.limits?.max_hives
  return maxHives === -1 || (currentUsage.value.hives < maxHives)
})

const upgradeMessage = computed(() => {
  if (!subscription.value) return ''
  return `You've reached the hive limit for your ${subscription.value.planDisplayName} plan.`
})

// Tab Configuration
const tabs = computed(() => [
  {
    id: 'hives',
    name: 'Hives',
    icon: 'svg',
    badge: apiaryHives.value.length,
    badgeClass: apiaryHives.value.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
  },
  {
    id: 'connectivity',
    name: 'Hub & Units',
    icon: 'svg',
    badge: apiary.value?.hub ? (hasOnlineHub.value ? 'ONLINE' : 'OFFLINE') : 'NO HUB',
    badgeClass: apiary.value?.hub ? (hasOnlineHub.value ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-600 text-white'
  },
  {
    id: 'data',
    name: 'Live Data',
    icon: 'svg',
    badge: isLive.value ? 'LIVE' : null,
    badgeClass: 'bg-green-600 text-white animate-pulse'
  },
  {
    id: 'alerts',
    name: 'Alerts',
    icon: 'svg'
  }
])

// Computed Properties
const healthScore = computed(() => {
  return calculateHealthScore()
})

const hasOnlineHub = computed(() => {
  return apiary.value?.hub && isHubOnline(apiary.value.hub)
})

const isLive = computed(() => {
  return hasOnlineHub.value
})

const totalSensors = computed(() => {
  return apiaryHives.value.reduce((total, hive) => total + (hive.sensors?.length || 0), 0)
})

// Helper Functions
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000
}

const calculateHealthScore = () => {
  let score = 100
  
  if (!apiary.value?.is_active) score -= 50
  if (!hasOnlineHub.value) score -= 20
  
  return Math.max(0, score)
}

const getApiaryStatusColor = () => {
  if (!apiary.value?.is_active) return 'bg-gray-400'
  if (hasOnlineHub.value) return 'bg-green-400'
  return 'bg-yellow-400'
}

const getApiaryStatusTextColor = () => {
  if (!apiary.value?.is_active) return 'text-gray-400'
  if (hasOnlineHub.value) return 'text-green-400'
  return 'text-yellow-400'
}

const getApiaryStatusText = () => {
  if (!apiary.value?.is_active) return 'Inactive'
  if (hasOnlineHub.value) return 'Active & Connected'
  return 'Setup Required'
}

const getHealthScoreBadgeClass = () => {
  const score = healthScore.value
  if (score >= 90) return 'bg-green-900/30 text-green-400 border border-green-500/30'
  if (score >= 70) return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
  return 'bg-red-900/30 text-red-400 border border-red-500/30'
}

const getLastActivity = () => {
  if (isLive.value) return 'Just now'
  if (apiary.value?.updated_at) {
    const diff = Date.now() - new Date(apiary.value.updated_at).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }
  return 'No recent activity'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString()
}

// Navigation Functions
const navigateToHiveDetails = (hive) => {
  const identifier = hive.uuid || hive.id
  navigateTo(`/hives/${identifier}`)
}

const navigateToHubDetails = (hub) => {
  const identifier = hub.uuid || hub.id
  navigateTo(`/hubs/${identifier}`)
}

// Event Handlers
const handleHiveAdded = () => {
  loadData()
  showAddHiveModal.value = false
}

const handleHubAdded = () => {
  loadData()
  showAddHubModal.value = false
}

const handleApiaryUpdated = () => {
  loadData()
  showEditApiaryModal.value = false
}

const handleDeleteApiary = async () => {
  deletingApiary.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    const response = await $fetch(`/api/apiaries/${apiary.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.success) {
      // Navigate back to apiaries list
      await navigateTo('/apiaries')
    } else {
      throw new Error(response.error || 'Failed to delete apiary')
    }
  } catch (err) {
    console.error('Error deleting apiary:', err)
    alert('Failed to delete apiary. Please try again.')
  } finally {
    deletingApiary.value = false
    showDeleteConfirmModal.value = false
  }
}

const saveAlertSettings = () => {
  // TODO: Implement alert settings save
  console.log('Saving alert settings...')
  showAlertSettingsModal.value = false
}

const refreshData = async () => {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

// Data Loading function
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const apiaryId = route.params.id
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    // Load apiary details
    const apiaryResponse = await $fetch(`/api/apiaries/${apiaryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!apiaryResponse.data) throw new Error('Apiary not found')
    
    apiary.value = apiaryResponse.data
    
    // Load hive data with sensors using the composable
    await refreshHiveData()

    // Load hub data
    const hubsResponse = await $fetch('/api/hubs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (hubsResponse.success) {
      // Find the hub for this apiary
      const apiaryHub = hubsResponse.data.find(hub => hub.apiary_id === apiary.value.id)
      apiary.value.hub = apiaryHub || null
    }

  } catch (err) {
    console.error('Error loading apiary data:', err)
    error.value = err.message || 'Failed to load apiary data'
  } finally {
    loading.value = false
  }
}

// Click outside handler for settings dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showSettingsDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
  loadSubscription()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>