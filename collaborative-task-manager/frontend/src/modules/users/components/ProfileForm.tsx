import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { TextArea } from '../../../shared/components/TextArea';
import { User, Mail, Phone, MapPin, Briefcase, Building, Globe } from 'lucide-react';
import { type UpdateProfileData } from '../types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  loading?: boolean;
}

export const ProfileForm = ({ 
  initialData, 
  onSubmit, 
  loading = false 
}: ProfileFormProps) => {
  const [socialLinks, setSocialLinks] = useState({
    twitter: initialData?.socialLinks?.twitter || '',
    linkedin: initialData?.socialLinks?.linkedin || '',
    github: initialData?.socialLinks?.github || '',
    instagram: initialData?.socialLinks?.instagram || '',
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      bio: initialData?.bio || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
      jobTitle: initialData?.jobTitle || '',
      department: initialData?.department || '',
      company: initialData?.company || '',
      website: initialData?.website || '',
    },
  });

  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    const submitData: UpdateProfileData = {
      ...data,
      socialLinks: Object.fromEntries(
        Object.entries(socialLinks).filter(([_, value]) => value.trim() !== '')
      ) as any,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          value={initialData?.email}
          disabled
          className="bg-gray-50"
        />

        <Input
          label="Phone Number"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Location"
          icon={<MapPin className="h-4 w-4" />}
          error={errors.location?.message}
          {...register('location')}
        />

        <Input
          label="Job Title"
          icon={<Briefcase className="h-4 w-4" />}
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />

        <Input
          label="Department"
          icon={<Building className="h-4 w-4" />}
          error={errors.department?.message}
          {...register('department')}
        />

        <Input
          label="Company"
          icon={<Building className="h-4 w-4" />}
          error={errors.company?.message}
          {...register('company')}
        />

        <Input
          label="Website"
          icon={<Globe className="h-4 w-4" />}
          placeholder="https://example.com"
          error={errors.website?.message}
          {...register('website')}
        />
      </div>

      <TextArea
        label="Bio"
        placeholder="Tell us about yourself..."
        error={errors.bio?.message}
        rows={4}
        {...register('bio')}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Twitter"
            placeholder="@username"
            value={socialLinks.twitter}
            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
            leftAddon="twitter.com/"
          />
          
          <Input
            label="LinkedIn"
            placeholder="username"
            value={socialLinks.linkedin}
            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
            leftAddon="linkedin.com/in/"
          />
          
          <Input
            label="GitHub"
            placeholder="username"
            value={socialLinks.github}
            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
            leftAddon="github.com/"
          />
          
          <Input
            label="Instagram"
            placeholder="username"
            value={socialLinks.instagram}
            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
            leftAddon="instagram.com/"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" loading={loading} size="lg">
          Save Changes
        </Button>
      </div>
    </form>
  );
};