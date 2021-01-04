const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology:true,
            useFindAndModify:false,
            useCreateIndex: true
        });
        console.log(`Server connected to mongodb ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1); // Exit with failure
    }
}

module.exports = connectDB;