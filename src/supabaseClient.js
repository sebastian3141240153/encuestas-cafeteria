import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsxeuisycrvgxvglbwqg.supabase.co'
const supabaseKey = 'sb_publishable_qMF8ELvP2FUX2F3F_iRclw_1-j6QxLc'

export const supabase = createClient(supabaseUrl, supabaseKey)