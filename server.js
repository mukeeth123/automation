import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname since we are in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Helps avoid SSL/TLS handshake errors on localhost
  }
})

// Verify transporter connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email Connection Error:', error)
  } else {
    console.log('Email Server is ready to send emails!')
  }
})

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html, pdfBase64, filename } = req.body
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER

  console.log(`Attempting to send email from ${fromEmail} to ${to}...`)

  try {
    const mailOptions = {
      from: `"AutoFlow AI" <${fromEmail}>`,
      to: to || process.env.DEFAULT_RECIPIENT || 'mukeethr67@gmail.com',
      subject: subject || 'AutoFlow AI Notification Alert',
      text: text,
      html: html || text.replace(/\n/g, '<br>'),
      attachments: []
    }

    if (pdfBase64) {
      console.log(`Attaching PDF document: ${filename || 'document.pdf'}`)
      mailOptions.attachments.push({
        filename: filename || 'document.pdf',
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf'
      })
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully: %s', info.messageId)
    return res.status(200).json({ ok: true, messageId: info.messageId })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`AutoFlow AI Mailer backend listening on port ${PORT}`)
})
