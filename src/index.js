const app=require('./app')

const port = process.env.PORT;



app.listen(port, () => {
  console.log("Server up and running on ",port);
});