<template>
  <div class="register-page">
    <div class="register-card">
      <h2>Register</h2>
      <form @submit.prevent="registerUser">
        <input v-model="form.username" type="text" placeholder="Username" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
      <NuxtLink to="/" class="back-home">Back to Home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  username: '',
  email: '',
  password: ''
})

const message = ref('')

const registerUser = async () => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      message.value = 'Registration successful!'
      form.value = { username: '', email: '', password: '' }
    } else {
      const error = await response.json()
      message.value = `Error: ${error.message || 'Registration failed'}`
    }
  } catch (err) {
    console.error('Registration error:', err)
    message.value = 'An unexpected error occurred.'
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d1f661;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.register-card h2 {
  margin-bottom: 1rem;
}

.register-card input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.register-card button {
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

.back-home {
  display: block;
  margin-top: 1rem;
  color: #333;
  text-decoration: underline;
  cursor: pointer;
}
</style>
