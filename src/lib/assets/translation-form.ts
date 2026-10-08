import {z} from 'zod';
export const englishFormFields = {
  title_en: z.string().optional(), description_en: z.string().optional(),
  model_type_en: z.string().optional(), creator_direction_en: z.string().optional(),
  influencer_topic_en: z.string().optional(), influencer_platforms_en: z.string().optional(),
  license_type_en: z.string().optional(), status_en: z.string().optional(),
  measurements_en: z.string().optional(), details_en: z.string().optional()
};
