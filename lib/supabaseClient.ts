/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztrlzasmhlshdsrxdsug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cmx6YXNtaGxzaGRzcnhkc3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjIzNDEsImV4cCI6MjA3NDk5ODM0MX0.l6R4MlldNt-Dmf9zxwCJxUl0IIn4HuyxPLS4Z6ysGr0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);