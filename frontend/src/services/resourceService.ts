import api from '../services/api';
import type {
    Resource,
    ResourceRequest,
    ResourceCreateData,
    ResourceUpdateData,
    ResourceRequestCreateData,
    ResourceRequestActionData,
} from '../types/resource';

// Resource API calls

export const fetchResources = async (): Promise<Resource[]> => {
    const response = await api.get('/resources');
    return response.data;
};

export const createResource = async (data: ResourceCreateData): Promise<Resource> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('class_id', data.class_id);

    if (data.description) {
        formData.append('description', data.description);
    }
    if (data.url) {
        formData.append('url', data.url);
    }
    if (data.content) {
        formData.append('content', data.content);
    }
    if (data.file) {
        formData.append('file', data.file);
    }

    const response = await api.post('/resources', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getResource = async (id: string): Promise<Resource> => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
};

export const updateResource = async (
    id: string,
    data: ResourceUpdateData
): Promise<Resource> => {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
};

export const deleteResource = async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`);
};

// Resource Request API calls

export const createResourceRequest = async (
    data: ResourceRequestCreateData
): Promise<ResourceRequest> => {
    const response = await api.post('/resources/requests', data);
    return response.data;
};

export const fetchResourceRequests = async (): Promise<ResourceRequest[]> => {
    const response = await api.get('/resources/requests');
    return response.data;
};

export const approveRequest = async (
    id: string,
    data: ResourceRequestActionData
): Promise<ResourceRequest> => {
    const response = await api.put(`/resources/requests/${id}/approve`, data);
    return response.data;
};

export const rejectRequest = async (
    id: string,
    data: ResourceRequestActionData
): Promise<ResourceRequest> => {
    const response = await api.put(`/resources/requests/${id}/reject`, data);
    return response.data;
};
