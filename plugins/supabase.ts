import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const supabaseDB = createClient(
        config.public.SUPABASE_URL as string,
        config.public.SUPABASE_KEY as string
    );

    return {
        provide: {
            supabaseDB
        }
    };
});
