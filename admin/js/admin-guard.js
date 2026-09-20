// ========================================
// Admin Page Security Guard
// ========================================

async function protectAdminPage(requiredRole) {

    // بررسی Session
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    // اگر وارد نشده
    if (!session) {

        window.location.href = "login.html";

        return false;
    }


    // دریافت نقش مدیر
    const {
        data: admin,
        error
    } = await supabaseClient
        .from("admins")
        .select("role")
        .eq("user_id", session.user.id)
        .single();


    // اگر مدیر معتبر نبود
    if (error || !admin) {

        console.error(
            "❌ Admin access error:",
            error
        );

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

        return false;
    }


    console.log(
        "👤 User:",
        session.user.email
    );

    console.log(
        "👑 Role:",
        admin.role
    );

    console.log(
        "🔐 Required Role:",
        requiredRole
    );


    // ========================================
    // Super Admin به همه‌جا دسترسی دارد
    // ========================================

    if (admin.role === "super_admin") {

        console.log(
            "✅ Super Admin Access Granted"
        );

        return true;
    }


    // ========================================
    // بررسی دسترسی
    // ========================================

    if (admin.role !== requiredRole) {

        console.warn(
            "❌ Access Denied"
        );

        alert(
            "⛔ شما اجازه دسترسی به این صفحه را ندارید."
        );

        window.location.href =
            "dashboard.html";

        return false;
    }


    console.log(
        "✅ Access Granted"
    );

    return true;
}