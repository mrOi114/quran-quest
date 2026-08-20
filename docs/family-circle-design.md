-- Family Group wraps existing parent/child profiles. Circle is a separate
-- public + madrasah/dugsi system. Do not put Public or Madrasah under Family.

See `src/constants/groupLimits.ts` for MAX_GROUP_MEMBERS (7) and the 1-hour timeout.

## Family Group
- Reuses profiles, family_code, Child PIN, family chat, family calls.
- `ensure_family_group()` promotes an adult to parent and issues a family code.
- Member cap is parent + children, enforced by trigger + client check.

## Circle
- Tables: `circles`, `circle_members`, `circle_messages`, `circle_message_reactions`, `teacher_approvals`.
- Kinds: `public`, `madrasah` only.
- Server RPCs enforce join codes, 7-member limit, teacher approval, 1-hour timeout, and contact-info blocking.
- Directory never returns email/phone.
- Children cannot join alone; a parent connects them after joining.
- Public audio stays off. Madrasah audio is an Admin/Teacher flag only (no 1:1 child-to-adult calls).
