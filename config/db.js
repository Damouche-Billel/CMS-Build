const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || process.env.DB_URI, // Use MONGODB_URI first
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
        w: 'majority'
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;