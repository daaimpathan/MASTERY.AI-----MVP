/**
 * Resource and ResourceRequest TypeScript interfaces
 */

export enum ResourceType {
    PDF = 'pdf',
    VIDEO = 'video',
    LINK = 'link',
    NOTES = 'notes',
}

export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface TeacherInfo {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface StudentInfo {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface Resource {
    id: string;
    title: string;
    description?: string;
    type: ResourceType;
    file_path?: string;
    url?: string;
    content?: string;
    teacher_id: string;
    class_id: string;
    created_at: string;
    updated_at: string;
    teacher?: TeacherInfo;
}

export interface ResourceRequest {
    id: string;
    title: string;
    description?: string;
    type: ResourceType;
    student_id: string;
    class_id: string;
    status: RequestStatus;
    teacher_response?: string;
    approved_resource_id?: string;
    created_at: string;
    updated_at: string;
    student?: StudentInfo;
}

export interface ResourceCreateData {
    title: string;
    description?: string;
    type: ResourceType;
    class_id: string;
    url?: string;
    content?: string;
    file?: File;
}

export interface ResourceUpdateData {
    title?: string;
    description?: string;
    url?: string;
    content?: string;
}

export interface ResourceRequestCreateData {
    title: string;
    description?: string;
    type: ResourceType;
    class_id: string;
}

export interface ResourceRequestActionData {
    teacher_response?: string;
}
