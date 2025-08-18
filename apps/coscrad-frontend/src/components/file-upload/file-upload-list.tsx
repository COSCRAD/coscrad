import { Stack, Typography } from '@mui/material';
import { FileUploadItem } from './file-upload-item';
import { FileWithProgress } from './types/file-with-progress';

type FileListProps = {
    files: FileWithProgress[];
    onRemove: (id: string) => void;
    isUploading: boolean; // isUploadingInProgress?
};

export const FileUploadList = ({ files, onRemove, isUploading: uploading }: FileListProps) => {
    if (files.length === 0) {
        return null;
    }

    return (
        <>
            <Typography variant="h3">Files:</Typography>
            <Stack spacing={1} data-testid="uploads-queue">
                {files.map((file) => (
                    <FileUploadItem
                        key={file.id}
                        file={file}
                        onRemove={onRemove}
                        uploading={uploading}
                    />
                ))}
            </Stack>
        </>
    );
};
