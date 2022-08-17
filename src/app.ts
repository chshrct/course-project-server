import cors from 'cors';
import { config } from 'dotenv';
import express, { Application, Request, Response, urlencoded, json } from 'express';

import { authMiddleware } from './auth/auth.middleware';
import AUTH from './endpoints/auth';
import COLLECTION from './endpoints/collection';
import USER from './endpoints/user';
import { errorHandler } from './error-handler/error-handler';
import { connect } from './models/db/mongoose-connection';

config();
const DEFAULT_PORT = 3000;
const app: Application = express();

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

app.post('/collections', authMiddleware(), COLLECTION.createCollection);
app.get('/collections/:id', COLLECTION.getUserCollections);
app.patch('/collections/:id', authMiddleware(), COLLECTION.updateCollection);
app.delete('/collections/:id', authMiddleware(), COLLECTION.deleteCollection);
app.get('/topics', authMiddleware(), COLLECTION.getTopics);

app.use(errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
