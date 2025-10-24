/**
 * Example Zod schemas
 * Add your own as needed
 */
import { z } from 'zod';

// Example: Project creation schema
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().optional(),
  visibility: z.enum(['private', 'team', 'public']).default('private'),
  description: z.string().max(500).optional(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;

// Example: User profile schema
export const UserProfileSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  website: z.string().url().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
