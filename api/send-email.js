import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, subject, text, html, pdfBase64, filename } = req.body
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER

  console.log(`Vercel function attempting to send email from ${fromEmail} to ${to}...`)

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  try {
    const mailOptions = {
      from: `"OpsHub" <${fromEmail}>`,
      to: to || process.env.DEFAULT_RECIPIENT || 'mukeethr67@gmail.com',
      subject: subject || 'OpsHub Notification Alert',
      text: text,
      html: html || text.replace(/\n/g, '<br>'),
      attachments: []
    }

    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: filename || 'document.pdf',
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf'
      })
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return res.status(200).json({ ok: true, messageId: info.messageId })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
}
