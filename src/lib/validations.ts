import { z } from 'zod';

export const bookingFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone number is required').max(20),
  instagram: z.string().optional(),
  artist_name: z.string().optional(),
  service_id: z.string().uuid('Please select a service'),
  package_id: z.string().uuid().optional(),
  preferred_date: z.string().min(1, 'Please select a date'),
  preferred_start_time: z.string().min(1, 'Please select a start time'),
  session_duration_hours: z.number().min(1).max(24),
  number_of_people: z.number().min(1).max(20),
  additional_notes: z.string().optional(),
  policy_acknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the studio policy to continue',
  }),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().optional(),
  short_description: z.string().max(200).optional(),
  starting_price: z.number().min(0).optional().nullable(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
});

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(100),
  service_id: z.string().uuid('Service is required'),
  duration_hours: z.number().min(0.5).max(24),
  price: z.number().min(0),
  description: z.string().optional(),
  engineer_included: z.boolean(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
});

export const trackSchema = z.object({
  title: z.string().min(1, 'Track title is required').max(200),
  artist: z.string().min(1, 'Artist name is required').max(200),
  genre: z.string().optional(),
  description: z.string().optional(),
  bpm: z.number().min(40).max(300).optional().nullable(),
  key: z.string().optional(),
  price: z.number().min(0).optional().nullable(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  is_beat: z.boolean(),
  display_order: z.number().int().min(0),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  author: z.string().min(1, 'Author is required').max(100),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

export const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().optional(),
  testimonial: z.string().min(10, 'Testimonial is required').max(1000),
  rating: z.number().min(1).max(5).optional().nullable(),
  is_featured: z.boolean(),
  display_order: z.number().int().min(0),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type PackageFormData = z.infer<typeof packageSchema>;
export type TrackFormData = z.infer<typeof trackSchema>;
export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
