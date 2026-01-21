import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { useHabits } from '../context/HabitContext';

const HabitCard = ({ habit, onCheckIn, onPress }) => {
    const isCompleted = habit.completedToday;

    return (
        <TouchableOpacity
            style={[styles.card, isCompleted && styles.cardCompleted]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.cardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: habit.categoryId?.color + '20' }]}>
                    <Ionicons
                        name={habit.categoryId?.icon ? habit.categoryId.icon : 'star'}
                        size={24}
                        color={habit.categoryId?.color || colors.primary}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, isCompleted && styles.textCompleted]}>{habit.title}</Text>
                    <View style={styles.streakContainer}>
                        <Ionicons name="flame" size={14} color={isCompleted ? colors.white : colors.warning} />
                        <Text style={[styles.streakText, isCompleted && styles.textCompletedSubtitle]}>
                            {habit.streak} day streak
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
                onPress={() => onCheckIn(habit._id)}
                disabled={isCompleted}
            >
                <Ionicons
                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                    size={32}
                    color={isCompleted ? colors.white : colors.border.dark}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const HabitListScreen = ({ navigation }) => {
    const { habits, loading, fetchHabits, checkIn } = useHabits();

    useEffect(() => {
        fetchHabits();
    }, []); // Initial load

    const handleCheckIn = async (habitId) => {
        await checkIn(habitId);
    };

    const renderItem = ({ item }) => (
        <HabitCard
            habit={item}
            onCheckIn={handleCheckIn}
            onPress={() => navigation.navigate('HabitDetail', { habit: item })}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Habits</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateHabit')}
                >
                    <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={habits}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchHabits} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="leaf-outline" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>No habits yet. Start small!</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('CreateHabit')}
                        >
                            <Text style={styles.emptyButtonText}>Create your first habit</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardCompleted: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: colors.background.primary,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    textCompleted: {
        color: colors.white,
        textDecorationLine: 'line-through',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontSize: 12,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    textCompletedSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    checkButton: {
        padding: 4,
    },
    checkButtonCompleted: {
        opacity: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.secondary,
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});

export default HabitListScreen;
