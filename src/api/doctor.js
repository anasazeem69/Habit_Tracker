import client from './client';

const endpoint = '/v1/doctor';

export const getPatients = async () => {
    try {
        const response = await client.get(`${endpoint}/patients`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patients:', error);
        return { success: false, error: error.message };
    }
};

export const getPatientData = async (patientId) => {
    try {
        const response = await client.get(`${endpoint}/patients/${patientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient data:', error);
        return { success: false, error: error.message };
    }
};
