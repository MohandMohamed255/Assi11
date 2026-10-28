export const emailTempled=(otp)=>{
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#4f46e5;padding:20px;text-align:center;color:#ffffff;font-size:22px;font-weight:bold;">
              Saraha App
            </td>
          </tr>
          <tr>
            <td style="padding:30px;color:#333333;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 20px;">Use the code below to confirm your email:</p>

              <div style="text-align:center;margin:25px 0;">
                <span style="display:inline-block;background:#eef2ff;color:#4f46e5;font-size:32px;font-weight:bold;letter-spacing:8px;padding:14px 28px;border-radius:8px;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 8px;">This code expires in <b>5 minutes</b>.</p>
              <p style="margin:0;color:#888888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:15px;text-align:center;color:#999999;font-size:12px;">
              © ${new Date().getFullYear()} Saraha App. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}