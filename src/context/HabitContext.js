import React, { createContext, useState, useContext, useCallback } from 'react';
import { getHabits, createHabit, checkInHabit, deleteHabit } from '../api/habits';
import { AuthContext } from './AuthContext';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
    const { getAuthToken, updateUserStats } = useContext(AuthContext);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHabits = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAuthToken();
            if (!token) return;

            const result = await getHabits(token);
            if (result.success) {
                setHabits(result.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getAuthToken]);

    const addHabit = async (habitData) => {
        try {
            const token = await getAuthToken();
            const result = await createHabit(token, habitData);
            if (result.success) {
                // Optimistic or just re-fetch. Since create is complex, re-fetching or appending is fine.
                // Let's append if structure matches, or just re-fetch for safety.
                setHabits(prev => [result.data, ...prev]);
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const checkIn = async (habitId) => {
        // Optimistic Update
        const originalHabits = [...habits];

        // Find and update locally first
        setHabits(prev => prev.map(habit => {
            if (habit._id === habitId) {
                return {
                    ...habit,
                    completedToday: true,
                    streak: habit.streak + 1, // Naive optimistic increment (assuming streak wasn't broken)
                    totalCompletions: habit.totalCompletions + 1
                };
            }
            return habit;
        }));

        try {
            const token = await getAuthToken();
            const result = await checkInHabit(token, habitId);

            if (result.success) {
                // Update with actual server data to ensure correctness (e.g. correct streak calc)
                setHabits(prev => prev.map(habit => {
                    if (habit._id === habitId) {
                        return result.data;
                    }
                    return habit;
                }));

                // Handle Rewards
                if (result.rewards) {
                    // Check if updateUserStats is available (it should be)
                    if (updateUserStats) {
                        const { xpEarned, newLevel } = result.rewards;
                        updateUserStats({ xpEarned, newLevel });
                    }
                }

                return { success: true, rewards: result.rewards };
            }
        } catch (err) {
            // Revert on error
            console.error("Check-in failed, reverting:", err.message);
            setHabits(originalHabits);
            return { success: false, error: err.message };
        }
    };

    const removeHabit = async (habitId) => {
        // Optimistic
        const originalHabits = [...habits];
        setHabits(prev => prev.filter(h => h._id !== habitId));

        try {
            const token = await getAuthToken();
            await deleteHabit(token, habitId);
            return { success: true };
        } catch (err) {
            setHabits(originalHabits);
            return { success: false, error: err.message };
        }
    };

    return (
        <HabitContext.Provider value={{
            habits,
            loading,
            error,
            fetchHabits,
            addHabit,
            checkIn,
            removeHabit
        }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitContext);
    if (!context) throw new Error('useHabits must be used within HabitProvider');
    return context;
};
