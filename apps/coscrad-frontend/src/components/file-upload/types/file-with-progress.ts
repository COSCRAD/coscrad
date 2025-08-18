import { IHttpErrorInfo } from '@coscrad/api-interfaces';

export enum FileUploadStatus {
    pending = 'PENDING',
    success = 'SUCCESS',
    error = 'ERROR',
}

export type FileWithProgress = {
    id: string;
    file: File;
    progress: number;
    uploaded: boolean;
    status: FileUploadStatus;
    errorInfo?: IHttpErrorInfo;
};
