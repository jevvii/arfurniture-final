import express from 'express'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSupabaseClient, getBucketName } from '../config/storage.mjs'
import logger from '../utils/logger.mjs'

const router = express.Router()

function getContentType(filePath) {
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'))
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

router.get('/*key', async (req, res) => {
  // Extract the object key from the URL path (Express 5 returns array for wildcard)
  const rawKey = Array.isArray(req.params.key) ? req.params.key.join('/') : (req.params.key || req.params[0])
  
  if (!rawKey) {
    return res.status(400).send('Asset key is required')
  }

  const key = String(rawKey).replace(/^\/+/, '')
  const activeBucket = getBucketName()

  // 1. Direct Supabase Public CDN Redirect
  // Since the Supabase bucket is public and backed by global Cloudflare CDN,
  // issuing a 302 redirect is instantaneous (~5ms), handles large 3D models (>25MB)
  // without hitting Vercel serverless function timeouts or memory limits,
  // and preserves CORS headers (access-control-allow-origin: *).
  if (process.env.SUPABASE_URL) {
    const cleanBase = process.env.SUPABASE_URL.replace(/\/+$/, '')
    const publicUrl = `${cleanBase}/storage/v1/object/public/${activeBucket}/${key}`
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.redirect(302, publicUrl)
  }

  // 2. Fallback: S3 / Storj Client
  const storage = getSupabaseClient()
  if (storage && storage.client && typeof storage.client.send === 'function') {
    try {
      const command = new GetObjectCommand({
        Bucket: activeBucket,
        Key: key
      })

      const response = await storage.client.send(command)

      res.setHeader('Content-Type', response.ContentType || getContentType(key))
      if (response.ContentLength) {
        res.setHeader('Content-Length', response.ContentLength)
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('Access-Control-Allow-Origin', '*')
      
      if (response.Body && typeof response.Body.pipe === 'function') {
        return response.Body.pipe(res)
      } else if (response.Body && response.Body.transformToWebStream) {
        const reader = response.Body.transformToWebStream().getReader()
        const pump = async () => {
          const { done, value } = await reader.read()
          if (done) return res.end()
          res.write(value)
          return pump()
        }
        return pump()
      }
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.code === 'NoSuchKey') {
        logger.warn(`Asset not found in bucket: ${key}`)
        return res.status(404).send('Asset not found')
      }
      logger.error(`Error streaming asset from S3: ${key}`, { message: error.message })
      return res.status(500).send('Internal Server Error')
    }
  }

  return res.status(500).send('Storage configuration error')
})

export default router
