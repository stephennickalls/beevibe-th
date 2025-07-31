<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">Account Management</h1>
        <p class="text-gray-400">Manage your profile, subscription, and account settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
        <p class="text-red-300">{{ error }}</p>
        <div class="mt-4 space-x-2">
          <button @click="fetchUserData" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>

      <!-- Account Management Sections -->
      <div v-else class="space-y-6">
        
        <!-- Profile Information -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">Profile Information</h2>
            <button 
              @click="showEditProfile = !showEditProfile"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ showEditProfile ? 'Cancel' : 'Edit Profile' }}
            </button>
          </div>

          <!-- Profile Display -->
          <div v-if="!showEditProfile" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-4">Personal Information</h3>
              <div class="space-y-3">
                <div>
                  <label class="text-sm text-gray-400">Full Name</label>
                  <p class="text-white">{{ userProfile.first_name || 'No name' }} {{ userProfile.last_name || '' }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-400">Username</label>
                  <p class="text-white">{{ userProfile.username || 'No username set' }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-400">Email</label>
                  <p class="text-white">{{ userAuth.email || 'No email' }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Contact Information</h3>
              <div class="space-y-3">
                <div>
                  <label class="text-sm text-gray-400">Phone</label>
                  <p class="text-white">{{ userProfile.phone || 'Not provided' }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-400">Company</label>
                  <p class="text-white">{{ userProfile.company_name || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Edit Form -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input 
                  v-model="editProfileForm.first_name" 
                  type="text" 
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input 
                  v-model="editProfileForm.last_name" 
                  type="text" 
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input 
                v-model="editProfileForm.username" 
                type="text" 
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input 
                v-model="editProfileForm.phone" 
                type="tel" 
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Company</label>
              <input 
                v-model="editProfileForm.company_name" 
                type="text" 
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              >
            </div>

            <div class="flex space-x-4">
              <button 
                @click="updateProfile"
                :disabled="updatingProfile"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {{ updatingProfile ? 'Updating...' : 'Update Profile' }}
              </button>
              <button 
                @click="showEditProfile = false"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Subscription Plan Details -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">Subscription Plan</h2>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :class="subscriptionStatusColor"></div>
              <span class="text-sm text-gray-400">{{ subscription?.hasActiveSubscription ? 'Active' : 'Free Plan' }}</span>
            </div>
          </div>

          <div v-if="subscriptionLoading" class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <div v-else class="space-y-6">
            <!-- Current Plan Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-lg">{{ subscription?.planDisplayName || 'Free' }}</h3>
                  <span class="text-sm font-medium px-2 py-1 rounded" :class="planBadgeClasses">
                    {{ subscription?.hasActiveSubscription ? 'PAID' : 'FREE' }}
                  </span>
                </div>
                <p class="text-2xl font-bold text-blue-400">{{ getPlanPrice() }}</p>
                <p class="text-sm text-gray-400">{{ subscription?.hasActiveSubscription ? 'per month' : 'forever' }}</p>
              </div>

              <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-400 mb-2">Hive Limit</h4>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold" :class="hiveUsageColor">
                    {{ currentUsage.hives }}/{{ formatLimit(subscription?.limits?.max_hives) }}
                  </span>
                  <div class="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300" 
                      :class="hiveUsageBarColor"
                      :style="{ width: hiveUsagePercentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-800 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-400 mb-2">Sensor Limit</h4>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold" :class="sensorUsageColor">
                    {{ currentUsage.sensors }}/{{ formatLimit(subscription?.limits?.max_sensors_total) }}
                  </span>
                  <div class="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300" 
                      :class="sensorUsageBarColor"
                      :style="{ width: sensorUsagePercentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Features -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h4 class="font-medium mb-3">Plan Features</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">{{ formatLimit(subscription?.limits?.max_hives) }} Hives</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">{{ formatLimit(subscription?.limits?.max_sensors_total) }} Total Sensors</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">{{ formatLimit(subscription?.limits?.max_sensors_per_hive) }} Sensors per Hive</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">Real-time Monitoring</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">Data Export</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  <span class="text-sm">Email Alerts</span>
                </div>
              </div>
            </div>

            <!-- Upgrade Section -->
            <div v-if="!subscription?.hasActiveSubscription || showUpgradeOptions" class="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border border-blue-700">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold mb-1">{{ subscription?.hasActiveSubscription ? 'Upgrade Your Plan' : 'Upgrade to Premium' }}</h4>
                  <p class="text-sm text-gray-300">
                    {{ upgradeMessage || 'Get more hives, sensors, and advanced features with a premium plan.' }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="navigateToPlans"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Plans
                  </button>
                  <button 
                    v-if="subscription?.hasActiveSubscription"
                    @click="showUpgradeOptions = !showUpgradeOptions"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {{ showUpgradeOptions ? 'Hide' : 'Compare' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Subscription Details (for paid plans) -->
            <div v-if="subscription?.hasActiveSubscription && subscription?.subscription" class="bg-gray-800 rounded-lg p-4">
              <h4 class="font-medium mb-3">Subscription Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label class="text-gray-400">Status</label>
                  <p class="text-white capitalize">{{ subscription.subscription.status }}</p>
                </div>
                <div>
                  <label class="text-gray-400">Billing Cycle</label>
                  <p class="text-white">{{ subscription.subscription.billing_cycle || 'Monthly' }}</p>
                </div>
                <div>
                  <label class="text-gray-400">Started</label>
                  <p class="text-white">{{ formatDate(subscription.subscription.created_at) }}</p>
                </div>
                <div>
                  <label class="text-gray-400">Next Billing</label>
                  <p class="text-white">{{ formatDate(subscription.subscription.next_billing_date) || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Security -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-6">Account Security</h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm text-gray-400">Email Address</label>
                <p class="text-white">{{ userAuth.email }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-400">Last Sign In</label>
                <p class="text-white">{{ formatDate(userAuth.last_sign_in_at) }}</p>
              </div>
            </div>

            <div class="flex space-x-4 pt-4">
              <button 
                @click="showChangePassword = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
              <button 
                @click="signOut"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-6">Account Statistics</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-blue-400">{{ accountStats.total_hives }}</p>
              <p class="text-sm text-gray-400">Total Hives</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-green-400">{{ accountStats.total_sensors }}</p>
              <p class="text-sm text-gray-400">Total Sensors</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-yellow-400">{{ accountStats.total_alerts }}</p>
              <p class="text-sm text-gray-400">Total Alerts</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-purple-400">{{ formatDate(userAuth.created_at) }}</p>
              <p class="text-sm text-gray-400">Member Since</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Change Password</h3>
        <form @submit.prevent="changePassword">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input 
                v-model="passwordForm.new_password" 
                type="password" 
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <input 
                v-model="passwordForm.confirm_password" 
                type="password" 
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
          </div>
          <div class="flex justify-end space-x-4 mt-6">
            <button 
              type="button" 
              @click="showChangePassword = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="changingPassword"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ changingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Meta with middleware
definePageMeta({
  title: 'Account Management - BeeVibe Dashboard',
  middleware: ['auth']
})

// Use Supabase composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Use subscription composable
const { subscription, loadSubscription, getPlanLimits, getUpgradeMessage } = useSubscription()

// Use hive data for current usage statistics
const { hivesWithSensorData, sensorsWithLatestReadings } = useHiveData()

// Reactive data
const loading = ref(true)
const error = ref(null)
const subscriptionLoading = ref(true)
const activeAlerts = ref([])
const userAuth = ref({})
const userProfile = ref({})
const accountStats = ref({
  total_hives: 0,
  total_sensors: 0,
  total_alerts: 0
})

// Modal states
const showEditProfile = ref(false)
const showChangePassword = ref(false)
const showUpgradeOptions = ref(false)

// Loading states
const updatingProfile = ref(false)
const changingPassword = ref(false)

// Form data
const editProfileForm = ref({
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  company_name: ''
})

const passwordForm = ref({
  new_password: '',
  confirm_password: ''
})

// Computed properties for current usage
const currentUsage = computed(() => ({
  hives: hivesWithSensorData.value?.length || 0,
  sensors: sensorsWithLatestReadings.value?.length || 0
}))

// Subscription-related computed properties
const subscriptionStatusColor = computed(() => {
  if (!subscription.value) return 'bg-gray-500'
  return subscription.value.hasActiveSubscription ? 'bg-green-500' : 'bg-yellow-500'
})

const planBadgeClasses = computed(() => {
  if (!subscription.value) return 'bg-gray-600 text-gray-300'
  return subscription.value.hasActiveSubscription 
    ? 'bg-green-600 text-green-100' 
    : 'bg-yellow-600 text-yellow-100'
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

const hiveUsagePercentage = computed(() => {
  if (!subscription.value) return 0
  const limit = subscription.value.limits?.max_hives
  if (limit === -1) return 0
  return Math.min(100, (currentUsage.value.hives / limit) * 100)
})

const sensorUsagePercentage = computed(() => {
  if (!subscription.value) return 0
  const limit = subscription.value.limits?.max_sensors_total
  if (limit === -1) return 0
  return Math.min(100, (currentUsage.value.sensors / limit) * 100)
})

const hiveUsageBarColor = computed(() => {
  const percentage = hiveUsagePercentage.value
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

const sensorUsageBarColor = computed(() => {
  const percentage = sensorUsagePercentage.value
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

const upgradeMessage = computed(() => {
  if (!subscription.value) return ''
  return getUpgradeMessage(currentUsage.value)
})

// Methods
const formatLimit = (limit) => {
  return limit === -1 ? '∞' : limit?.toString() || '0'
}

const getPlanPrice = () => {
  if (!subscription.value) return '$0'
  
  const planLimits = getPlanLimits()
  const currentPlan = subscription.value.plan || 'free'
  
  return planLimits[currentPlan]?.price || '$0'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const fetchUserData = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('=== Fetching user data ===')
    
    if (!user.value) {
      throw new Error('No user found. Please log in.')
    }
    
    console.log('✅ User found:', user.value.email)
    
    // Set user auth data
    userAuth.value = {
      id: user.value.id,
      email: user.value.email,
      created_at: user.value.created_at,
      last_sign_in_at: user.value.last_sign_in_at
    }
    
    // Fetch user profile
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError)
        userProfile.value = {
          id: user.value.id,
          username: '',
          first_name: '',
          last_name: '',
          phone: '',
          company_name: ''
        }
      } else if (profile) {
        userProfile.value = profile
        console.log('✅ Profile loaded')
      } else {
        // Create empty profile
        userProfile.value = {
          id: user.value.id,
          username: '',
          first_name: '',
          last_name: '',
          phone: '',
          company_name: ''
        }
        console.log('ℹ️ Using empty profile')
      }
    } catch (profileError) {
      console.warn('Profile error:', profileError)
      userProfile.value = {
        id: user.value.id,
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        company_name: ''
      }
    }
    
    // Populate edit form
    editProfileForm.value = {
      username: userProfile.value.username || '',
      first_name: userProfile.value.first_name || '',
      last_name: userProfile.value.last_name || '',
      phone: userProfile.value.phone || '',
      company_name: userProfile.value.company_name || ''
    }
    
    // Try to fetch statistics
    try {
      // Get hives count
      const { count: hivesCount } = await supabase
        .from('hives')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id)
        .eq('is_active', true)
      
      accountStats.value.total_hives = hivesCount || 0
      
      // Try to get sensors count (may not exist)
      try {
        const { count: sensorsCount } = await supabase
          .from('sensors')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.value.id)
        
        accountStats.value.total_sensors = sensorsCount || 0
      } catch (e) {
        console.log('No sensors table or no access')
      }
      
      // Try to get alerts count (may not exist)
      try {
        const { count: alertsCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.value.id)
        
        accountStats.value.total_alerts = alertsCount || 0
      } catch (e) {
        console.log('No alerts table or no access')
      }
      
      console.log('✅ Statistics loaded')
    } catch (statsError) {
      console.warn('Stats error:', statsError)
    }
    
    console.log('✅ Account data loaded successfully')

  } catch (err) {
    console.error('❌ Error in fetchUserData:', err)
    error.value = err.message || 'Failed to load account data'
  } finally {
    loading.value = false
  }
}

const loadSubscriptionData = async () => {
  try {
    subscriptionLoading.value = true
    await loadSubscription()
    console.log('✅ Subscription data loaded')
  } catch (err) {
    console.error('❌ Error loading subscription:', err)
  } finally {
    subscriptionLoading.value = false
  }
}

const updateProfile = async () => {
  try {
    updatingProfile.value = true
    
    if (!user.value) throw new Error('No user found')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.value.id,
        ...editProfileForm.value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    userProfile.value = data
    showEditProfile.value = false
    
    alert('Profile updated successfully!')
    
  } catch (err) {
    console.error('Error updating profile:', err)
    alert('Failed to update profile. Please try again.')
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    alert('Passwords do not match')
    return
  }
  
  try {
    changingPassword.value = true
    
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.new_password
    })
    
    if (error) throw error
    
    showChangePassword.value = false
    passwordForm.value = {
      new_password: '',
      confirm_password: ''
    }
    
    alert('Password changed successfully!')
    
  } catch (err) {
    console.error('Error changing password:', err)
    alert('Failed to change password. Please try again.')
  } finally {
    changingPassword.value = false
  }
}

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    router.push('/auth/login')
  } catch (err) {
    console.error('Error signing out:', err)
    alert('Failed to sign out. Please try again.')
  }
}

const navigateToPlans = () => {
  router.push('/pricing')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchUserData(),
    loadSubscriptionData()
  ])
})
</script>

<style scoped>
/* Add any component-specific styles here */
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