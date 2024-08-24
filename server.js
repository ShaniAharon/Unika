import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'; //import the dotenv 
import cron from 'node-cron';

dotenv.config(); // add the config

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')
console.log('process.env.SECRET1', process.env.SECRET1)
console.log('process.env.MONGODB_URI', process.env.MONGODB_URI)

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express()

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true
  }
  app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { productRoutes } from './api/product/product.routes.js';

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/product', productRoutes)

// Make every unmatched server-side-route fall back to index.html
// So when requesting http://localhost:3030/index.html/toy/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there

app.get('/wake-up', (req, res) => {
  console.log('Service is awake and working');
  res.send('Service is awake and working');
});

// Wake-up task to keep the service active
cron.schedule('*/13 * * * *', async () => {
  try {
    console.log('Wake-up task running');
    await axios.get(`https://unika.onrender.com/wake-up`);
  } catch (error) {
    console.error('Error during wake-up task:', error);
  }
});


app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})


const port = process.env.PORT || 3030

app.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})