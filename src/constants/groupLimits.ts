/**
 * Shared membership cap for Family Group and Circle groups.
 * Stored as a constant so the product can raise the limit later without
 * redesigning tables or UI. Server-side `group_member_limit()` must stay in sync.
 */
export const MAX_GROUP_MEMBERS = 7;

/** Public Circle temporary removal. Server stores the exact end time. */
export const CIRCLE_TIMEOUT_HOURS = 1;

export const CIRCLE_TIMEOUT_MS = CIRCLE_TIMEOUT_HOURS * 60 * 60 * 1000;

export const CONTACT_SAFETY_MESSAGE =
  "For your safety, sharing phone numbers or email addresses isn't allowed here.";
