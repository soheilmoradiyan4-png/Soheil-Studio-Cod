// =========================================
// Soheil Studio Coding
// Main JavaScript
// =========================================


// =========================================
// آدرس تابع ثبت درخواست‌ها (Supabase Edge Function)
// =========================================

const SUBMIT_REQUEST_URL =
    "https://dzqyfwhkxryxdlirffgm.supabase.co/functions/v1/submit-request";


document.addEventListener("DOMContentLoaded", () => {


    // =========================================
    // Mobile Menu
    // =========================================

    const menuButton =
        document.querySelector(".menu-button");

    const navigation =
        document.querySelector(".main-nav");


    if (menuButton && navigation) {

        menuButton.addEventListener("click", () => {

            navigation.classList.toggle("mobile-open");

        });

    }



    // =========================================
    // Project Form
    // =========================================

    const projectForm =
        document.querySelector("#project-form");


    if (projectForm) {

        projectForm.addEventListener("submit", async (event) => {

            event.preventDefault();


            const formData =
                new FormData(projectForm);


            const data = {

                type: "project",

                name: formData.get("name"),

                phone: formData.get("phone"),

                email: formData.get("email"),

                budget: formData.get("budget"),

                description: formData.get("description")

            };


            try {

                const response = await fetch(
                    SUBMIT_REQUEST_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );


                const result =
                    await response.json();


                if (result.success) {

                    alert(
                        "✅ درخواست پروژه با موفقیت ارسال شد."
                    );

                    projectForm.reset();

                } else {

                    alert(
                        "❌ " +
                        (
                            result.message ||
                            "ارسال درخواست ناموفق بود."
                        )
                    );

                }


            } catch (error) {

                console.error(error);

                alert(
                    "❌ اتصال به سرور برقرار نشد."
                );

            }

        });

    }

});
// =========================================
// Cooperation Form
// =========================================

const cooperationForm =
    document.querySelector("#cooperation-form");

if (cooperationForm) {

    cooperationForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const formData =
                new FormData(cooperationForm);

            const data = {
                type: "cooperation",
                name: formData.get("name"),
                phone: formData.get("phone"),
                email: formData.get("email"),
                age: formData.get("age"),
                skills: formData.get("skills"),
                cooperationType:
                    formData.get("cooperationType"),
                description:
                    formData.get("description")
            };


            try {

                const response = await fetch(
                    SUBMIT_REQUEST_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );


                const result =
                    await response.json();


                if (result.success) {

                    alert(
                        "✅ درخواست همکاری با موفقیت ثبت شد."
                    );

                    cooperationForm.reset();

                } else {

                    alert(
                        "❌ " +
                        (
                            result.message ||
                            "ارسال درخواست همکاری ناموفق بود."
                        )
                    );

                }


            } catch (error) {

                console.error(error);

                alert(
                    "❌ اتصال به سرور برقرار نشد."
                );

            }

        }
    );

}