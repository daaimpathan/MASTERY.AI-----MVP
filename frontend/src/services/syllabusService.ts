import api from './api';
// Service file for syllabus operations

export interface SyllabusTopic {
    id: string;
    class_id: string;
    title: string;
    status: 'PENDING' | 'COMPLETED';
    created_at: string;
}

export interface SyllabusTopicCreate {
    title: string;
    status?: 'PENDING' | 'COMPLETED';
}

export interface SyllabusTopicUpdate {
    title?: string;
    status?: 'PENDING' | 'COMPLETED';
}

export const fetchClassTopics = async (classId: string): Promise<SyllabusTopic[]> => {
    const response = await api.get(`/classes/${classId}/topics`);
    return response.data;
};

export const createTopic = async (classId: string, data: SyllabusTopicCreate): Promise<SyllabusTopic> => {
    const response = await api.post(`/classes/${classId}/topics`, data);
    return response.data;
};

export const updateTopic = async (topicId: string, data: SyllabusTopicUpdate): Promise<SyllabusTopic> => {
    const response = await api.patch(`/topics/${topicId}`, data);
    return response.data;
};

export const deleteTopic = async (topicId: string): Promise<void> => {
    await api.delete(`/topics/${topicId}`);
};
