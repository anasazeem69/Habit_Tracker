import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { useHabits } from '../context/HabitContext';

const HabitDetailScreen = ({ route, navigation }) => {
    const { habit } = route.params;
    const { removeHabit } = useHabits();

    const handleDelete = () => {
        Alert.alert(
            "Delete Habit",
            "Are you sure you want to delete this habit? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await removeHabit(habit._id);
                        if (result.success) {
                            navigation.goBack();
                        } else {
                            Alert.alert("Error", result.error || "Failed to delete habit");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Habit Details</Text>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: habit.categoryId?.color + '20' }]}>
                        <Ionicons
                            name={habit.categoryId?.icon || 'star'}
                            size={40}
                            color={habit.categoryId?.color || colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>{habit.title}</Text>
                    <Text style={styles.category}>{habit.categoryId?.name || 'General'}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Ionicons name="flame" size={28} color={colors.warning} />
                        <Text style={styles.statValue}>{habit.streak}</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Ionicons name="trophy" size={28} color={colors.primary} />
                        <Text style={styles.statValue}>{habit.totalCompletions}</Text>
                        <Text style={styles.statLabel}>Total Check-ins</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {habit.description || "No description provided."}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequency</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{habit.frequency ? habit.frequency.toUpperCase() : 'DAILY'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete Habit</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background.secondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    category: {
        fontSize: 16,
        color: colors.text.secondary,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.background.secondary,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: colors.text.secondary,
        lineHeight: 24,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.background.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    badgeText: {
        color: colors.text.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: colors.error + '20', // transparent red
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: colors.error,
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HabitDetailScreen;
