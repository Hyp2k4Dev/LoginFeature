const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: {
    type: [String], // Array of strings
    default: [], // Default to an empty array
  },
});
