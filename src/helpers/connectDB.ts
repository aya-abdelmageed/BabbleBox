import mongoose from "mongoose";


const MONGODB_URI =
  "mongodb+srv://ahmedmostafa:01144781238ahmed@ecommerce.lxpr7.mongodb.net/?retryWrites=true&w=majorityx";

// Connect to MongoDB
const startConnection = () => {
mongoose
  .connect(MONGODB_URI, )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

}

export default startConnection;
