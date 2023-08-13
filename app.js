
// Importing the modules required for express.js
const express = require("express")
const app = express()

// Importing a module required to process data sent in HTTP request body
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }))

// Importing a module required to interact with mysql database
const mysql = require("mysql")

// Importing a module used to upload file to a folder from HTTP request body
const upload = require("express-fileupload")
app.use(upload())

// set the view engine to ejs
app.set("view engine", "ejs")

// Importing a module used to specify path of a file
const path = require("path")

// Importing a module used to execute py files from node.js
const { PythonShell } = require("python-shell")

// Telling app.js to use static files from below folder using express framework
app.use('/public', express.static('public'))

// Python files path
var options = {
    scriptPath: __dirname
}

// Importing a module to encode the user password
const crypto = require('crypto')

// Writing a function to encode the user entered password
function encodePassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}




// To display signin.html as starting page on screen when server starts to run (Get request of signin.html)
app.get("/", function (req, res) {

    // Sending signin.html page to be displayed on screen 
    res.sendFile(__dirname + "/signin.html")

})

// Processing main.py file on clicking login button of signin.html (Post request of signin.html)
app.post("/", function (req, res) {

    PythonShell.run("main.py", options, function (err, result) {

        if (result[0] === "Invalid") {
            // Sending the message to alter.ejs file
            res.render("alert", { message: "!!! Face not Recognized" })
        }
        else {
            var sql = "select * from user_data where Email = ?"
            var values = [result[0]]

            connection.query(sql, values, function (err, r) {
                if (err) {
                    throw err
                }
                else {
                    var name = r[0].Name
                    res.render("authentication", { message: name })
                }
            })
        }
    })

})




// Connecting with mysql database
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "face_recognition"
})

// Checking whether connected successfully or not
connection.connect(function (err) {
    if (err) {
        throw err
    }
})




// Redirecting to signup.html when register link on login page is clicked (Get request of signup.html)
app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
})

// Saving user data to database after clicking register button on signup.html page (Post request of signup.html)
app.post("/signup", function (req, res) {

    // Storing user input into variables
    var name = req.body.name
    var email = req.body.email
    var dob = req.body.dob
    var password = encodePassword(req.body.password)  // Encoding the user entered password to store it in db
    var security = req.body.security
    var answer = req.body.answer

    // Inserting user data into the user_data table
    var sql = "insert into user_data values(?,?,?,?,?,?)"
    values = [name, email, dob, password, security, answer]
    connection.query(sql, values, function (err, results, fields) {
        if (err) {
            // Sending the Failed message to alert.ejs
            res.render("alert", { message: "!!! User with entered Email Address already exists" })
        }
        else {
            // Processing file input only if there is no error produced by Database
            if (req.files) {

                // Storing file input into variable
                var file = req.files.file
                file_name = file.name                // Extracting name of file
                ext = path.extname(file_name)        // Extracting extension of the uploaded file
                file.name = email + ext              // Renaming the file
                file_name = file.name                // Storing new name of file

                //Storing image of user into faces folder
                file.mv('faces/' + file_name, function (err) {
                    if (err) {
                        console.log(err)
                    }
                })
            }

            // Python files path
            var options = {
                scriptPath: __dirname,
                args: [email]
            }

            PythonShell.run("encodegenerator.py", options, function (err, result) {

                // Sending the Success message to alert.ejs
                res.render("alert", { message: "!!! Registered Successfully" })

            })

        }
    })
})




// Processing authentication.html file after clicking submit button of authentication.html (Post request of authentication.html)
app.post("/authentication", function (req, res) {

    var email = req.body.email
    var password = encodePassword(req.body.password)  // Encoding the user entered password

    var sql = "select * from user_data where Email = ?"
    var values = [email]

    connection.query(sql, values, function (err, result) {
        if (err) {
            throw err
        }
        if (result.length > 0) {
            // Email Address exists in Database
            var db_password = result[0].Password
            var email = result[0].Email
            var name = result[0].Name
            if (password === db_password) {
                // Password matched
                res.render("home", { message1: email, message2: name })
            }
            else {
                // Password not matched
                res.render("alert", { message: "!!! Incorrect Password" })
            }
        }
        else {
            // Email Address do not exist in Database
            res.render("alert", { message: "!!! Incorrect Email Address" })
        }
    });
})




// Get request for site_construction.html page
app.get("/reset", function (req, res) {
    res.sendFile(__dirname + "/reset_password.html")
})

// Processing reset_security.html after clicking Submit button (Post request of reset_security.html)
app.post("/reset", function (req, res) {

    // Storing user input into variables
    var email = req.body.email
    var security = req.body.security
    var answer = req.body.answer
    var password = encodePassword(req.body.password)  // Encoding the user entered password to store it in db

    var sql = "select * from user_data where Email = ?"
    var values = [email]

    connection.query(sql, values, function (err, result) {
        if (err) {
            throw err
        }
        if (result.length > 0) {
            // Email Address exists in Database
            var db_security = result[0].Security
            var db_answer = result[0].Answer

            if (security === db_security && answer === db_answer) {

                // Updating password in Database
                var sql = "Update user_data set Password = ? where Email = ?"
                var values = [password, email]

                connection.query(sql, values, function (err, result) {
                    if (err) {
                        throw err
                    }
                    res.render("alert", { message: "!!! Password changed Successfully" })
                })
            }
            else {
                res.render("alert", { message: "!!! Incorrect Security Question or Answer" })
            }
        }
        else {
            // Email Address do not exist in Database
            res.render("alert", { message: "!!! Incorrect Email Address" })
        }
    })
})




// Get request for site_construction.html page
app.get("/site_construction", function (req, res) {
    res.sendFile(__dirname + "/site_construction.html")
})




// Making server to run on port 3000
app.listen(3000, function () {
    console.log("Server is running on port 3000")
})