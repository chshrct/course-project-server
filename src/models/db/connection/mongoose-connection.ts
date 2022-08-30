import { config } from 'dotenv';
import mongoose, { Connection } from 'mongoose';

config();

const CONNECTED = 1;
const CONNECTING = 2;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mongooseConnection: Connection | null = null;

export async function connect(): Promise<Connection | null> {
  try {
    mongoose.connection.on('connecting', () => {
      console.log(`MongoDB: connecting.`);
    });
    mongoose.connection.on('connected', () => {
      console.log('MongoDB: connected.');
    });
    mongoose.connection.on('disconnecting', () => {
      console.log('MongoDB: disconnecting.');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB: disconnected.');
    });

    if (
      mongoose.connection.readyState !== CONNECTED &&
      mongoose.connection.readyState !== CONNECTING
    ) {
      const conn = await mongoose.connect(process.env.DB_URL!, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      });

      mongooseConnection = conn.connection;
    }
  } catch (error) {
    console.log(`Error connecting to DB`, error);
  }

  return mongooseConnection;
}
