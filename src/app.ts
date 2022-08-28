import http from 'http';

import cors from 'cors';
import { config } from 'dotenv';
import express, { Application, json, Request, Response, urlencoded } from 'express';
import { Server } from 'socket.io';

import { authMiddleware } from './auth/auth.middleware';
import AUTH from './endpoints/auth';
import COLLECTION from './endpoints/collection';
import COMMENT from './endpoints/comment';
import { CommentResponseType } from './endpoints/comment/types';
import ITEM from './endpoints/item';
import LIKE from './endpoints/like';
import TAGS from './endpoints/tags';
import USER from './endpoints/user';
import { errorHandler } from './error-handler/error-handler';
import CommentModel from './models/db/comment.db';
import { connect } from './models/db/connection/mongoose-connection';
import UserModel from './models/db/user.db';

config();

const DEFAULT_PORT = 3000;

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket',
  cors: {
    origin: process.env.BASE_CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.BASE_CLIENT_URL }));
app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());

connect();

app.get('/', (req: Request, res: Response) => {
  res.send('Course project server');
});

app.get('/auth/check', authMiddleware(), AUTH.check);
app.post('/auth/sign-up', AUTH.signUp);
app.post('/auth/sign-in', AUTH.signIn);

app.get('/users', authMiddleware(true), USER.getUsers);
app.get('/users/:id', USER.getUserName);
app.delete('/users', authMiddleware(true), USER.deleteUsers);
app.put('/users', authMiddleware(true), USER.updateUsers);

app.get('/collections/:id', authMiddleware(), COLLECTION.getCollection);
app.post('/collections', authMiddleware(), COLLECTION.createCollection);
app.patch('/collections/:id', authMiddleware(), COLLECTION.updateCollection);
app.delete('/collections/:id', authMiddleware(), COLLECTION.deleteCollection);
app.get('/collections/user/:id', COLLECTION.getUserCollections);

app.get('/topics', authMiddleware(), COLLECTION.getTopics);

app.get('/tags', authMiddleware(), TAGS.getTags);

app.get('/items/:id', authMiddleware(), ITEM.getItem);
app.post('/items', authMiddleware(), ITEM.createItem);
app.patch('/items/:id', authMiddleware(), ITEM.updateItem);
app.delete('/items', authMiddleware(), ITEM.deleteItems);
app.get('/items/collection/:id', authMiddleware(), ITEM.getCollectionItems);

app.get('/comments/:id', COMMENT.getComments);
app.post('/comments', authMiddleware(), COMMENT.createComment);

app.get('/likes/:id', LIKE.getItemLikes);
app.post('/likes', LIKE.createLike);
app.delete('/likes', LIKE.deleteLike);

app.use(errorHandler);

io.on('connection', socket => {
  socket.on('itemId', (itemId: string) => {
    const commentsChangeStream = CommentModel.watch();

    commentsChangeStream.on('change', async data => {
      try {
        if (data.operationType === 'insert') {
          const { item, _id, createdAt, message, user } = data.fullDocument;
          const userDb = await UserModel.findById(user._id.toString());

          if (!userDb) return;
          const userRes = { id: userDb.id.toString(), name: userDb.name };

          if (itemId === item.toString()) {
            const comment: CommentResponseType = {
              id: _id.toString(),
              date: createdAt!.toString(),
              item: item.toString(),
              message,
              user: userRes,
            };

            io.to(socket.id).emit('newComment', comment);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
});

const PORT = process.env.PORT || DEFAULT_PORT;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
