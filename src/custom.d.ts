/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile as DiscordProfile } from 'passport-discord'
import { Profile as GoogleProfile } from 'passport-google-oauth'

declare global {
  namespace Express {
    export interface User {
      google: GoogleProfile
      discord: DiscordProfile
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      API_ROOT: string
      CS_GUILD: string
      CS_ADMIN: string
      CS_APPROVED: string
      CS_STUDENT: string
      CS_ALUMNUS: string
      CS_TEACHER: string
      CS_TEACHING_ASSISTANT: string
      DISCORD_CLIENT_ID: string
      DISCORD_CLIENT_SECRET: string
      DISCORD_TOKEN: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      WOLFRAM_KEY: string
      REDIS_URL: string
      SESSION_SECRET: string
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    inGuild: boolean
    updatedNickname: boolean
    classes: string[]
    subjects: string[]
    status: 'student' | 'alumnus' | 'teacher'
  }
}

export interface RedisClass {
  channel: string
  subject: string
  course: string
  section: string
  title: string
  instructor: string
  enrolment: number
  sessionCode: string
}
