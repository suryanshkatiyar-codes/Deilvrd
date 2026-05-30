import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import config from "./src/config/config.js";
import "./src/queues/releaseWorker.js";

connectDb();

app.listen(config.PORT, () => {
  console.log("Server is running on port 3000");
});