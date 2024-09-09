import { fastify } from 'fastify'
import cors from '@fastify/cors'
import multipart from  '@fastify/multipart'

import { Routes } from './routes'

const app = fastify()

app.register(cors, {
  origin: '*',
})
app.register(multipart)
app.register(Routes)

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log('🚀 Server Running!')
})
