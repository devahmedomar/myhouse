import 'dotenv/config';
import mongoose from 'mongoose';

// Reuse the same connection/promise across Vercel invocations.
const state = globalThis;

export async function connectDB() {
  if (state.__mongooseConnection && state.__mongooseConnection.readyState === 1) {
    return state.__mongooseConnection;
  }

  if (!state.__mongooseConnectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not configured');
    }

    state.__mongooseConnectionPromise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((client) => {
        state.__mongooseConnection = client.connection;
        return client.connection;
      })
      .catch((error) => {
        // Allow a later invocation to retry instead of reusing a failed promise.
        state.__mongooseConnectionPromise = null;
        throw error;
      });
  }

  return state.__mongooseConnectionPromise;
}

export async function disconnectDB() {
  if (state.__mongooseConnectionPromise) {
    await state.__mongooseConnectionPromise;
  }
  await mongoose.disconnect();
  state.__mongooseConnection = null;
  state.__mongooseConnectionPromise = null;
}
