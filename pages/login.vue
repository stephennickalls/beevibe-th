<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
      <NuxtLink to="/register" class="back-register">Don’t have an account? Register</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const message = ref('')

const loginUser = async () => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const result = await response.json()

    if (response.ok) {
      message.value = 'Login successful! Redirecting...'

      // ✅ Save token to localStorage
      localStorage.setItem('token', result.token)

      // ✅ Print token to console
      console.log('JWT Token:', result.token)

      form.value = { email: '', password: '' }

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      message.value = `Error: ${result.message || 'Login failed'}`
    }
  } catch (err) {
    console.error('Login error:', err)
    message.value = 'An unexpected error occurred.'
  }
}

</script>


<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d1f661;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.login-card h2 {
  margin-bottom: 1rem;
}

.login-card input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login-card button {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background-color: #333;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.message {
  margin-top: 1rem;
  color: red;
}

.back-register {
  display: block;
  margin-top: 1rem;
  color: #333;
  text-decoration: underline;
  cursor: pointer;
}
</style>
