import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { generateTokens, hashPassword, comparePassword } from '../utils/authUtils.js';
import { logAudit } from '../utils/auditUtils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, designation, department } =
      req.validatedData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      designation,
      department,
      isActive: true,
      isVerified: false,
    });

    await user.save();

    // Log audit
    await logAudit({
      actionType: 'CREATE',
      entityType: 'USER',
      entityId: user._id,
      userId: user._id,
      userRole: role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `User registered: ${email}`,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log audit
    await logAudit({
      actionType: 'LOGIN',
      entityType: 'USER',
      entityId: user._id,
      userId: user._id,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: `User logged in: ${email}`,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        designation: user.designation,
        department: user.department,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const decoded = verifyRefreshToken(token);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.role
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If driver, include driver profile
    let driverProfile = null;
    if (user.role === 'DRIVER') {
      driverProfile = await Driver.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        driverProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, designation, department, profileImage } =
      req.validatedData;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldValues = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      designation: user.designation,
      department: user.department,
    };

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    // Log audit
    await logAudit({
      actionType: 'UPDATE',
      entityType: 'USER',
      entityId: user._id,
      userId: req.user.userId,
      userRole: req.user.role,
      oldValue: oldValues,
      newValue: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        designation: user.designation,
        department: user.department,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: 'User profile updated',
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    // Log audit
    await logAudit({
      actionType: 'LOGOUT',
      entityType: 'USER',
      entityId: req.user.userId,
      userId: req.user.userId,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      changeDescription: 'User logged out',
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};
