import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'arfurniture'

if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const modelsDir = path.resolve('public/products/3dmodels')

async function getGlbFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  const files = []
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      files.push(...(await getGlbFiles(res)))
    } else if (dirent.name.endsWith('.glb')) {
      files.push(res)
    }
  }
  return files
}

async function main() {
  console.log('🚀 Starting Universal USDZ Converter for iOS QuickLook...')
  const glbFiles = await getGlbFiles(modelsDir)
  console.log(`Found ${glbFiles.length} GLB models in ${modelsDir}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent('<html><body><h1>USDZ Converter</h1></body></html>')

  // Pre-load Three.js and Exporters in browser
  console.log('Loading Three.js and USDZExporter in headless browser...')
  await page.evaluate(async () => {
    window.THREE = await import('https://esm.sh/three@0.160.0')
    const { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js')
    const { USDZExporter } = await import('https://esm.sh/three@0.160.0/examples/jsm/exporters/USDZExporter.js')
    window.GLTFLoader = GLTFLoader
    window.USDZExporter = USDZExporter
  })
  console.log('✓ Three.js & USDZExporter ready.')

  const generatedFiles = []

  for (let i = 0; i < glbFiles.length; i++) {
    const glbPath = glbFiles[i]
    const relativePath = path.relative(modelsDir, glbPath)
    const usdzPath = glbPath.replace(/\.glb$/, '.usdz')
    const storageGlbPath = `products/3dmodels/${relativePath}`
    const storageUsdzPath = storageGlbPath.replace(/\.glb$/, '.usdz')

    console.log(`\n[${i + 1}/${glbFiles.length}] Converting ${path.basename(glbPath)} -> USDZ...`)
    const startTime = Date.now()

    const glbBase64 = (await fs.promises.readFile(glbPath)).toString('base64')

    try {
      const usdzBase64 = await page.evaluate(async (base64) => {
        const binary = atob(base64)
        const len = binary.length
        const bytes = new Uint8Array(len)
        for (let j = 0; j < len; j++) bytes[j] = binary.charCodeAt(j)

        const loader = new window.GLTFLoader()
        const gltf = await new Promise((resolve, reject) => {
          loader.parse(bytes.buffer, '', resolve, reject)
        })

        const exporter = new window.USDZExporter()
        const usdzArrayBuffer = await exporter.parse(gltf.scene)

        const usdzBytes = new Uint8Array(usdzArrayBuffer)
        let binaryStr = ''
        const chunk = 8192
        for (let j = 0; j < usdzBytes.length; j += chunk) {
          binaryStr += String.fromCharCode.apply(null, usdzBytes.subarray(j, j + chunk))
        }
        return btoa(binaryStr)
      }, glbBase64)

      const usdzBuffer = Buffer.from(usdzBase64, 'base64')
      await fs.promises.writeFile(usdzPath, usdzBuffer)
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`  ✓ Converted in ${duration}s. Local file: ${usdzPath} (${(usdzBuffer.length / 1024 / 1024).toFixed(2)} MB)`)

      // Upload to Supabase Storage
      console.log(`  ☁️ Uploading to Supabase Storage: ${storageUsdzPath}...`)
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(storageUsdzPath, usdzBuffer, {
        contentType: 'model/vnd.usdz+zip',
        upsert: true
      })

      if (uploadError) {
        console.error(`  ❌ Supabase upload failed: ${uploadError.message}`)
      } else {
        console.log(`  ✓ Uploaded to Supabase CDN: ${storageUsdzPath}`)
        generatedFiles.push({
          glbStoragePath: storageGlbPath,
          usdzStoragePath: storageUsdzPath,
          usdzUrl: `/api/assets/${storageUsdzPath}`
        })
      }
    } catch (err) {
      console.error(`  ❌ Failed to convert ${path.basename(glbPath)}:`, err.message)
    }
  }

  await browser.close()
  console.log(`\n🎉 USDZ Generation & Upload Complete! ${generatedFiles.length}/${glbFiles.length} models ready for iOS QuickLook.`)
  return generatedFiles
}

main().catch(console.error)
