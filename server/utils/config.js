require('dotenv').config();
const PORT = process.env.PORT || 3001; 
const MONGODB_URL = process.env.MONGODB_URL
const JWT_KEY = process.env.JWT_KEY
module.exports = {
    PORT, MONGODB_URL , JWT_KEY
}