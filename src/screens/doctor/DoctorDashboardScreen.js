import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as doctorApi from '../../api/doctor';
import { colors } from '../../config/colors';

const DoctorDashboardScreen = () => {
    const navigation = useNavigation();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPatients = async () => {
        try {
            const response = await doctorApi.getPatients();
            if (response.success) {
                setPatients(response.data);
                setFilteredPatients(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPatients();
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = patients.filter(p =>
                p.fullName.toLowerCase().includes(text.toLowerCase()) ||
                p.email.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    };

    const renderPatientCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PatientDetail', { patient: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.fullName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.patientName}>{item.fullName}</Text>
                    <Text style={styles.patientEmail}>{item.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.badge}>
                    <Ionicons name="link-outline" size={14} color={colors.primary} />
                    <Text style={styles.badgeText}>Linked since {new Date(item.linkedAt).toLocaleDateString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome,</Text>
                    <Text style={styles.title}>Dr. Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor={colors.text.tertiary}
                />
            </View>

            <FlatList
                data={filteredPatients}
                renderItem={renderPatientCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
                            <Text style={styles.emptyText}>No patients linked yet.</Text>
                            <Text style={styles.emptySubtext}>Invite patients to track their progress.</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border.light,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text.primary,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    cardInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 4,
    },
    patientEmail: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    cardFooter: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.tertiary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        color: colors.text.primary,
        marginLeft: 6,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.secondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.text.tertiary,
        marginTop: 8,
    }
});

export default DoctorDashboardScreen;
