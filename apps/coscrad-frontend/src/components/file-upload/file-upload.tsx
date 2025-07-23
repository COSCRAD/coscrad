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
import { Button, Grid, styled, Typography } from '@mui/material';
import { ChangeEvent, useRef, useState } from 'react';

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

    async function handleUpload() {
        console.log('Upload Not Implemented');
    }

    function removeFile(id: string) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    }

    function handleClear() {
        setFiles([]);
    }

    return (
        <Grid container spacing={2}>
            <Grid item>
                <Typography variant="h3">Media Item Upload</Typography>
                <FileInput
                    inputRef={inputRef}
                    disabled={uploading}
                    onFileSelect={handleFileSelect}
                />
            </Grid>
            <Grid item>
                <FileList files={files} onRemove={removeFile} uploading={uploading} />
            </Grid>
        </Grid>
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
            Upload files
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
        <Grid container spacing={2}>
            <Typography variant="h3">Files:</Typography>
            <Grid item>
                {files.map((file) => (
                    <FileItem key={file.id} file={file} onRemove={onRemove} uploading={uploading} />
                ))}
            </Grid>
        </Grid>
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
        <div className="space-y-2 rounded-md bg-grayscale-700 p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Icon />
                    <div className="flex flex-col">
                        <span className="font-medium">{file.file.name}</span>
                        <div className="flex items-center gap-2 text-xs text-grayscale-400">
                            <span>{formatFileSize(file.file.size)}</span>
                            <span>•</span>
                            <span>{file.file.type || 'Unknown type'}</span>
                        </div>
                    </div>
                </div>
                {!uploading && (
                    <button onClick={() => onRemove(file.id)} className="bg-none p-0">
                        <ClearIcon />
                    </button>
                )}
            </div>
            <div className="text-right text-xs">
                {file.uploaded ? 'Completed' : `${Math.round(file.progress)}%`}
            </div>
            <ProgressBar progress={file.progress} />
        </div>
    );
}

type ProgressBarProps = {
    progress: number;
};

function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-grayscale-800">
            <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
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
