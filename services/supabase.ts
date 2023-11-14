import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';

import {Database} from '@/types/schema';

// PRODUCTION
// const supabaseUrl = 'https://nuebmbosucpgaramwuca.supabase.co';
// const supabaseAnonKey =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZWJtYm9zdWNwZ2FyYW13dWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk4OTA0NjIsImV4cCI6MjAxNTQ2NjQ2Mn0.SMKnR63Epob4IfeVOOb9ikZSGrQFygj5ztHrvsaziqg';

// DEV
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

supabase.auth.onAuthStateChange((event, session) => {
    console.log('AUTH STATE:', event, JSON.stringify(session));
});
