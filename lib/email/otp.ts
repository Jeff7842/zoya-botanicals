import { resend } from "@/lib/resend";

export async function sendLoginOtpEmail(params: {
  to: string;
  firstName?: string | null;
  otpCode: string;
}) {
  const { to, firstName, otpCode } = params;

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Your ZOYA login verification code",
    html: `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zoya verification code</title>
  </head>
  <body style="margin:0;padding:0;background:#f9f9fc;font-family:Arial,sans-serif;color:#1a1c1e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9f9fc;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              max-width:620px;
              background:#ffffff;
              border:1px solid rgba(122,117,132,0.15);
              border-radius:32px;
              overflow:hidden;
              box-shadow:0 24px 60px rgba(52,5,141,0.10);
            "
          >
            <tr>
              <td
                align="center"
                style="
                  padding:28px 28px 18px;
                  background:linear-gradient(135deg,#34058d 0%,#4b2ba3 100%);
                "
              >
                <div
                  style="
                    display:inline-block;
                    padding:10px 16px;
                    border-radius:999px;
                    background:#fcdf46;
                    color:#5b4b00;
                    font-size:11px;
                    font-weight:800;
                    letter-spacing:0.18em;
                    text-transform:uppercase;
                    box-shadow:0 12px 30px rgba(252,223,70,0.24);
                  "
                >
                  Secure verification
                </div>

                <div style="height:22px;"></div>

                <div
                  style="
                    width:82px;
                    height:82px;
                    border-radius:0px;
                    background:transparent;
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                  margin-right:-15px;
                    border:none;
                  "
                >
                  <img src="https://rsvoodcjjskxuinlpzms.supabase.co/storage/v1/object/public/Logos/Asset%206@2x.png" alt="" style="display:flex; margin-right:-15px; width:auto; height:80px; justify-self:center; align-self:middle; align-items:center;">
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 32px 18px;text-align:center;">
                <h1
                  style="
                    margin:0;
                    font-size:38px;
                    line-height:1.02;
                    font-weight:800;
                    letter-spacing:-0.04em;
                    color:#34058d;
                  "
                >
                  Let’s log you in
                </h1>

                <p
                  style="
                    margin:18px auto 0;
                    max-width:470px;
                    font-size:17px;
                    line-height:1.8;
                    color:#5f6270;
                  "
                >
                  Hello ${firstName ?? "Curator"}, use the verification code below to finish signing in to your
                  <strong style="color:#34058d;">ZOYA</strong> account securely.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 32px 0;text-align:center;">
                <p
                  style="
                    margin:0 0 12px;
                    font-size:12px;
                    font-weight:800;
                    letter-spacing:0.20em;
                    text-transform:uppercase;
                    color:#8a7400;
                  "
                >
                  Verification code
                </p>

                <div
                  style="
                    display:block;
                    margin:0 auto;
                    max-width:360px;
                    background:#f3f3f6;
                    border:1px solid rgba(122,117,132,0.15);
                    border-radius:22px;
                    padding:20px 18px;
                    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.4);
                  "
                >
                  <div
                    style="
                      font-size:42px;
                      line-height:1;
                      font-weight:800;
                      letter-spacing:14px;
                      color:#34058d;
                      text-align:center;
                    "
                  >
                    ${otpCode}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 0;text-align:center;">
                <div
                  style="
                    display:inline-block;
                    background:rgba(252,223,70,0.18);
                    color:#5b4b00;
                    border-radius:999px;
                    padding:10px 16px;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  This code expires in 5 minutes
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px 0;text-align:center;">
                <p
                  style="
                    margin:0 auto;
                    max-width:430px;
                    font-size:15px;
                    line-height:1.8;
                    color:#5f6270;
                  "
                >
                  If you did not request this email, you can safely ignore it. No changes will be made to your account.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 32px 0;">
                <div style="height:1px;background:rgba(122,117,132,0.15);"></div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 32px;text-align:center;">
                <p
                  style="
                    margin:0;
                    font-size:13px;
                    line-height:1.8;
                    color:#8d90a0;
                  "
                >
                  Built for secure and seamless botanical account access.
                </p>

                <p
                  style="
                    margin:14px 0 0;
                    font-size:12px;
                    line-height:1.8;
                    color:#a0a3b1;
                  "
                >
                  © ${new Date().getFullYear()} ZOYA Botanicals. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });
}