import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import passport from 'passport';
import './utils/passport.js'; 

import connectDB from './config/db.js';
import Snippet from './models/Snippet.js';
import { setIO } from './config/socket.js';
import registerSockets from './sockets/index.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import snippetRoutes from './routes/snippet.routes.js';
import wikiRoutes from './routes/wiki.routes.js';
import activityRoutes from './routes/activity.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import aiRoutes from './routes/ai.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
});
setIO(io);
registerSockets(io);

app.use(cors({
  origin: CLIENT_URL,
  credentials: true, 
}));
app.use(cookieParser()); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());

app.get('/health', (req, res) => res.json({ success: true, message: 'DevCollab backend is healthy' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'DevColab backend is healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/ai', aiRoutes);
app.use(errorHandler);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`DevColab backend running on port ${PORT}`));

    Snippet.syncIndexes()
      .then(() => console.log('Snippet indexes synchronized'))
      .catch((error) => {
        console.error('Snippet index synchronization failed:', error.message);
      });
  })
  .catch((error) => {
    console.error('Failed to start DevColab backend:', error.message);
    process.exit(1);
  });