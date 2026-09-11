import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(80).optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(80).optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }).refine((data) => data.fullName || data.name, {
    message: 'Full name is required',
    path: ['fullName'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(80).optional(),
    title: z.string().max(100).optional(),
    organization: z.string().max(100).optional(),
    timezone: z.string().max(100).optional(),
    settings: z.record(z.any()).optional(),
    avatar: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    durationMinutes: z.coerce.number().min(5).max(480).optional(),
    passcode: z.string().max(20).optional(),
    requirePassword: z.boolean().optional(),
    meetingSettings: z
      .object({
        allowChat: z.boolean().optional(),
        allowScreenShare: z.boolean().optional(),
        muteOnJoin: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const supportTicketSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(100),
    email: z.string().email('Valid email address is required'),
    subject: z.string().min(3, 'Subject is required').max(150),
    message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
  }),
});
