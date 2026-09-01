export type FeedbackCategory = 'idea' | 'problem' | 'praise';

export type StudentFeedbackItem = {
  id: string;
  created_at: string;
  category: FeedbackCategory;
  message: string;
  display_name: string | null;
  is_guest: boolean;
  language: string | null;
};
