import { HttpStatusCode } from '@coscrad/api-interfaces';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { Box, Button, Stack, styled, Typography } from '@mui/material';
import { ChangeEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '../../config';
import { selectAuthToken } from '../../store/slices/utils/select-token';
import { ErrorDisplay } from '../error-display/error-display';
import { FileUploadList } from './file-upload-list';
import { FileUploadStatus, FileWithProgress } from './types/file-with-progress';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type FileInputProps = {
    inputRef: React.RefObject<HTMLInputElement>;
    disabled: boolean;
    onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
};

const FileInput = ({ inputRef, disabled, onFileSelect }: FileInputProps) => {
    return (
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
        >
            Add Media Items
            <VisuallyHiddenInput
                type="file"
                ref={inputRef}
                onChange={onFileSelect}
                multiple
                disabled={disabled}
            />
        </Button>
    );
};

type ActionButtonsProps = {
    disabled: boolean;
    onUpload: () => void;
    onClear: () => void;
};

const ActionButtons = ({ onUpload, onClear, disabled }: ActionButtonsProps) => {
    return (
        <>
            <Button data-testid="mediaItem:upload:submit" onClick={onUpload} disabled={disabled}>
                <FileUploadIcon />
                Upload
            </Button>
            <Button data-testid="mediaItem:upload:clear" onClick={onClear} disabled={disabled}>
                <DeleteIcon />
                Clear All
            </Button>
        </>
    );
};

export const FileUploadForm = () => {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [uploading, setUploading] = useState(false);

    const [systemErrorMessage, setSystemErrorMessage] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }

        const newFiles = Array.from(e.target.files).map((file) => ({
            file,
            progress: 0,
            uploaded: false,
            id: file.name,
            status: FileUploadStatus.pending,
        }));

        setFiles([...files, ...newFiles]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const token = useSelector(selectAuthToken);

    const handleUpload = async () => {
        if (files.length === 0 || uploading) {
            return;
        }

        setUploading(true);

        const uploadPromises = files.map(async (fileWithProgress) => {
            const formData = new FormData();
            formData.append('file', fileWithProgress.file);

            const request = new XMLHttpRequest();

            request.open('POST', `${getConfig().apiUrl}/resources/mediaItems/upload`);

            request.setRequestHeader('Authorization', 'Bearer ' + token);

            // upload progress event
            request.upload.addEventListener('progress', function (e) {
                // upload progress as percentage
                const progress = (e.loaded / e.total) * 100;

                setFiles((prevFiles) =>
                    prevFiles.map((file) =>
                        file.id === fileWithProgress.id ? { ...file, progress } : file
                    )
                );
            });

            // request finished event
            request.addEventListener('load', function (_e) {
                // request.status holds the HTTP status message (200, 404 etc)

                // request.response holds response from the server

                if (request.status === HttpStatusCode.createdResource) {
                    setFiles((prevFiles) =>
                        prevFiles.map(
                            (file): FileWithProgress =>
                                file.id === fileWithProgress.id
                                    ? { ...file, status: FileUploadStatus.success }
                                    : file
                        )
                    );

                    return;
                }

                const { message } = JSON.parse(request.response) as { message: string };

                const prettyErrorMessage = message.split('Inner Errors')[0];

                if (request.status === HttpStatusCode.badRequest) {
                    setFiles((prevFiles) =>
                        prevFiles.map((file): FileWithProgress => {
                            if (file.id !== fileWithProgress.id) {
                                return file;
                            }

                            return {
                                ...file,
                                status: FileUploadStatus.error,
                                errorInfo: {
                                    code: request.status,
                                    message: prettyErrorMessage,
                                },
                            };
                        })
                    );

                    return;
                }

                if (request.status === HttpStatusCode.internalError) {
                    // throw new Error(`The system encountered an error.`);
                    setSystemErrorMessage(prettyErrorMessage);

                    return;
                }

                setSystemErrorMessage(
                    `Unexpected response code from media server: ${request.status}`
                );
            });

            request.addEventListener('error', (_e) => {
                setSystemErrorMessage(`The back-end is unavailable. Please try again later.`);
            });

            // send POST request to server
            request.send(formData);
        });

        await Promise.all(uploadPromises);

        setUploading(false);
    };

    const removeFile = (id: string) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    const handleClear = () => {
        setFiles([]);
    };

    if (systemErrorMessage !== null) {
        return <ErrorDisplay code={HttpStatusCode.internalError} message={systemErrorMessage} />;
    }

    return (
        <Stack spacing={2}>
            <Box>
                <Typography variant="h3">Media Item Upload</Typography>
                <FileInput
                    inputRef={inputRef}
                    disabled={uploading}
                    onFileSelect={handleFileSelect}
                />
                <ActionButtons
                    disabled={files.length === 0 || uploading}
                    onUpload={handleUpload}
                    onClear={handleClear}
                />
            </Box>
            <Box>
                <FileUploadList files={files} onRemove={removeFile} isUploading={uploading} />
            </Box>
        </Stack>
    );
};
