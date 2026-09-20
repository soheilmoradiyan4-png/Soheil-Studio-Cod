const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");
const {
    notifyAdmins,
    formatCooperationRequest
} = require("../services/bale");



// =========================================
// Create Cooperation Request
// =========================================

router.post("/", async (req, res) => {

    const {
        name,
        phone,
        email,
        age,
        skills,
        cooperationType,
        description
    } = req.body;


    // =====================================
    // Validation
    // =====================================

    if (
        !name ||
        !phone ||
        !email ||
        !age ||
        !skills ||
        !cooperationType ||
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
        .from("cooperation_requests")
        .insert([
            {
                name,
                phone,
                email,
                age,
                skills,
                cooperationType,
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
            message: "خطا در ذخیره درخواست همکاری."
        });

    }


    // =====================================
    // Success
    // =====================================

    console.log("=================================");
    console.log("✅ New Cooperation Request Saved");
    console.log("=================================");

    console.log(data);

    console.log("=================================");


    // =====================================
    // Notify Admins on Bale
    // (بدون await: خطای بله نباید روی پاسخ کاربر اثر بگذارد)
    // =====================================

    notifyAdmins(
        formatCooperationRequest({
            id: data && data[0] ? data[0].id : null,
            name,
            phone,
            email,
            age,
            skills,
            cooperationType,
            description
        })
    );


    res.json({
        success: true,
        message: "درخواست همکاری با موفقیت ثبت شد."
    });

});


module.exports = router;