import { doFetch } from '../doFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Streak {
    id: number;
    user_id: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    freeze_used: boolean;
    total_active_days: number;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: number;
    name: string;
    description: string;
    milestone_days: number;
    icon_emoji: string;
    color: string;
    earned_at?: string;
    is_new?: boolean;
}

export interface StreakHistoryItem {
    date: string;
    active: boolean;
}

// Get current user's streak data
export const getMyStreak = async (): Promise<Streak> => {
    const response: { streak: Streak } = await doFetch(`${API_BASE_URL}/api/streaks/my-streak`);
    return response.streak;
};

// Update streak (call when user is active)
export const updateStreak = async (): Promise<{
    streak: Streak;
    newBadges: Badge[];
    message: string;
}> => {
    const response: { streak: Streak, newBadges: Badge[], message: string } = await doFetch(`${API_BASE_URL}/api/streaks/update`, {
        method: 'POST',
    });
    return response;
};

// Get all available badges
export const getAllBadges = async (): Promise<Badge[]> => {
    const response: { badges: Badge[] } = await doFetch(`${API_BASE_URL}/api/streaks/badges`);
    return response.badges;
};

// Get user's earned badges
export const getMyBadges = async (): Promise<Badge[]> => {
    const response: { badges: Badge[] } = await doFetch(`${API_BASE_URL}/api/streaks/my-badges`);
    return response.badges;
};

// Mark badge as seen
export const markBadgeAsSeen = async (badgeId: number): Promise<void> => {
    await doFetch(`${API_BASE_URL}/api/streaks/badges/${badgeId}/seen`, {
        method: 'PATCH',
    });
};

// Get streak history for calendar
export const getStreakHistory = async (
    days: number = 90
): Promise<StreakHistoryItem[]> => {
    const response: { history: StreakHistoryItem[] } = await doFetch(
        `${API_BASE_URL}/api/streaks/history?days=${days}`
    );
    return response.history;
};
