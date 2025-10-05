import bcrypt from 'bcrypt'
import Admin from '../models/userModel.js'
import genToken from '../utils/genToken.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer'





export const signin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Save new user
    const admin = new Admin({
      name,
      email,
      password: hashPassword,
    });

    await admin.save();

    // Generate JWT
    const token = genToken(admin._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      message: "User registered successfully",
    });
  } catch (e) {
    console.error("Error occurred:", e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





// ---------------- RESET PASSWORD VIA EMAIL ----------------
export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) 
      return res.status(400).json({ success: false, message: 'Email required' });

    const admin = await Admin.findOne({ email });
    if (!admin) 
      return res.status(400).json({ success: false, message: 'Admin not found' });

    // Generate a 6-byte hex token
    const token = crypto.randomBytes(6).toString('hex');
    admin.resetPasswordToken = token;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await admin.save();

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS, // Make sure this has NO spaces
      }
    });

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/password-reset?token=${token}`;

    // Send email with detailed error catching
    try {
      await transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: admin.email,
        subject: 'Password Reset',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 10 minutes.</p>`
      });
    } catch (mailErr) {
      console.error("Nodemailer failed:", mailErr);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send email: " + mailErr.message 
      });
    }

    res.status(200).json({ success: true, message: 'Reset link has been sent to your email' });

  } catch (err) {
    console.error("RequestResetPassword error:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const admin = await Admin.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Invalid or Expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.resetPasswordToken = undefined
    admin.resetPasswordExpires = undefined

    await admin.save();

    res.status(200).json({ success: true, message: "Your password has been reset successfully" });
  } catch (e) {
    console.error("Reset error:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    // Find user
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Email not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
  
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    // Generate JWT
    const token = genToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      message: "Logged in successfully",
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};






