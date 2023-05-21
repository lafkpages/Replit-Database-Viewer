const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/db/get", (req, res) => {
  fetch(
    `${Buffer.from(req.query.url, "base64").toString("ascii")}/${Buffer.from(
      req.query.key,
      "base64"
    ).toString("ascii")}`
  )
    .then((resp) => resp.text())
    .then((data) => {
      res.status(200);
      res.send(data);
    })
    .catch((err) => {
      res.status(500);
      res.send(err);
    });
});

app.get("/db/set", (req, res) => {
  const url = Buffer.from(req.query.url, "base64").toString("ascii");
  const key = Buffer.from(req.query.key, "base64").toString("ascii");
  const val = Buffer.from(req.query.val, "base64").toString("ascii");

  fetch(`${url}/${key}`, {
    method: "POST",
    body: `${encodeURIComponent(key)}=${encodeURIComponent(val)}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((resp) => resp.text())
    .then((data) => {
      res.status(200);
      res.send(data);
    })
    .catch((err) => {
      res.status(500);

      res.send(err);
    });
});

app.get("/db/del", (req, res) => {
  fetch(
    `${Buffer.from(req.query.url, "base64").toString("ascii")}/${Buffer.from(
      req.query.key,
      "base64"
    ).toString("ascii")}`,
    {
      method: "DELETE",
    }
  )
    .then((resp) => resp.text())
    .then((data) => {
      res.status(200);
      res.send(data);
    })
    .catch((err) => {
      res.status(500);
      res.send(err);
    });
});

app.get("/db/lst", (req, res) => {
  fetch(
    `${Buffer.from(req.query.url, "base64").toString(
      "ascii"
    )}?encode=true&prefix=${encodeURIComponent(
      Buffer.from(req.query.pfx, "base64").toString("ascii")
    )}`
  )
    .then((resp) => resp.text())
    .then((data) => {
      res.status(200);
      res.send(data);
    })
    .catch((err) => {
      res.status(500);
      res.send(err);
    });
});

app.listen(3000);
