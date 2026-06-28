require("dotenv").config();     //dotenv is a Node.js package that loads environment variables from a .env file into your application.

const express = require("express");
/* Express (or Express.js) is a popular web framework for Node.js 
 that makes it easy to build web servers, APIs, and backend applications. */
const cors = require("cors");       
/*CORS (Cross-Origin Resource Sharing) is a browser security mechanism that 
 controls whether a web page from one origin [protocol, domain, port] can access resources from a different origin. */

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const adminRoutes = require("./routes/adminRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const app = express();

app.use(cors());
app.use(express.json());


/* REST API --> Representational State Transfer Application Programming Interface.
    A REST API is a way for different software applications to communicate over HTTP using 
    standard operations like GET, POST, PUT, and DELETE.    */
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/prescriptions", prescriptionRoutes);




app.get("/", (req, res) => {
    res.json({
        message: "9MVisD API Running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

