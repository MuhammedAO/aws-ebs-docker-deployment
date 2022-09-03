const {
    pgUser,
    pgHost,
    pgDatabase,
    pgPassword,
    pgPort,
    redisHost,
    redisPort,
  } = require("./keys"),
  express = require("express"),
  cors = require("cors"),
  { Pool } = require("pg"),
  { createClient } = require("redis")

const app = express()
app.use(cors)
app.use(express.json())


const pgClient = new Pool({
  user: pgUser,
  host: pgHost,
  database: pgDatabase,
  password: pgPassword,
  port: pgPort,
})

pgClient.on("error", () => console.log("Lost PG connection"))

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err))
})

const redisClient = createClient({
  host: redisHost,
  port: redisPort,
  retry_strategy: () => 1000,
})

const redisPub = redisClient.duplicate()

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values")

  res.send(values.rows)
})

app.get("/values/current", (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values)
  })
})

app.post("/values", (req, res) => {
  console.log('index', index)
  const index = req.body.index
  if (index > 40) {
    return res.status(422).send("Index too high")
  }
  redisClient.hset("values", index, "nothing yet")
  redisPub.publish("insert", index)
  pgClient.query("INSERT INTO VALUES(number) VALUES($1)", [index])

  res.send({ working: true })
})

app.listen(5000, () => console.log("Port listening"))
