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
  // Extract the object key from the URL path
  const rawKey = Array.isArray(req.params.key) ? req.params.key.join('/') : (req.params.key || req.params[0])
  
  if (!rawKey) {
    return res.status(400).send('Asset key is required')
  }

  const key = String(rawKey).replace(/^\/+/, '')
  const storage = getSupabaseClient()
  const activeBucket = getBucketName()

  if (!storage) {
    logger.error('Storage client not initialized for asset proxy', { provider: process.env.STORAGE_PROVIDER })
    return res.status(500).send('Storage configuration error')
  }

  try {
    logger.info(`Proxying asset from ${activeBucket}: ${key}`)

    // 1. Supabase Storage Provider
    if (storage.storage && typeof storage.storage.from === 'function' && !storage.client) {
      const { data: publicUrlData } = storage.storage.from(activeBucket).getPublicUrl(key)
      if (publicUrlData && publicUrlData.publicUrl) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        res.setHeader('Access-Control-Allow-Origin', '*')
        return res.redirect(302, publicUrlData.publicUrl)
      }

      // Fallback: download buffer directly
      const { data, error } = await storage.storage.from(activeBucket).download(key)
      if (error) {
        if (error.statusCode === '404' || error.message?.includes('not found')) {
          logger.warn(`Asset not found in Supabase bucket: ${key}`)
          return res.status(404).send('Asset not found')
        }
        throw error
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      res.setHeader('Content-Type', data.type || getContentType(key))
      res.setHeader('Content-Length', buffer.length)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.send(buffer)
    }

    // 2. Storj / S3 Compatible Provider
    if (storage.client && typeof storage.client.send === 'function') {
      const command = new GetObjectCommand({
        Bucket: activeBucket,
        Key: key
      })

      const response = await storage.client.send(command)

      // Set headers
      res.setHeader('Content-Type', response.ContentType || getContentType(key))
      if (response.ContentLength) {
        res.setHeader('Content-Length', response.ContentLength)
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('Access-Control-Allow-Origin', '*')
      
      // Convert Web Stream to Node Stream if necessary (SDK v3 compatibility)
      if (response.Body && typeof response.Body.pipe === 'function') {
        return response.Body.pipe(res)
      } else {
        const stream = response.Body
        if (stream && stream.transformToWebStream) {
          const reader = stream.transformToWebStream().getReader()
          const pump = async () => {
            const { done, value } = await reader.read()
            if (done) return res.end()
            res.write(value)
            return pump()
          }
          return pump()
        } else {
          throw new Error('Response body is not a recognizable stream')
        }
      }
    }

    throw new Error('Unsupported storage client configuration')
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.code === 'NoSuchKey') {
      logger.warn(`Asset not found in bucket: ${key}`)
      return res.status(404).send('Asset not found')
    } else {
      logger.error(`Error streaming asset: ${key}`, { 
        message: error.message,
        code: error.code,
        name: error.name
      })
      return res.status(500).send('Internal Server Error')
    }
  }
})

export default router
