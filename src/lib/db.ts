import mongoose from "mongoose";

const mongo_url = process.env.MONGODB_URL;

if (!mongo_url) {
  throw new Error("Please define MONGODB_URL in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if(!cached.promise){
    cached.promise = mongoose.connect(mongo_url!).then((c)=>c.connection)
     console.log("✅ MongoDB Connected");

  }
try{
    cached.conn = await cached.promise
}
catch(err){
    console.log(err)
    console.log("❌ DB ERROR:", err);
}
    return cached.conn;


}
export default connectDB