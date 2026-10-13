const SUPABASE_URL = "https://fykexszruwekjkwexkql.supabase.co";
const SUPABASE_KEY = "sb_publishable_fWUZjsm9fJp29l-CP2_ClA_5pBFBTrn";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        global: {
            headers: {}
        }
    }
);
