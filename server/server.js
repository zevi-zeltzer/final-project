const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const port = 3001;


app.listen(port, () => {
    console.log("Server is running on port 3000");
});