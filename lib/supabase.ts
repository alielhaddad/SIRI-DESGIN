
import { createClient } from '@supabase/supabase-js';

const url = 'https://hfdykvlywthgdkshgeis.supabase.co';
const key = 'sb_publishable_nVMzYeBFdNY4gvkKrCDzaw_pGe3ZmUj';

export const supabase = createClient(url, key);
