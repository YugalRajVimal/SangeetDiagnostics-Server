import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

// Proper CORS configuration
const allowedOrigins = [
  "https://sangeetdiagnostics.com",
  "https://www.sangeetdiagnostics.com",
  "http://localhost:3000"
];

// Use dynamic function for origin for more robust handling
server.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error("Not allowed by CORS: " + origin),
          false
        );
      }
    },
    credentials: true, // Support cookies/auth if needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  })
);

// Optionally, handle preflight requests explicitly 
server.options("*", cors());


server.post("/send-mail", (req, res) => {
  // Collect form data
  const { name, email, phone, service, message } = req.body;

  // Sangeet Diagnostics brand colors
  const mainColor = "#0fa3a3";
  const accentColor = "#0f3d3e";

  // Admin notification email - Sangeet Diagnostics branding
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #e6f6f6; padding: 20px;">
      <div style="max-width: 620px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,163,163,0.13);">
        <div style="background: linear-gradient(90deg, ${mainColor} 75%, ${accentColor} 100%); padding: 18px; text-align: center; color: #fff;">
          <span style="display: block; font-size: 1.7rem; font-weight: bold; letter-spacing: 1.5px;">DR. SANGEET DIAGNOSTICS</span>
          <div style="margin-top: 8px; font-size: 1.08rem; font-weight: 500;">Prayas Hamara, Vishwash Aapka</div>
        </div>
        <div style="padding: 26px 22px 18px 22px; color: #222b38;">
          <p style="margin-bottom:18px; font-size: 1.17rem; color: ${mainColor}; font-weight: 600;">🧪 New Service/Enquiry Received</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6; font-weight:600;">Name</td>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6;">${name || ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6; font-weight:600;">Email</td>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6;">${email || ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6; font-weight:600;">Phone</td>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6;">${phone || ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6; font-weight:600;">Selected Service</td>
              <td style="padding: 8px 8px; border-bottom: 1px solid #e6f6f6;">${service || "--"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 8px; font-weight:600;">Message/Enquiry</td>
              <td style="padding: 8px 8px;">${message || ""}</td>
            </tr>
          </table>
        </div>
        <div style="background: #e6f6f6; padding: 15px; text-align: center; font-size: 13px; color: #222;">
          Sent from Dr. Sangeet Diagnostics, Shakarpur, Delhi<br/>
          <a href="https://goo.gl/maps/CB9ZGHk9GEtaK6FV6" style="color:#0fa3a3; text-decoration:underline;">D-30, Opp. Jain Mandir, Madhuban Rd, Delhi 110092</a>
        </div>
        <div style="padding:8px 18px 19px 18px; color:#445; text-align:center; font-size:12px;">
          Phone/WhatsApp: <a href="tel:7065070650" style="color:#0fa3a3;text-decoration:underline;">70650 70650</a> | Email: <a href="mailto:enquiry.drsangeetdiagnostics@gmail.com" style="color:#0fa3a3;">enquiry.drsangeetdiagnostics@gmail.com</a>
        </div>
      </div>
    </div>
  `;

  // User confirmation email - Sangeet Diagnostics branding & info
  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #e6f6f6; padding: 20px;">
      <div style="max-width: 620px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,163,163,0.14);">
        <div style="background: linear-gradient(90deg, ${mainColor} 80%, ${accentColor} 100%); padding: 16px; text-align: center; color: #fff;">
          <span style="font-size: 1.35rem; font-weight: bold; letter-spacing:1.2px;">DR. SANGEET DIAGNOSTICS</span>
        </div>
        <div style="padding: 22px 20px 20px 20px; color: #13404b;">
          <p>Dear ${name || "User"},</p>
          <p>
            Thank you for contacting <strong>Dr. Sangeet Diagnostics</strong>!<br/>
            Your enquiry has been received. Our team will get in touch with you soon.
          </p>
          <p style="margin: 7px 0 12px 0; color:${mainColor}; font-weight:600;">Our Key Services:</p>
          <ul style="margin: 0 0 10px 18px; padding: 0; color: #183d3e; font-size: 15px; line-height: 1.7;">
            <li>Pathology – Hematology, Biochemistry, Hormones, Vitamins, Infection markers, Preventive profiles & more</li>
            <li>Radiology & Imaging – Digital X-Ray, Ultrasound (USG), Doppler, Pregnancy scans</li>
            <li>ECG, FNAC, Biopsy, Echo, Home Sample Collection</li>
            <li>Image-guided procedures (for doctors/hospitals)</li>
            <li>Consultation from top pathologists and radiologists</li>
          </ul>
          <div style="margin: 18px 0;">
            <strong>Your Details:</strong>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top:8px;">
              <tr>
                <td style="padding: 6px 0; font-weight:bold;">Name</td>
                <td style="padding: 6px 0;">${name || ""}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight:bold;">Service</td>
                <td style="padding: 6px 0;">${service || "--"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight:bold;">Phone</td>
                <td style="padding: 6px 0;">${phone || ""}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight:bold;">Email</td>
                <td style="padding: 6px 0;">${email || ""}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight:bold;">Message</td>
                <td style="padding: 6px 0;">${message || "--"}</td>
              </tr>
            </table>
          </div>
          <p>For location, see map below or <a style="color:${mainColor};font-weight:600;" href="https://goo.gl/maps/CB9ZGHk9GEtaK6FV6" target="_blank">Google Maps</a>.</p>
          <p style="margin-top: 18px;"><strong>Dr. Sangeet Diagnostics<br />D-30, Shakarpur, Delhi 110092</strong></p>
        </div>
        <div style="background: ${mainColor}; padding: 14px; text-align: center; font-size: 13px; color: #fff;">
          Phone/WhatsApp: <a href="tel:7065070650" style="color:#fff;text-decoration:underline;">70650 70650</a>
          <br/>
          Mon - Sat: 8:00 AM - 8:00 PM &nbsp;|&nbsp; Sun: 8:00 AM - 12:00 PM
        </div>
        <div style="background:#f0f7f9; padding:11px 10px; text-align: center; font-size: 12px; color: #678;">
          This is an automated message from Dr. Sangeet Diagnostics. Please do not reply directly.
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.Mailer_User,
    to: process.env.Send_Mailer_User,
    subject: `New Sangeet Diagnostics Enquiry from ${name || "Website User"}`,
    html: htmlContent,
  };

  const mailOptions2 = {
    from: process.env.Mailer_User,
    to: email,
    subject: `Thank you for contacting Dr. Sangeet Diagnostics, ${name || ""}`,
    html: confirmationHtml,
  };

  transporter.sendMail(mailOptions, error => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error sending admin notification.");
    }
    transporter.sendMail(mailOptions2, error => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error sending confirmation to user.");
      }
      res
        .status(200)
        .send(
          "Your enquiry has been submitted to Dr. Sangeet Diagnostics, and a confirmation has been sent to your email."
        );
    });
  });
});

server.listen(8080, () => {
  console.log("Sangeet Diagnostics server is running on port 8080");
});
