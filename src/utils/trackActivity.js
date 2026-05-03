import { base44 } from "@/api/base44Client";

const POINTS_MAP = {
  "إضافة شاهد": 10,
  "تقييم مؤشر": 8,
  "إضافة تكليف": 5,
  "إتمام تكليف": 15,
  "إضافة خطة تحسين": 12,
  "تحديث خطة تحسين": 6,
  "إضافة ملاحظة": 3,
};

/**
 * Track a user activity in the leaderboard system.
 * @param {object} user - current user from useAuth()
 * @param {string} actionType - one of the action types in POINTS_MAP
 * @param {object} opts - { indicator_code, details }
 */
export async function trackActivity(user, actionType, opts = {}) {
  if (!user) return;
  try {
    await base44.entities.UserActivity.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      action_type: actionType,
      indicator_code: opts.indicator_code || "",
      points: POINTS_MAP[actionType] || 1,
      details: opts.details || "",
    });
  } catch (e) {
    // non-blocking
    console.warn("trackActivity failed:", e);
  }
}