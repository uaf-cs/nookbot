import Redis from 'ioredis'

export const r = new Redis(process.env.REDIS_URL)

export default {
  r
}
