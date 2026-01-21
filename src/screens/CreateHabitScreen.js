import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { useHabits } from '../context/HabitContext';
import CategorySelector from '../components/CategorySelector';

const CreateHabitScreen = ({ navigation }) => {
    const { addHabit } = useHabits();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [frequency, setFrequency] = useState('daily');
    const [reminderTime, setReminderTime] = useState('anytime');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Info', 'Please give your habit a name.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Missing Info', 'Please select a category.');
            return;
        }

        setIsSubmitting(true);
        // Append reminder/advanced info to description if backend doesn't support separate fields yet
        const finalDescription = description + (reminderTime !== 'anytime' ? `\n[Reminder: ${reminderTime}]` : '');

        try {
            const result = await addHabit({
                title,
                description: finalDescription,
                categoryId: selectedCategory._id,
                frequency
            });

            if (result.success) {
                Alert.alert('Success', 'Habit created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', result.error || 'Failed to create habit');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Habit</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Text style={styles.introTitle}>Define your Goal</Text>
                    <Text style={styles.introSubtitle}>Small steps lead to big changes.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Habit Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Drink Water, Read Books"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={colors.text.tertiary}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>Category</Text>
                    <CategorySelector
                        onCategoryChange={setSelectedCategory}
                        showLabel={false}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>Description / Motivation</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Why do you want to build this habit?"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor={colors.text.tertiary}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={styles.sectionHeader}>Schedule & Frequency</Text>

                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Frequency</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, frequency === 'daily' && styles.toggleBtnActive]}
                                onPress={() => setFrequency('daily')}
                            >
                                <Text style={[styles.toggleText, frequency === 'daily' && styles.toggleTextActive]}>Daily</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, frequency === 'weekly' && styles.toggleBtnActive]}
                                onPress={() => setFrequency('weekly')}
                            >
                                <Text style={[styles.toggleText, frequency === 'weekly' && styles.toggleTextActive]}>Weekly</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.optionLabel}>Reminder</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 10 }}>
                            {['Morning', 'Afternoon', 'Evening', 'Anytime'].map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.chip,
                                        reminderTime === time.toLowerCase() && styles.chipActive
                                    ]}
                                    onPress={() => setReminderTime(time.toLowerCase())}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        reminderTime === time.toLowerCase() && styles.chipTextActive
                                    ]}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.createButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleCreate}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? 'Creating...' : 'Create Habit'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        paddingBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    content: {
        flex: 1,
        padding: 20,
        marginTop: -20, // Overlap header
    },
    introSection: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    introTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text.primary, // Will be on white card background effectively
        display: 'none', // Hidden as it overlaps inappropriately with overlap layout, or style it white
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: 24,
        padding: 20,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: colors.background.primary,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    optionLabel: {
        fontSize: 16,
        color: colors.text.primary,
        fontWeight: '500',
        minWidth: 80,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.primary,
        borderRadius: 12,
        padding: 4,
    },
    toggleBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        color: colors.text.secondary,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#FFF',
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.background.primary,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.text.secondary,
        fontSize: 13,
    },
    chipTextActive: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateHabitScreen;
