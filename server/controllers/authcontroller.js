import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import axios from "axios";
 
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  
    const newUser = await userModel.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // changed strict -> lax for dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    const otp = String(Math.floor(Math.random() * 900000 + 100000));

    newUser.verifyOtp = otp;
    newUser.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await newUser.save();

  
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "Hire-a-Helper", email: process.env.SENDER_EMAIL },
          to: [{ email: newUser.email }],
          subject: "WELCOME TO Farmmy",
          textContent: `Your OTP for email verification is ${otp}. It is valid for 24 hours.`,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Brevo Response:", response.data);
    } catch (mailError) {
      console.error("Brevo Email Error:", mailError.response?.data || mailError.message);
    }

    return res.json({
      success: true,
      message: "Registration successful! OTP has been sent to your email.",
      userId: newUser._id, 
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.json({ success: false, message: error.message });
  }
};
 

export const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.json({success: false, message: "Please fill all the fields"});
  }

  try {
    const user = await userModel.findOne({ email });
    if(!user) {
        return res.json({success: false, message: "User does not exist"});
    }

    const isMatch = await bcrypt.compare(password, user.password);



    if(!isMatch) {
        return res.json({success: false, message: "Invalid credentials"});
    }

    if(!user.isVerified) {
      return res.json({success: false, message: "Please verify your email to login"});
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({success: true});
  }
  catch(error) {
    return res.json({success: false, message: error.message});
  }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({success: true,message: "Logged out successfully"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (user.isVerified) {
      return res.json({success: false, message: "User is already verified"});
    }

    const otp = String(Math.floor(Math.random()*900000 + 100000));


    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24*60*60*1000; 

    await user.save();

    await axios.post("https://api.brevo.com/v3/smtp/email", {
    sender: { name: "Hire-a-Helper", email: process.env.SENDER_EMAIL },
    to: [{ email:user.email }],
    subject: "WELCOME TO Farmmy",
     textContent: `Your OTP for email verification is ${otp}. It is valid for 24 hours.`,
  }, {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json"
    }
  });
      res.json({success: true, message: "OTP sent to your email"});

  } catch (error) {
    res.json({success: false, message: error.message});
  }
}

export const verifyEmail = async (req, res) => {
  try{
    const userId = req.user.id;
    const { otp } = req.body;
    if(!userId || !otp) {
      return res.json({success: false, message: "Please provide all the fields"});
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.log(user)
      return res.json({success: false, message: "User not found"}); 
    }

    if (user.verifyOtp !== otp || user.verifyOtp === '') {
      return res.json({success: false, message: "Invalid OTP"});
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({success: false, message: "OTP has expired"});
    }

    user.isVerified = true;

    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({success: true, message: "Email verified successfully"});


  } catch (error) {
    return res.json({success: false, message: error.message});
  }



}


export const isAuthenticated = (req, res) => {
  try {
    return res.json({success: true, userId: req.user.id});
  } catch (error) {
    return res.json({success: false, message: error.message});
  }
}

export const sendResetOtp = async (req, res) => {
  const {email} = req.body;
  if(!email) {
    return res.json({success: false, message: "Please provide email"});
  }

  try {

    const user = await userModel.findOne({email});

    if (!user) {
      return res.json({success: false, message: "User not found"});
    }

    const otp = String(Math.floor(Math.random()*900000 + 100000));


    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15*60*1000; 

    await user.save();

    await axios.post("https://api.brevo.com/v3/smtp/email", {
    sender: { name: "Farmmy",email: process.env.SENDER_EMAIL },
    to: [{ email:user.email }],
    subject: "WELCOME TO Farmmy",
    textContent: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
  }, {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json"
    }
  });
      res.json({success: true, message: "OTP sent to your email"});

    


  } catch (error) {
    return res.json({success: false, message: error.message});
  }
}

export const resetPassword = async (req, res) => {
  const {email, otp, newpassword} = req.body;
  if(!email || !otp || !newpassword) {
    return res.json({success: false, message: "Please provide all fields"});
  }

  try {

    const user = await userModel.findOne({email});

    if (!user || user.resetOtp !== otp) {
      return res.json({success: false, message: "User,email,new password are required"});
    }

      if(user.resetOtp !== otp || user.resetOtp === '') {
        return res.json({success: false, message: "Invalid OTP"});
      }

      if(user.resetOtpExpireAt < Date.now()) {
        return res.json({success: false, message: "OTP has expired"});
      }

      const hashedPassword = await bcrypt.hash(newpassword, 10);
      user.password = hashedPassword;
      user.resetOtp = '';
      user.resetOtpExpireAt = 0;
      await user.save();

      return res.json({success: true, message: "Password reset successfully"});
      
    } catch (error) {
      return res.json({success: false, message: error.message});
      
    }
}



