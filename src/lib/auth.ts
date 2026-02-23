import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import { transporter } from '@/lib/nodemailer.ts'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void transporter.sendMail({
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`,
      })
    },
  },
  emailVerification: {
    enabled: true,
    sendVerificationEmail: async ({ user, url }) => {
      void transporter.sendMail({
        from: '"Marketplace"',
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Click the link to verify your email: <a href=${url}>${url}</a></p>`,
        text: `go to the link ${url}`,
      })
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void transporter.sendMail({
          from: '"Marketplace"',
          to: user.email, // Sent to the CURRENT email
          subject: 'Approve email change',
          text: `Click the link to approve the change to ${newEmail}: ${url}`,
        })
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
