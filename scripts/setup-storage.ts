import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBuckets() {
  console.log("🪣 Setting up Supabase Storage buckets...\n");

  const buckets = [
    { name: "uploads", public: true },
    { name: "snapshots", public: true },
  ];

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);

    if (existing) {
      console.log(`✅ Bucket "${bucket.name}" already exists`);
      continue;
    }

    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
    });

    if (error) {
      console.error(
        `❌ Failed to create bucket "${bucket.name}":`,
        error.message,
      );
    } else {
      console.log(
        `✅ Created bucket "${bucket.name}" (public: ${bucket.public})`,
      );
    }
  }

  console.log("\n🎉 Storage setup complete!");
}

setupBuckets();
