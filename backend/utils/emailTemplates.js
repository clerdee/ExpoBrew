const generateOtpEmail = (otp) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF5F0; padding: 50px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 20px; box-shadow: 0 4px 15px rgba(111, 78, 55, 0.1);">
        
        <h1 style="color: #4A3B32; font-size: 28px; margin-bottom: 10px; margin-top: 0;">
          Welcome to Brew! ☕️
        </h1>
        
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We are so excited to have you join us. To complete your registration and start earning rewards, please enter the verification code below in your app:
        </p>

        <div style="background-color: #EBE1D7; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
          <h2 style="color: #6F4E37; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">
            ${otp}
          </h2>
        </div>

        <p style="color: #888888; font-size: 14px; margin-bottom: 30px;">
          This code will expire in 10 minutes. If you did not request this, please safely ignore this email.
        </p>

        <hr style="border: none; border-top: 2px dashed #EBE1D7; margin: 0 0 20px 0;" />
        <p style="color: #bbbbbb; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} ExpoBrew. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

module.exports = { generateOtpEmail };