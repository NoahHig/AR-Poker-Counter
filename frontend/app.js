console.log("Howdy World");
const express = require("express");
const app = express();
const port = 8080;

app.listen(port);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Howdy World");
});

app.get("/poker", (req, res) => {
  res.render("index");
});