<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-3 sm:p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation :alert-count="activeAlerts.length" />

      <!-- Authentication Required State -->
      <div v-if="!user" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
        </svg>
        <h3 class="text-lg font-semibold mb-2 text-gray-300">Authentication Required</h3>
        <p class="text-gray-400 mb-4">Please log in to view your alerts</p>
        <button 
          @click="navigateTo('/auth/login')"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Go to Login
        </button>
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

      <!-- Main Content (only show when authenticated) -->
      <div v-if="user">
        <!-- Header -->
        <div class="mb-4 sm:mb-6">
          <h1 class="text-xl sm:text-2xl font-bold mb-2">Alerts & Notifications</h1>
          <p class="text-gray-400 text-sm sm:text-base">Monitor and manage alerts from your beehive sensors</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg sm:text-2xl font-bold">{{ criticalAlerts.length }}</p>
                <p class="text-xs sm:text-sm text-gray-400">Critical</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg sm:text-2xl font-bold">{{ warningAlerts.length }}</p>
                <p class="text-xs sm:text-sm text-gray-400">Warning</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg sm:text-2xl font-bold">{{ infoAlerts.length }}</p>
                <p class="text-xs sm:text-sm text-gray-400">Info</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg sm:text-2xl font-bold">{{ resolvedAlertsCount }}</p>
                <p class="text-xs sm:text-sm text-gray-400">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
          <!-- Mobile: Collapsible Filters -->
          <div class="sm:hidden">
            <button 
              @click="showMobileFilters = !showMobileFilters"
              class="w-full flex items-center justify-between text-sm font-medium text-gray-300 mb-3"
            >
              <span>Filters & Search</span>
              <svg 
                class="w-4 h-4 transform transition-transform" 
                :class="{ 'rotate-180': showMobileFilters }"
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>
            
            <div v-show="showMobileFilters" class="space-y-3">
              <!-- Status Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select 
                  v-model="selectedStatus" 
                  @change="fetchAlerts"
                  class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active Alerts</option>
                  <option value="resolved">Alert History</option>
                  <option value="all">All Alerts</option>
                </select>
              </div>

              <!-- Hive Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Hive</label>
                <select 
                  v-model="selectedHive" 
                  @change="fetchAlerts"
                  class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Hives</option>
                  <option v-for="hive in hives" :key="hive.id" :value="hive.id">
                    {{ hive.name || `Hive ${hive.id}` }}
                  </option>
                </select>
              </div>

              <!-- Severity Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Severity</label>
                <select 
                  v-model="selectedSeverity" 
                  @change="applyFilters"
                  class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <!-- Refresh Button -->
              <button 
                @click="fetchAlerts" 
                :disabled="loading"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                </svg>
                <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
              </button>
            </div>
          </div>

          <!-- Desktop: Horizontal Filters -->
          <div class="hidden sm:flex flex-wrap items-center gap-4">
            <!-- Status Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-300">Status:</label>
              <select 
                v-model="selectedStatus" 
                @change="fetchAlerts"
                class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active Alerts</option>
                <option value="resolved">Alert History</option>
                <option value="all">All Alerts</option>
              </select>
            </div>

            <!-- Hive Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-300">Hive:</label>
              <select 
                v-model="selectedHive" 
                @change="fetchAlerts"
                class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Hives</option>
                <option v-for="hive in hives" :key="hive.id" :value="hive.id">
                  {{ hive.name || `Hive ${hive.id}` }}
                </option>
              </select>
            </div>

            <!-- Severity Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-300">Severity:</label>
              <select 
                v-model="selectedSeverity" 
                @change="applyFilters"
                class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <!-- Refresh Button -->
            <button 
              @click="fetchAlerts" 
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
              </svg>
              <span v-else>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && alerts.length === 0" class="bg-gray-900 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-400 text-sm sm:text-base">Loading alerts...</p>
        </div>

        <!-- No Alerts State -->
        <div v-else-if="filteredAlerts.length === 0" class="bg-gray-900 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <h3 class="text-lg sm:text-xl font-semibold mb-2">
            {{ selectedStatus === 'active' ? 'No Active Alerts' : selectedStatus === 'resolved' ? 'No Alert History' : 'No Alerts Found' }}
          </h3>
          <p class="text-gray-400 text-sm sm:text-base">
            {{ selectedStatus === 'active' ? 'All systems are running normally' : 'No alerts match your current filters' }}
          </p>
        </div>

        <!-- Alerts List -->
        <div v-else class="space-y-3 sm:space-y-4">
          <div 
            v-for="alert in filteredAlerts" 
            :key="alert.id"
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
                  @click="openResolveModal(alert)"
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
                  @click="openResolveModal(alert)"
                  class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors cursor-pointer"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resolve Alert Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
          <h3 class="text-lg sm:text-xl font-semibold">Resolve Alert</h3>
          <button @click="closeResolveModal" class="text-gray-400 hover:text-white cursor-pointer">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        
        <div class="p-4 sm:p-6">
          <p class="text-gray-300 mb-4 text-sm sm:text-base">
            Are you sure you want to resolve this alert?
          </p>
          <p class="text-sm text-gray-400 mb-4">
            <strong>{{ selectedAlert?.title }}</strong>
          </p>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Resolution Notes (Optional)</label>
            <textarea 
              v-model="resolveForm.notes"
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about how this alert was resolved..."
            ></textarea>
          </div>
          
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              @click="resolveAlert" 
              :disabled="resolvingAlert"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
            >
              <span v-if="resolvingAlert">Resolving...</span>
              <span v-else>Resolve Alert</span>
            </button>
            <button 
              @click="closeResolveModal"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast (Simple Implementation) -->
    <div v-if="toastMessage" class="fixed top-4 right-4 z-50 transition-all duration-300">
      <div :class="[
        'rounded-lg p-4 shadow-lg max-w-sm',
        toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">
        <div class="flex items-center space-x-3">
          <svg v-if="toastType === 'success'" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <p class="text-white font-medium text-sm">{{ toastMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Meta
definePageMeta({
  title: 'Alerts & Notifications - BeeVibe Dashboard'
})

// Get user from Supabase auth
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const loading = ref(false)
const alerts = ref([])
const hives = ref([])
const selectedStatus = ref('active')
const selectedHive = ref('')
const selectedSeverity = ref('')
const showMobileFilters = ref(false)
const error = ref(null)

// Modal state
const showResolveModal = ref(false)
const selectedAlert = ref(null)
const resolvingAlert = ref(false)
const resolveForm = ref({
  notes: ''
})

// Toast state
const toastMessage = ref('')
const toastType = ref('info')

// Computed properties
const activeAlerts = computed(() => alerts.value.filter(alert => !alert.resolved))
const resolvedAlerts = computed(() => alerts.value.filter(alert => alert.resolved))

const criticalAlerts = computed(() => activeAlerts.value.filter(alert => alert.severity === 'critical'))
const warningAlerts = computed(() => activeAlerts.value.filter(alert => alert.severity === 'warning'))
const infoAlerts = computed(() => activeAlerts.value.filter(alert => alert.severity === 'info'))

const resolvedAlertsCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return resolvedAlerts.value.filter(alert => 
    alert.resolved_at && new Date(alert.resolved_at) >= today
  ).length
})

const filteredAlerts = computed(() => {
  let filtered = alerts.value

  // Filter by severity
  if (selectedSeverity.value) {
    filtered = filtered.filter(alert => alert.severity === selectedSeverity.value)
  }

  return filtered
})

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Functions
const fetchAlerts = async () => {
  if (!user.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const queryParams = {
      status: selectedStatus.value,
      limit: 200
    }
    
    if (selectedHive.value) {
      queryParams.hive_id = selectedHive.value
    }

    if (selectedSeverity.value) {
      queryParams.severity = selectedSeverity.value
    }
    
    const response = await $fetch('/api/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: queryParams
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      alerts.value = response.data
    }
  } catch (err) {
    console.error('Error fetching alerts:', err)
    error.value = err.message || 'Failed to load alerts'
    alerts.value = []
  } finally {
    loading.value = false
  }
}

const fetchHives = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/hives', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      hives.value = response.data.filter(hive => hive.is_active)
    }
  } catch (err) {
    console.error('Error fetching hives:', err)
    // Don't show error for hives as it's not critical for alerts page
  }
}

const applyFilters = () => {
  // Filters are applied through computed property
  // We can also trigger a fresh fetch if needed
  fetchAlerts()
}

const openResolveModal = (alert) => {
  selectedAlert.value = alert
  resolveForm.value.notes = ''
  showResolveModal.value = true
}

const closeResolveModal = () => {
  showResolveModal.value = false
  selectedAlert.value = null
  resolveForm.value.notes = ''
}

const resolveAlert = async () => {
  if (!selectedAlert.value || !user.value) return
  
  resolvingAlert.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    console.log('Resolving alert:', selectedAlert.value.id)
    
    const response = await $fetch(`/api/alerts/${selectedAlert.value.id}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        resolved_notes: resolveForm.value.notes?.trim() || null
      }
    })
    
    console.log('Resolve response:', response)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.success && response.data) {
      // Update local state with the resolved alert data
      const alertIndex = alerts.value.findIndex(a => a.id === selectedAlert.value.id)
      if (alertIndex !== -1) {
        alerts.value[alertIndex] = { ...alerts.value[alertIndex], ...response.data }
      }
      
      closeResolveModal()
      
      // Show success message
      showToast('Alert resolved successfully!', 'success')
      
      // Refresh alerts if we're viewing active alerts only
      if (selectedStatus.value === 'active') {
        await fetchAlerts()
      }
    } else {
      throw new Error('Failed to resolve alert')
    }
  } catch (err) {
    console.error('Error resolving alert:', err)
    
    let errorMessage = 'Failed to resolve alert. Please try again.'
    
    // Handle specific error messages from the API
    if (err.data?.statusMessage) {
      errorMessage = err.data.statusMessage
    } else if (err.statusMessage) {
      errorMessage = err.statusMessage
    } else if (err.message) {
      errorMessage = err.message
    }
    
    showToast(errorMessage, 'error')
  } finally {
    resolvingAlert.value = false
  }
}

// Helper function to show toast messages
const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  
  // Auto-hide toast after 4 seconds
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

// Utility functions
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

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await Promise.all([
      fetchHives(),
      fetchAlerts()
    ])
  } else {
    // Clear data when user logs out
    alerts.value = []
    hives.value = []
    loading.value = false
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Initial load if user is already authenticated
  if (user.value) {
    await Promise.all([
      fetchHives(),
      fetchAlerts()
    ])
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
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
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus states for accessibility */
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px #3b82f6;
}
</style>