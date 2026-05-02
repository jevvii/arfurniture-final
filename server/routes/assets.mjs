import express from 'express'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSupabaseClient, getBucketName } from '../config/storage.mjs'
import logger from '../utils/logger.mjs'

const router = express.Router()

router.get('/*key', async (req, res) => {
  // Extract the object key from the URL path
  const key = Array.isArray(req.params.key) ? req.params.key.join('/') : (req.params.key || req.params[0]);
  
  if (!key) {
    return res.status(400).send('Asset key is required');
  }

  const storage = getSupabaseClient()
  const activeBucket = getBucketName()

  if (!storage || !storage.client) {
    logger.error('Storage client not initialized for asset proxy', { provider: process.env.STORAGE_PROVIDER })
    return res.status(500).send('Storage configuration error')
  }

  try {
    logger.info(`Proxying asset from ${activeBucket}: ${key}`)
    
    const command = new GetObjectCommand({
      Bucket: activeBucket,
      Key: key.replace(/^\/+/, '') // Remove any leading slashes
    })

    const response = await storage.client.send(command)

    // Set headers
    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream')
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength)
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    // Convert Web Stream to Node Stream if necessary (SDK v3 compatibility)
    if (response.Body && typeof response.Body.pipe === 'function') {
      response.Body.pipe(res)
    } else {
      // Fallback for different SDK/Runtime versions
      const stream = response.Body
      if (stream && stream.transformToWebStream) {
        const reader = stream.transformToWebStream().getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          return pump();
        };
        pump();
      } else {
        throw new Error('Response body is not a recognizable stream')
      }
    }
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.code === 'NoSuchKey') {
      logger.warn(`Asset not found in bucket: ${key}`)
      res.status(404).send('Asset not found')
    } else {
      logger.error(`Error streaming asset: ${key}`, { 
        message: error.message,
        code: error.code,
        name: error.name
      })
      res.status(500).send('Internal Server Error')
    }
  }
})

export default router
