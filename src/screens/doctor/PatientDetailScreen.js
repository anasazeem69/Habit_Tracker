import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as doctorApi from '../../api/doctor';
import { colors } from '../../config/colors';

const PatientDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { patient } = route.params;

    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await doctorApi.getPatientData(patient.id);
                if (response.success) {
                    setPatientData(response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [patient.id]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{patient.fullName}</Text>
            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => {
        if (!patientData) return null;
        const { stats } = patientData;

        return (
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
                    <Text style={styles.statValue}>{stats.totalHabits}</Text>
                    <Text style={styles.statLabel}>Active Habits</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.accentLight }]}>
                    <Text style={styles.statValue}>{stats.totalCompletions}</Text>
                    <Text style={styles.statLabel}>Total Completions</Text>
                </View>
            </View>
        );
    };

    const renderHabitItem = (habit) => (
        <View key={habit._id} style={styles.habitCard}>
            <View style={[styles.iconContainer, { backgroundColor: habit.categoryId?.color || colors.primary }]}>
                <Text style={styles.iconText}>{habit.categoryId?.icon || '📝'}</Text>
            </View>
            <View style={styles.habitInfo}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.habitCategory}>{habit.categoryId?.name || 'General'}</Text>
            </View>
            <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={colors.warning} />
                <Text style={styles.streakText}>{habit.streak} Day Streak</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.patientProfile}>
                    <View style={styles.largeAvatar}>
                        <Text style={styles.largeAvatarText}>{patient.fullName.charAt(0)}</Text>
                    </View>
                    <Text style={styles.emailText}>{patient.email}</Text>
                    <Text style={styles.phoneText}>{patient.phone}</Text>
                    
                    <TouchableOpacity 
                        style={styles.messageButton} 
                        onPress={() => navigation.navigate('Chat', { targetUserId: patient.id, title: patient.fullName })}
                    >
                        <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
                        <Text style={styles.messageButtonText}>Message Patient</Text>
                    </TouchableOpacity>
                </View>

                {renderStats()}

                <Text style={styles.sectionTitle}>Habits Overview</Text>

                {patientData?.habits.length > 0 ? (
                    patientData.habits.map(renderHabitItem)
                ) : (
                    <Text style={styles.emptyText}>No active habits found for this patient.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    backButton: {
        padding: 5,
    },
    moreButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    patientProfile: {
        alignItems: 'center',
        marginVertical: 20,
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    largeAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    emailText: {
        fontSize: 16,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 15,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    messageButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 25,
        gap: 15,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginLeft: 20,
        marginBottom: 15,
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.light,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 24,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    habitCategory: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    streakContainer: {
        alignItems: 'center',
        backgroundColor: colors.background.tertiary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 4,
    },
    streakText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.text.tertiary,
        marginTop: 20,
    }
});

export default PatientDetailScreen;
