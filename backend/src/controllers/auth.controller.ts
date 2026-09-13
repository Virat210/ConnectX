import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/token';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, name: alternateName, email, password } = req.body;
      const effectiveFullName = fullName || alternateName || 'ConnectX Member';

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          code: 'EMAIL_ALREADY_EXISTS',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const name = effectiveFullName.split(' ')[0] || 'Member';

      const user = await User.create({
        name,
        fullName: effectiveFullName,
        email: email.toLowerCase(),
        passwordHash,
      });

      const { accessToken, refreshToken } = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 3600 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      logger.info(`New user registered: ${user.email} (${user._id})`);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.profileImage,
            title: user.title,
            organization: user.organization,
            plan: user.plan,
            settings: user.settings,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      if (user.status === 'Blocked') {
        res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.',
          code: 'ACCOUNT_SUSPENDED',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      user.lastSeen = new Date();
      await user.save();

      const { accessToken, refreshToken } = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 3600 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      logger.info(`User logged in: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.profileImage,
            title: user.title,
            organization: user.organization,
            plan: user.plan,
            settings: user.settings,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    };
    res.clearCookie('access_token', clearOptions);
    res.clearCookie('refresh_token', clearOptions);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refresh_token;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required.',
          code: 'REFRESH_TOKEN_REQUIRED',
        });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      if (!user || user.status === 'Blocked') {
        res.status(401).json({
          success: false,
          message: 'User no longer active.',
          code: 'USER_INACTIVE',
        });
        return;
      }

      const tokens = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed.',
        data: tokens,
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.profileImage,
            title: user.title,
            organization: user.organization,
            plan: user.plan,
            settings: user.settings,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
