/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile as DiscordProfile } from 'passport-discord'
import { Profile as GoogleProfile } from 'passport-google-oauth'

declare global {
  namespace Express {
    export interface Session {
      inGuild: boolean
      updatedNickname: boolean
      classes: string[]
      status: 'student' | 'alumnus' | 'teacher'
    }
    export interface User {
      google: GoogleProfile
      discord: DiscordProfile
    }
  }
}
