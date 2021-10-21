const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// routes
const userRouter = require("./routes/userRouter");

app.use("/users", userRouter);

db.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch((err) => {
    console.log("err", err);
  });
