const mongoose=require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION_URL)
mongoose.set('runValidators', true);