import {
    Article as ArticleIcon,
    AudioFile as AudioFileIcon,
    Clear as ClearIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    FileUpload as FileUploadIcon,
    Image as ImageIcon,
    InsertDriveFile as InsertDriveFileIcon,
    VideoCameraBack as VideoCameraBackIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { ChangeEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '../../config';
import { selectAuthToken } from '../../store/slices/utils/select-token';
import LinearProgressWithLabel from '../linear-progress-with-label/linear-progress-with-label';

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

type FileWithProgress = {
    id: string;
    file: File;
    progress: number;
    uploaded: boolean;
};

export const FileUpload = () => {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [uploading, setUploading] = useState(false);

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
            request.addEventListener('load', function (e) {
                // HTTP status message (200, 404 etc)
                console.log(request.status);

                // request.response holds response from the server
                console.log(request.response);

                setFiles((prevFiles) =>
                    prevFiles.map((file) =>
                        file.id === fileWithProgress.id ? { ...file, uploaded: true } : file
                    )
                );
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
                <FileList files={files} onRemove={removeFile} uploading={uploading} />
            </Box>
        </Stack>
    );
};

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

function ActionButtons({ onUpload, onClear, disabled }: ActionButtonsProps) {
    return (
        <>
            <Button onClick={onUpload} disabled={disabled}>
                <FileUploadIcon />
                Upload
            </Button>
            <Button onClick={onClear} disabled={disabled}>
                <DeleteIcon />
                Clear All
            </Button>
        </>
    );
}

type FileListProps = {
    files: FileWithProgress[];
    onRemove: (id: string) => void;
    uploading: boolean;
};

function FileList({ files, onRemove, uploading }: FileListProps) {
    if (files.length === 0) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography variant="h3">Files:</Typography>
            {files.map((file) => (
                <FileItem key={file.id} file={file} onRemove={onRemove} uploading={uploading} />
            ))}
        </Stack>
    );
}

type FileItemProps = {
    file: FileWithProgress;
    onRemove: (id: string) => void;
    uploading: boolean;
};

function FileItem({ file, onRemove, uploading }: FileItemProps) {
    const Icon = getFileIcon(file.file.type);

    return (
        <Card data-testid={file.id}>
            <CardContent>
                <Grid
                    container
                    sx={{
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        display: 'flex',
                    }}
                    spacing="10"
                    direction="row"
                    mb={2}
                >
                    <Grid item sx={{ fontSize: '60px', maxHeight: '60px' }}>
                        <Icon fontSize="inherit" color="primary" />
                    </Grid>
                    {/* For the `xs` see https://github.com/mui/material-ui/issues/11339
                        Seems like it's still broken in @material-ui/core ^4.12.3 */}
                    <Grid item zeroMinWidth xs>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {file.file.name}
                        </Typography>
                        <Typography component="div">
                            {formatFileSize(file.file.size)}
                            &nbsp;•&nbsp;
                            {file.file.type || 'Unknown type'}
                        </Typography>
                    </Grid>
                    <Grid item xs sx={{ textAlign: 'right' }}>
                        {!uploading && (
                            <Tooltip title="Remove File">
                                <IconButton onClick={() => onRemove(file.id)}>
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
                <Grid item>
                    <LinearProgressWithLabel value={file.progress} />
                </Grid>
            </CardContent>
        </Card>
    );
}

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return VideoCameraBackIcon;
    if (mimeType.startsWith('audio/')) return AudioFileIcon;
    if (mimeType === 'application/pdf') return ArticleIcon;
    return InsertDriveFileIcon;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
