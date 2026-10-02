import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'arfurniture'

if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const productsDir = path.resolve(__dirname, '..', 'public', 'products')

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.glb': return 'model/gltf-binary'
    case '.gltf': return 'model/gltf+json'
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.json': return 'application/json'
    default: return 'application/octet-stream'
  }
}

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
}

async function main() {
  console.log('--- Step 1: Ensure Supabase Bucket Exists ---')
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error('Failed to list buckets:', listError.message)
    process.exit(1)
  }

  const existingBucket = buckets.find(b => b.name === bucketName)
  if (!existingBucket) {
    console.log(`Creating public bucket "${bucketName}"...`)
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    })
    if (createError) {
      console.error('Failed to create bucket:', createError.message)
      process.exit(1)
    }
    console.log(`Bucket "${bucketName}" created successfully.`)
  } else {
    console.log(`Bucket "${bucketName}" already exists. (public: ${existingBucket.public})`)
    if (!existingBucket.public) {
      console.log(`Updating bucket "${bucketName}" to public...`)
      await supabase.storage.updateBucket(bucketName, { public: true })
    }
  }

  console.log('\n--- Step 2: Upload All Local Product Assets (3D Models & Images) ---')
  const files = await getFiles(productsDir)
  console.log(`Found ${files.length} local files in public/products/`)

  let successCount = 0
  for (const filePath of files) {
    const relativePath = path.relative(productsDir, filePath).replace(/\\/g, '/')
    const storagePath = `products/${relativePath}`
    const buffer = await fs.readFile(filePath)
    const contentType = getContentType(filePath)

    console.log(`Uploading [${contentType}] -> ${storagePath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`)
    const { error } = await supabase.storage.from(bucketName).upload(storagePath, buffer, {
      contentType,
      upsert: true
    })

    if (error) {
      console.error(`  ❌ Failed: ${error.message}`)
    } else {
      successCount++
      console.log(`  ✓ Success: ${storagePath}`)
    }
  }

  console.log(`\n--- Step 3: Upload Marketing Banner Assets ---`)
  // Banner 1: Summer Sale
  const banner1Path = 'banners/main/images/1777585020857-photo-1618220179428-22790b461013.jpg'
  try {
    console.log(`Fetching Unsplash image for Summer Sale banner...`)
    const res = await fetch('https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80')
    if (res.ok) {
      const banner1Buffer = Buffer.from(await res.arrayBuffer())
      const { error: b1Err } = await supabase.storage.from(bucketName).upload(banner1Path, banner1Buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
      if (b1Err) {
        console.error(`  ❌ Banner 1 upload failed:`, b1Err.message)
      } else {
        successCount++
        console.log(`  ✓ Banner 1 uploaded: ${banner1Path}`)
      }
    }
  } catch (err) {
    console.error(`  ❌ Could not download Banner 1:`, err.message)
  }

  // Banner 2: Pinoy Craftsmanship Sale (use local rustic pine image)
  const banner2Path = 'banners-pinoy-craftsmanship-sale/main/images/1777586335247-1764396663637-m2e3xt.png'
  const localRusticPine = path.resolve(productsDir, 'images', 'rustic-pine-accent-cabinet-with-open-shelving', '1764396663637-m2e3xt.png')
  try {
    const banner2Buffer = await fs.readFile(localRusticPine)
    const { error: b2Err } = await supabase.storage.from(bucketName).upload(banner2Path, banner2Buffer, {
      contentType: 'image/png',
      upsert: true
    })
    if (b2Err) {
      console.error(`  ❌ Banner 2 upload failed:`, b2Err.message)
    } else {
      successCount++
      console.log(`  ✓ Banner 2 uploaded: ${banner2Path}`)
    }
  } catch (err) {
    console.error(`  ❌ Could not read Banner 2 source:`, err.message)
  }

  console.log(`\n==========================================`)
  console.log(`Migration Complete: ${successCount} total assets stored in Supabase bucket "${bucketName}"`)
  console.log(`==========================================`)
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
