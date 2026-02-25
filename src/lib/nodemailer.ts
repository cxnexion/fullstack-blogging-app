import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'blogging.ltd@gmail.com',
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
})