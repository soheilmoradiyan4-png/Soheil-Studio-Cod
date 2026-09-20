const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");
const {
    notifyAdmins,
    formatProjectRequest
} = require("../services/bale");



// =========================================
// Create Project Request
// =========================================

router.post("/", async (req, res) => {

    const {
        name,
        phone,
        email,
        budget,
        description
    } = req.body;


    // =====================================
    // Validation
    // =====================================

    if (
        !name ||
        !phone ||
        !email ||
        !budget ||
        !description
    ) {

        return res.status(400).json({
            success: false,
            message: "لطفاً همه فیلدها را کامل کنید."
        });

    }


    // =====================================
    // Save to Supabase
    // =====================================

    const { data, error } = await supabase
        .from("project_requests")
        .insert([
            {
                name,
                phone,
                email,
                budget,
                description
            }
        ])
        .select();


    // =====================================
    // Database Error
    // =====================================

    if (error) {

        console.error(
            "❌ Supabase Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "خطا در ذخیره درخواست پروژه."
        });

    }


    // =====================================
    // Success
    // =====================================

    console.log("=================================");
    console.log("✅ New Project Request Saved");
    console.log("=================================");

    console.log(data);

    console.log("=================================");


    // =====================================
    // Notify Admins on Bale
    // (بدون await: خطای بله نباید روی پاسخ کاربر اثر بگذارد)
    // =====================================

    notifyAdmins(
        formatProjectRequest({
            id: data && data[0] ? data[0].id : null,
            name,
            phone,
            email,
            budget,
            description
        })
    );


    res.json({
        success: true,
        message: "درخواست پروژه با موفقیت ثبت شد."
    });

});


module.exports = router;