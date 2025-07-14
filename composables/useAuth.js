// composables/useAuth.js
export const useAuthUser = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    return { data, error }
  }
  
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  
  return { user, signUp, signIn, signOut }
}