import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGO_URI from environment.
 * Retries once on failure, then exits the process if still unreachable.
 *
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    process.stderr.write("MONGO_URI is not defined in environment variables\n");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // These options are defaults in Mongoose 7+ but listed explicitly for clarity
      serverSelectionTimeoutMS: 5000,
    });

    process.stdout.write(`MongoDB connected: ${conn.connection.host}\n`);
  } catch (err) {
    process.stderr.write(`MongoDB connection error: ${err.message}\n`);
    // Retry once after 3 seconds, then give up
    await new Promise((r) => setTimeout(r, 3000));
    try {
      await mongoose.connect(uri);
      process.stdout.write("MongoDB connected on retry\n");
    } catch (retryErr) {
      process.stderr.write(`MongoDB retry failed: ${retryErr.message}\n`);
      process.exit(1);
    }
  }
};

// Graceful shutdown — close connection when process terminates
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.stdout.write("MongoDB connection closed via SIGINT\n");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  process.stdout.write("MongoDB connection closed via SIGTERM\n");
  process.exit(0);
});
