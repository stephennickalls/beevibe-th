import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const supabaseDB = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseKey as string
    );

    return {
        provide: {
            supabaseDB
        }
    };
});
