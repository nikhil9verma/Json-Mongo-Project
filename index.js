const express = require("express");
const users = require("./MOCK_DATA.json");
const app = express();
const fs = require("fs");
const mongoose = require("mongoose");

// Connecting Mongoose
mongoose
  .connect("mongodb://127.0.0.1:27017/youtube-app-1")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo Error", err));

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  jobTitle: {
    type: String,
  },
  gender: {
    type: String,
  },
});
const User = mongoose.model("user", userSchema);

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add this line to handle JSON requests

app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>`;
  res.send(html);
});

// REST API
app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  return res.json(user);
});

app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.firstName ||
    !body.lastName ||
    !body.email ||
    !body.gender ||
    !body.jobTitle
  ) {
    return res.status(400).json({ msg: "All fields are required." });
  }
  try {
    const result = await User.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      gender: body.gender,
      jobTitle: body.jobTitle,
    });
    console.log("result", result);
    return res.status(201).json({ msg: "Success", user: result });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
});

app.patch("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((el) => el.id === id);
  const index = users.indexOf(user);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  const newUser = Object.assign(users[index], req.body);
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update user" });
    }
    res.status(200).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete user" });
      }
      return res.status(204).send();
    });
  } else {
    return res.status(404).json({ error: "User not found" });
  }
});

app.listen(9000, () => console.log(`server started!`));
