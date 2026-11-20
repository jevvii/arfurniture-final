import express from 'express'
import { ObjectId } from 'mongodb'
import { asyncHandler } from '../middleware/errorHandler.mjs'
import { EventEmitter } from 'events'

const router = express.Router()

// Global notification emitter for SSE
export const notificationEmitter = new EventEmitter()

// Server-Sent Events (SSE) Stream
router.get('/stream/:userId', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Initial flush to establish connection
    res.write(':\n\n')

    const listener = (notification) => {
        if (notification.userId === req.params.userId) {
            res.write(`data: ${JSON.stringify(notification)}\n\n`)
        }
    }

    notificationEmitter.on('new_notification', listener)

    req.on('close', () => {
        notificationEmitter.off('new_notification', listener)
    })
})

// Create an admin notification when a user chats with the AI product assistant
router.post('/chat-inquiry', asyncHandler(async (req, res) => {
    const {
        productId,
        productName,
        customerId,
        customerName,
        customerEmail,
        question,
        answer
    } = req.body || {}

    const trimmedQuestion = typeof question === 'string' ? question.trim() : ''
    if (!trimmedQuestion) {
        return res.status(400).json({ error: 'Question is required' })
    }

    const notifications = req.app.locals.collections.notifications
    const displayCustomer = (typeof customerName === 'string' && customerName.trim()) ? customerName.trim() : 'Guest Customer'
    const displayProduct = (typeof productName === 'string' && productName.trim()) ? productName.trim() : 'a product'
    const questionPreview = trimmedQuestion.length > 100 ? `${trimmedQuestion.slice(0, 100)}...` : trimmedQuestion

    const notification = {
        userId: 'admin',
        type: 'ai_chat',
        productId: productId || null,
        productName: displayProduct,
        customerId: customerId || null,
        customerName: displayCustomer,
        customerEmail: customerEmail || null,
        question: trimmedQuestion,
        answer: typeof answer === 'string' ? answer.slice(0, 500) : '',
        message: `${displayCustomer} asked AI about ${displayProduct}: "${questionPreview}"`,
        isRead: false,
        createdAt: new Date()
    }

    const insertResult = await notifications.insertOne(notification)
    const fullNotification = { ...notification, _id: insertResult.insertedId.toString() }

    notificationEmitter.emit('new_notification', fullNotification)

    res.status(201).json(fullNotification)
}))

// Get notifications for a user
router.get('/:userId', asyncHandler(async (req, res) => {
    const notifications = req.app.locals.collections.notifications

    const userNotifications = await notifications
        .find({ userId: req.params.userId })
        .sort({ createdAt: -1 })
        .toArray()

    res.json(userNotifications)
}))

// Mark notification as read
router.patch('/:id/read', asyncHandler(async (req, res) => {
    const notifications = req.app.locals.collections.notifications

    const result = await notifications.updateOne(
        { _id: (ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : req.params.id) },
        { $set: { isRead: true, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Notification not found' })
    }

    res.json({ success: true })
}))

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', asyncHandler(async (req, res) => {
    const notifications = req.app.locals.collections.notifications

    await notifications.updateMany(
        { userId: req.params.userId, isRead: false },
        { $set: { isRead: true, updatedAt: new Date() } }
    )

    res.json({ success: true })
}))

export default router
