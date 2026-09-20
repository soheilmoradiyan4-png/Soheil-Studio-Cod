const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

console.log("SUPABASE URL:", process.env.SUPABASE_URL);
const express = require("express");
const cors = require("cors");

const adminRoutes =
    require("./routes/adminRoutes");
const app = express();

const PORT = process.env.PORT || 3000;



// =========================================
// Middleware
// =========================================
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({
    extended: true
}));

app.use("/api/admins", adminRoutes);
// =========================================
// Routes
// =========================================

const projectRoutes = require("./routes/projectRoutes");
const cooperationRoutes = require("./routes/cooperationRoutes");

app.use("/api/projects", projectRoutes);
app.use("/api/cooperation", cooperationRoutes);


// =========================================
// Test Route
// =========================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Soheil Studio Coding Backend is running 🚀"
    });

});


// =========================================
// Static Files (Frontend)
// سایت و پنل مدیریت از همین سرور سرو می‌شوند
// =========================================

const clientDir = path.join(__dirname, "../client");
const adminDir = path.join(__dirname, "../admin");

app.use("/admin", express.static(adminDir));
app.use("/client", express.static(clientDir));
app.use(express.static(clientDir));


// =========================================
// Start Server
// =========================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});