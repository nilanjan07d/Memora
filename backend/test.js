// test.js
require("dotenv").config();   // ← Keep this (most reliable way)

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not found in .env file");
  console.error("Make sure .env exists and contains: MONGODB_URI=your_connection_string");
  process.exit(1);
}

console.log("🔍 Using URI (truncated):", uri.substring(0, 60) + "...");

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,   // Increase timeout
    connectTimeoutMS: 10000,
  });

  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await client.connect();
    
    console.log("✅ Successfully connected to MongoDB!");

    const db = client.db(); 
    console.log("📂 Database name:", db.databaseName || "default");

    await db.command({ ping: 1 });
    console.log("🏓 Ping successful!");

  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err.message);

    if (err.message.includes("ECONNREFUSED") || err.message.includes("querySrv")) {
      console.error("\n💡 Possible solutions:");
      console.error("1. Check your internet connection");
      console.error("2. Whitelist your current IP in MongoDB Atlas (Network Access)");
      console.error("3. Try using the 'Standard Connection String' (not SRV) from Atlas");
      console.error("4. Disable VPN / Proxy temporarily");
    }
  } finally {
    await client.close();
    console.log("🔒 Connection closed.");
  }
}

testConnection();