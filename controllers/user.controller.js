import { sendMail } from "../utils/mailer.js";
import { users } from "../models/user.model.js";

// Render Login Page
export const renderLoginPage = (req, res) => {
  res.render("login", { title: "Login" });
};

// Render Register Page
export const renderRegisterPage = (req, res) => {
  res.render("register", { title: "Register" });
};

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const timestamp = new Date().toLocaleString();

  if (users.some(u => u.username === username || u.email === email)) {
    return res.send("Username or Email already exists!");
  }

  users.push({ username, email, password });

  // ✅ Send Welcome Email
  await sendMail(email, "Welcome to Online Bookstore",
    `Hello ${username},\n\nWelcome to Online Bookstore! 🎉\nWe're excited to have you here. You can start exploring our vast collection of books.\n\nRegistered on: ${timestamp}\n\nStay tuned for future updates, exclusive discounts, and new arrivals!\n\nHappy Reading!\n\n- Online Bookstore Team`
  );

  res.redirect("/users/login");
};

// Login User
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;
  const timestamp = new Date().toLocaleString();

  const user = users.find(u =>
    (u.username === identifier || u.email === identifier) && u.password === password
  );

  if (!user) {
    // ✅ Send Failed Login Attempt Alert
    await sendMail(identifier, "Failed Login Attempt",
      `Hello,\n\nThere was a failed login attempt using your credentials on ${timestamp}. If this wasn't you, please reset your password immediately.\n\n- Online Bookstore Team`
    );

    return res.send("Invalid credentials!");
  }

  req.session.user = user;

  // ✅ Send Login Notification Email
  await sendMail(user.email, "Login Alert",
    `Hello ${user.username},\n\nYou just logged into your Online Bookstore account on ${timestamp}.\nIf this wasn't you, please secure your account immediately.\n\n- Online Bookstore Team`
  );

  res.redirect("/");
};

// Logout User
export const logoutUser = async (req, res) => {
  const user = req.session.user;
  const timestamp = new Date().toLocaleString();

  if (user) {
    // ✅ Send Logout Notification
    await sendMail(user.email, "Logout Alert",
      `Hello ${user.username},\n\nYou have successfully logged out from Online Bookstore on ${timestamp}.\nSee you soon!\n\n- Online Bookstore Team`
    );
  }

  req.session.destroy(() => res.redirect("/"));
};

// ✅ Password Change Notification
export const changePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = users.find(u => u.email === email);
  const timestamp = new Date().toLocaleString();

  if (!user) {
    return res.send("User not found!");
  }

  user.password = newPassword;

  // ✅ Send Password Change Notification
  await sendMail(email, "Password Changed Successfully",
    `Hello ${user.username},\n\nYour password has been successfully updated on ${timestamp}.\nIf you didn't request this change, please contact support immediately.\n\n- Online Bookstore Team`
  );

  res.send("Password updated successfully!");
};
