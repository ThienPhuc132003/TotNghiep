const nodemailer = require('nodemailer');

async function sendOtpEmail(toEmail, otp, username) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Thay bằng email của bạn
            pass: 'your-email-password'   // Thay bằng mật khẩu ứng dụng (App Password)
        }
    });

    let mailOptions = {
        from: '"GiaSuVLU" <your-email@gmail.com>',
        to: toEmail,
        subject: 'Mã xác thực OTP - GiaSuVLU',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2 style="color: #333;">Xác nhận đăng ký tài khoản</h2>
                <p style="font-size: 16px; color: #555;">Xin chào <strong>${username}</strong>,</p>
                <p style="font-size: 16px; color: #555;">Dưới đây là mã OTP của bạn để hoàn tất đăng ký tại <strong>GiaSuVLU</strong>:</p>
                <div style="font-size: 26px; font-weight: bold; letter-spacing: 10px; background-color: #f8f9fa; padding: 15px; display: inline-block; border-radius: 8px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #888;">Mã OTP này sẽ hết hạn sau <strong>20 phút</strong>.</p>
                <p style="font-size: 14px; color: #555;">
                    Mã này sẽ giúp bạn xác thực tài khoản email:<br>
                    <span style="color: #007bff; font-weight: bold;">${toEmail}</span>
                </p>
                <p style="font-size: 12px; color: #999;">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
            </div>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Gọi hàm gửi email với thông tin người dùng
sendOtpEmail("user@example.com", "123456", "Nguyễn Văn A");
