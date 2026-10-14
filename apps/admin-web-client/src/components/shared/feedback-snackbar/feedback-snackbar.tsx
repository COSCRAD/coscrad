import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, AlertTitle, IconButton, Snackbar, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { FeedbackTypeEnum, hideSnackBar } from '../store';

export const FeedbackSnackbar = () => {
    const dispatch = useDispatch();

    const {
        open,
        feedback: { severity, title, feedbackMessage },
    } = useSelector((state: RootState) => state.feedbackSlice);

    const [copied, setCopied] = useState(false);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return; // Prevent closing if clicking elsewhere
        dispatch(hideSnackBar());
        setCopied(false);
    };

    const handleCopy = async () => {
        try {
            // Formats the text perfectly for an email layout
            const textToCopy = `Error Title: ${title}\nDetails: ${feedbackMessage}`;
            await navigator.clipboard.writeText(textToCopy);

            // Flash a checkmark icon to provide immediate user feedback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const autoHideDuration = severity === FeedbackTypeEnum.error ? null : 6000;

    return (
        <Snackbar
            sx={{ width: '95%' }}
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }} // Positioning
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
                action={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tooltip title={copied ? 'Copied!' : 'Copy error text'}>
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={handleCopy}
                                aria-label="copy error log"
                            >
                                {copied ? (
                                    <CheckIcon fontSize="small" />
                                ) : (
                                    <ContentCopyIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>

                        {/* Native Alert close button callback hook */}
                        <IconButton color="inherit" size="small" onClick={handleClose}>
                            ×
                        </IconButton>
                    </div>
                }
            >
                <AlertTitle>{title}</AlertTitle>
                {feedbackMessage}
            </Alert>
        </Snackbar>
    );
};
