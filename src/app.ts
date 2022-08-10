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

app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());
app.use(cors({ origin: process.env.BASE_CLIENT_URL }));

connect();

app.get('/', (req: Request, res: Response) => {
  res.send('Course project server');
});

app.get('/auth/check', authMiddleware, AUTH.check);
app.post('/auth/sign-up', AUTH.signUp);
app.post('/auth/sign-in', AUTH.signIn);

app.get('/user', authMiddleware, USERS.getAllUsers);
app.post('/user/status', authMiddleware, USERS.updateUsersStatus);
app.post('/user/access', authMiddleware, USERS.updateUsersAccess);
app.delete('/user', authMiddleware, USERS.deleteUsers);

app.use(errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
