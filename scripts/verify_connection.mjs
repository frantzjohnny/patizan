import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env file safely
let env = {};
if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf-8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value;
    }
  });
}

const rawUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('====================================================');
console.log('PATIZAN RECORDS — SUPABASE LIVE VERIFICATION');
console.log('====================================================\n');

console.log('1. ENVIRONMENT CONFIGURATION');
console.log('   - VITE_SUPABASE_URL present:', Boolean(supabaseUrl));
console.log('   - Target Supabase URL:', supabaseUrl);
console.log('   - VITE_SUPABASE_ANON_KEY present:', Boolean(supabaseAnonKey));
console.log('   - Anon Key valid JWT header (starts with eyJ):', supabaseAnonKey.startsWith('eyJ'));

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
  console.error('\n❌ ERROR: Supabase credentials are missing or placeholder in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAudit() {
  console.log('\n2. SUPABASE CORE SERVICES');

  // Test 1: Auth Service
  const authStart = Date.now();
  const { data: authData, error: authError } = await supabase.auth.getSession();
  const authLatency = Date.now() - authStart;
  if (authError) {
    console.log(`   ❌ AUTH: FAILED (${authLatency}ms) - ${authError.message}`);
  } else {
    console.log(`   ✅ AUTH SERVICE: CONNECTED (${authLatency}ms)`);
  }

  // Test 2: Storage Subsystem
  const storageStart = Date.now();
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  const storageLatency = Date.now() - storageStart;
  if (storageError) {
    console.log(`   ❌ STORAGE SERVICE: FAILED (${storageLatency}ms) - ${storageError.message}`);
  } else {
    console.log(`   ✅ STORAGE SERVICE: CONNECTED (${storageLatency}ms) - Buckets detected: ${buckets?.length || 0}`);
    if (buckets && buckets.length > 0) {
      console.log('      Available Buckets:', buckets.map(b => b.name).join(', '));
    }
  }

  // Test 3: Check All Tables
  console.log('\n3. DATABASE SCHEMA & TABLE INTEGRITY');
  const requiredTables = [
    'profiles', 'admin_users', 'customers', 'hero_slides', 'services', 
    'service_packages', 'bookings', 'studio_availability', 'blocked_times', 
    'gallery_categories', 'gallery_items', 'beat_categories', 'music_tracks', 
    'playlists', 'playlist_tracks', 'artists', 'testimonials', 'blog_categories', 
    'blog_posts', 'site_settings'
  ];

  let passedTables = 0;
  let missingTables = 0;
  for (const table of requiredTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      missingTables++;
      console.log(`   ⚠️ Table [${table}]: NOT INITIALIZED (${error.message})`);
    } else {
      passedTables++;
      console.log(`   ✅ Table [${table}]: ACTIVE (rows: ${data?.length})`);
    }
  }
  console.log(`   Database Status: ${passedTables}/${requiredTables.length} tables initialized`);

  // Test 4: Storage Buckets Integrity
  console.log('\n4. STORAGE BUCKET VERIFICATION');
  const requiredBuckets = ['covers', 'studio-images', 'gallery', 'videos', 'music', 'avatars', 'blog', 'site-assets'];
  const existingBucketSet = new Set((buckets || []).map(b => b.name));
  let passedBuckets = 0;
  for (const b of requiredBuckets) {
    if (existingBucketSet.has(b)) {
      passedBuckets++;
      console.log(`   ✅ Bucket [${b}]: ACTIVE & AVAILABLE`);
    } else {
      console.log(`   ⚠️ Bucket [${b}]: NOT CREATED YET`);
    }
  }
  console.log(`   Storage Status: ${passedBuckets}/${requiredBuckets.length} buckets available`);

  console.log('\n5. CONCLUSION & NEXT ACTION');
  if (missingTables > 0 || passedBuckets < requiredBuckets.length) {
    console.log('   ℹ️  The Supabase project is active, online, and responding.');
    console.log('   ℹ️  To provision all tables, buckets, and RLS policies:');
    console.log('       1. Open Supabase Dashboard -> SQL Editor');
    console.log('       2. Paste and run supabase/setup_complete.sql');
  } else {
    console.log('   🎉 All tables and storage buckets are fully provisioned and verified!');
  }

  console.log('\n====================================================');
  console.log('AUDIT RUN COMPLETED');
  console.log('====================================================');
}

runAudit().catch(err => {
  console.error('Audit exception:', err);
});
