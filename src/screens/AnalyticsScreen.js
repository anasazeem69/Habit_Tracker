import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { colors } from '../config/colors';

const AnalyticsScreen = ({ navigation }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/v1/stats/report');
            if (response.data?.success) {
                setReport(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load performance report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!report) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Failed to load analytics.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const maxChartValue = Math.max(...(report.chartData?.map(d => d.count) || [1]));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Performance Analytics</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* 30-Day Overview */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>30-Day Overview</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Completion Rate</Text>
                            <Text style={styles.statValue}>{report.completionRate}%</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total Logs</Text>
                            <Text style={styles.statValue}>{report.totalCheckIns}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Successful</Text>
                            <Text style={[styles.statValue, { color: colors.success }]}>{report.passedCheckIns}</Text>
                        </View>
                    </View>
                </View>

                {/* 7-Day Activity Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>7-Day Activity</Text>
                    <View style={styles.chartContainer}>
                        {report.chartData?.map((data, index) => {
                            const dateObj = new Date(data.date);
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const heightPercentage = maxChartValue > 0 ? (data.count / maxChartValue) * 100 : 0;
                            
                            return (
                                <View key={index} style={styles.barWrapper}>
                                    <View style={styles.barBackground}>
                                        <View style={[styles.barFill, { height: `${heightPercentage}%` }]} />
                                    </View>
                                    <Text style={styles.barLabel}>{dayName}</Text>
                                    <Text style={styles.barValue}>{data.count}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Habits Overview */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Habits Overview</Text>
                    {report.habitsOverview?.length === 0 ? (
                        <Text style={styles.emptyText}>No active habits found.</Text>
                    ) : (
                        report.habitsOverview?.map(habit => (
                            <View key={habit.id} style={styles.habitRow}>
                                <Text style={styles.habitTitle}>{habit.title}</Text>
                                <View style={styles.streakBadge}>
                                    <Ionicons name="flame" size={16} color="#FF9500" />
                                    <Text style={styles.streakText}>{habit.streak} days</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.secondary,
        borderBottomWidth: 1, borderBottomColor: colors.border.light,
    },
    headerBackBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary },
    content: { flex: 1, padding: 16 },
    card: {
        backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, marginBottom: 16,
        shadowColor: colors.shadow.light, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginBottom: 16 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingTop: 20 },
    barWrapper: { alignItems: 'center', flex: 1 },
    barBackground: { width: 24, height: 100, backgroundColor: colors.background.primary, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 12 },
    barLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 8 },
    barValue: { fontSize: 10, color: colors.text.tertiary, position: 'absolute', top: -16 },
    habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    habitTitle: { fontSize: 16, color: colors.text.primary, flex: 1 },
    streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    streakText: { fontSize: 14, fontWeight: 'bold', color: '#FF9500', marginLeft: 4 },
    errorText: { fontSize: 16, color: colors.error, marginBottom: 16 },
    backBtn: { padding: 12, backgroundColor: colors.primary, borderRadius: 8 },
    backBtnText: { color: '#FFF', fontWeight: 'bold' },
    emptyText: { color: colors.text.secondary, fontStyle: 'italic' }
});

export default AnalyticsScreen;
