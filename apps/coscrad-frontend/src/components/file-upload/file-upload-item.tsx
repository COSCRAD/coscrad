import {
    Article as ArticleIcon,
    AudioFile as AudioFileIcon,
    Clear as ClearIcon,
    Image as ImageIcon,
    InsertDriveFile as InsertDriveFileIcon,
    VideoCameraBack as VideoCameraBackIcon,
} from '@mui/icons-material';
import { Card, CardContent, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import LinearProgressWithLabel from '../linear-progress-with-label/linear-progress-with-label';
import { FileUploadStatus, FileWithProgress } from './types/file-with-progress';

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

type FileItemProps = {
    file: FileWithProgress;
    onRemove: (id: string) => void;
    uploading: boolean;
};

export const FileUploadItem = ({ file, onRemove, uploading }: FileItemProps) => {
    const Icon = getFileIcon(file.file.type);

    return (
        <Card>
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
                        <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                            data-testid="file-name"
                        >
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
                                <IconButton
                                    data-testid={`mediaItem:upload:clear/${file.id}`}
                                    onClick={() => onRemove(file.id)}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
                <Grid item>
                    {/* TODO we should not have a `file.file`. Let's fix our naming \ modelling. */}
                    {file.status === FileUploadStatus.error ? (
                        <Typography component="div">{file.errorInfo.message}</Typography>
                    ) : (
                        <LinearProgressWithLabel value={file.progress} />
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};
