const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Log database name
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;