import cors from 'cors';
import { config } from 'dotenv';
import express, { Application, Request, Response, urlencoded, json } from 'express';

import { authMiddleware } from './auth/auth.middleware';
import AUTH from './endpoints/auth';
import USERS from './endpoints/users';
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

app.get('/user', authMiddleware(true), USERS.getAllUsers);
app.delete('/user', authMiddleware(true), USERS.deleteUsers);
app.put('/user', authMiddleware(true), USERS.updateUsers);

app.use(errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
