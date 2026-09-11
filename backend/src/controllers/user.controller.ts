import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      const formattedUser = {
        id: user._id.toString(),
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.profileImage,
        profileImage: user.profileImage,
        title: user.title,
        organization: user.organization,
        plan: user.plan,
        timezone: user.timezone,
        settings: user.settings,
      };
      res.status(200).json({ success: true, data: { user: formattedUser } });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { fullName, title, organization, timezone, settings, avatar, profileImage } = req.body;

      const updateData: any = {};
      if (fullName) {
        updateData.fullName = fullName;
        updateData.name = fullName.split(' ')[0] || 'Member';
      }
      if (title !== undefined) updateData.title = title;
      if (organization !== undefined) updateData.organization = organization;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (settings !== undefined) updateData.settings = settings;
      if (avatar || profileImage) {
        updateData.profileImage = avatar || profileImage;
      }

      const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const formattedUser = {
        id: user._id.toString(),
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.profileImage,
        profileImage: user.profileImage,
        title: user.title,
        organization: user.organization,
        plan: user.plan,
        timezone: user.timezone,
        settings: user.settings,
      };

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: formattedUser },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await User.findByIdAndDelete(userId);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(200).json({ success: true, message: 'Account deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password does not match our records.',
          code: 'INVALID_PASSWORD',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(20);

      res.status(200).json({
        success: true,
        data: {
          notifications: notifications.map((n) => ({
            id: n._id.toString(),
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            createdAt: n.createdAt,
            read: n.read,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async markNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await Notification.updateMany({ userId: new mongoose.Types.ObjectId(userId), read: false }, { $set: { read: true } });
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  }
}
