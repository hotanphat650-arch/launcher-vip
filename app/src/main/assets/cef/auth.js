/* ==========================================================
   AUTH.JS - HỆ THỐNG XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ CEF (CẬP NHẬT)
   ========================================================== */

let currentAuthMode = "login"; 

/**
 * Hiển thị màn hình và cấu hình các trường nhập liệu
 */
function showAuthScreen(eventData) {
    const data = JSON.parse(eventData);
    currentAuthMode = data[0]; 
    const playerName = data[1]; 

    // 1. Mở khung Auth & Điền tên
    if (document.getElementById('auth-container')) document.getElementById('auth-container').classList.remove('hidden');
    if (document.getElementById('auth-username')) document.getElementById('auth-username').value = playerName;
    if (document.getElementById('auth-password')) document.getElementById('auth-password').value = "";

    // Reset lại 2 ô mới về trống
    if (document.getElementById('auth-gender')) document.getElementById('auth-gender').value = "";
    if (document.getElementById('auth-birthdate')) document.getElementById('auth-birthdate').value = "";

    // 2. Tìm tất cả các trường chỉ dành cho Đăng Ký (Giới tính, Ngày sinh)
    const regFields = document.querySelectorAll('.reg-field');

    const title = document.getElementById('auth-title');
    const welcome = document.getElementById('auth-welcome');
    const btnSubmit = document.getElementById('btn-auth-submit');

    // 3. Phân tách giao diện Đăng nhập / Đăng ký
    if (currentAuthMode === "login") {
        if (title) title.innerText = "ĐĂNG NHẬP";
        if (welcome) welcome.innerText = "Tài khoản đã tồn tại, vui lòng đăng nhập.";
        if (btnSubmit) {
            btnSubmit.innerText = "ĐĂNG NHẬP VÀO GAME";
            btnSubmit.style.background = "#4caf50";
        }
        // Ẩn các trường đăng ký đi
        regFields.forEach(field => field.classList.add('hidden'));
    } else {
        if (title) title.innerText = "ĐĂNG KÝ TÀI KHOẢN";
        if (welcome) welcome.innerText = "Chào mừng người mới! Vui lòng điền thông tin.";
        if (btnSubmit) {
            btnSubmit.innerText = "HOÀN TẤT ĐĂNG KÝ";
            btnSubmit.style.background = "#2196F3";
        }
        // Hiện các trường đăng ký lên
        regFields.forEach(field => field.classList.remove('hidden'));
    }
}

function hideAuthScreen() {
    if (document.getElementById('auth-container')) document.getElementById('auth-container').classList.add('hidden');
}

/**
 * Gửi dữ liệu về Server Pawn
 */
function submitAuth() {
    const password = document.getElementById('auth-password').value;
    
    if (password.length < 6) {
        if (typeof createToast === "function") createToast("warning", "CẢNH BÁO", "Mật khẩu phải có ít nhất 6 ký tự!", 4000);
        return;
    }

    let gender = 0;
    let birthdate = "0000-00-00";

    // Nếu đang ở chế độ Đăng ký, tiến hành kiểm tra Giới tính & Ngày sinh
    if (currentAuthMode === "register") {
        gender = document.getElementById('auth-gender').value;
        birthdate = document.getElementById('auth-birthdate').value;

        if (!gender) {
            if (typeof createToast === "function") createToast("warning", "THÔNG BÁO", "Vui lòng chọn Giới tính của bạn!", 4000);
            return;
        }
        if (!birthdate) {
            if (typeof createToast === "function") createToast("warning", "THÔNG BÁO", "Vui lòng chọn Ngày tháng năm sinh!", 4000);
            return;
        }
    }

    // Gửi sự kiện về Pawn với cấu trúc mảng đầy đủ 4 tham số
    // [ "mode", "password", giới_tính_số, "ngày_sinh_chuỗi" ]
    Cef.sendEvent("auth_receive", JSON.stringify([currentAuthMode, password, parseInt(gender), birthdate]));
}

Cef.registerEventCallback("auth_show", "showAuthScreen");
Cef.registerEventCallback("auth_hide", "hideAuthScreen");
