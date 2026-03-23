import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yelyprjmeshfdctujgvf.supabase.co';
const supabaseAnonKey = 'sb_publishable_rTHpidKTaris3Iu1gH165g_ter8uM2d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);