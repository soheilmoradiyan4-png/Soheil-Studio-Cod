const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");
const supabaseAdmin = require("../config/supabaseAdmin");


// ========================================
// بررسی Super Admin
// ========================================

async function requireSuperAdmin(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "ورود الزامی است."
        });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
        data: { user },
        error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({
            success: false,
            message: "نشست کاربر معتبر نیست."
        });
    }


    // دریافت نقش مدیر
    const {
        data: admin,
        error: adminError
    } = await supabase
        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .single();


    if (adminError || !admin) {
        return res.status(403).json({
            success: false,
            message: "حساب شما مدیر نیست."
        });
    }


    // فقط Super Admin
    if (admin.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message:
                "فقط Super Admin می‌تواند مدیر جدید بسازد."
        });
    }


    req.user = user;

    next();
}


// ========================================
// ساخت مدیر جدید
// ========================================

router.post(
    "/create",
    requireSuperAdmin,
    async (req, res) => {

        try {

            const {
                email,
                password,
                role
            } = req.body;


            // بررسی فیلدها
            if (!email || !password || !role) {

                return res.status(400).json({
                    success: false,
                    message:
                        "لطفاً همه فیلدها را کامل کنید."
                });

            }


            // نقش‌های مجاز
            const allowedRoles = [
                "super_admin",
                "project_manager",
                "cooperation_manager",
                "content_manager"
            ];


            if (!allowedRoles.includes(role)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "نقش مدیر نامعتبر است."
                });

            }


            // ساخت User در Supabase Auth
            const {
                data: userData,
                error: userError
            } =
                await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true
                });


            if (userError) {

                console.error(
                    "Auth Error:",
                    userError
                );

                return res.status(400).json({
                    success: false,
                    message: userError.message
                });

            }


            const userId =
                userData.user.id;


            // ثبت مدیر در جدول admins
            const {
                data: adminData,
                error: adminError
            } =
                await supabaseAdmin
                    .from("admins")
                    .insert([
                        {
                            user_id: userId,
                            role: role
                        }
                    ])
                    .select();


            if (adminError) {

                console.error(
                    "Admin Table Error:",
                    adminError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "کاربر ساخته شد اما ثبت مدیر ناموفق بود."
                });

            }


            console.log(
                "✅ New Admin Created:",
                email
            );


            res.json({
                success: true,
                message:
                    "مدیر جدید با موفقیت ساخته شد.",
                admin: adminData
            });


        } catch (error) {

            console.error(
                "Server Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "خطای داخلی سرور."
            });

        }

    }
);


module.exports = router;