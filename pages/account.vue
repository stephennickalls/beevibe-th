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
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <img v-if="userProfile.avatar_url" :src="userProfile.avatar_url" alt="Avatar" class="w-full h-full rounded-full object-cover">
                <span v-else class="text-xl font-bold">{{ getInitials(userProfile.first_name, userProfile.last_name) }}</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ userProfile.first_name || 'No name' }} {{ userProfile.last_name || '' }}</h3>
                <p class="text-gray-400">{{ userProfile.username || 'No username set' }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div>
                <label class="text-sm text-gray-400">Email</label>
                <p class="text-white">{{ userAuth.email || 'No email' }}</p>
              </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Meta with middleware
definePageMeta({
  title: 'Account Management - BeeVibe Dashboard',
  middleware: ['auth'] // Apply auth middleware
})

// Use Supabase composables (recommended for Nuxt 3)
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Reactive data
const loading = ref(true)
const error = ref(null)
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

// Methods
const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
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
    
    // User is guaranteed to exist due to middleware, but double-check
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
    
    // Try to fetch user profile from database
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError)
        // Create a default profile if it doesn't exist
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

// Lifecycle
onMounted(async () => {
  await fetchUserData()
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>