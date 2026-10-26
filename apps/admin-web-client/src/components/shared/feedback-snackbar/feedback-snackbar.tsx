import { isNullOrUndefined } from '@coscrad/validation-constraints';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Alert,
    AlertTitle,
    Box,
    IconButton,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../../store';
import { clearFeedbackState, FeedbackTypeEnum, hideSnackBar } from '../store';

export const FeedbackSnackbar = () => {
    const dispatch = useDispatch();

    const location = useLocation();

    const {
        open,
        feedbackCommands,
        feedback: { severity, title, feedbackMessage },
    } = useSelector((state: RootState) => state.feedbackSlice);

    const [copied, setCopied] = useState(false);

    const handleClose = useCallback(
        (event?: React.SyntheticEvent | Event, reason?: string) => {
            if (reason === 'clickaway') return; // Prevent closing if clicking elsewhere
            dispatch(hideSnackBar());
            dispatch(clearFeedbackState());
            setCopied(false);
        },
        [dispatch, setCopied]
    );

    const handleCopy = async () => {
        try {
            // Formats the text perfectly for an email layout
            const textToCopy = `Error Title: ${title}\nDetails: ${feedbackMessage}\n\nCommands:\n${feedbackCommands
                .map((command) => `${JSON.stringify(command)}`)
                .join('\n')}`;
            await navigator.clipboard.writeText(textToCopy);

            // Flash a checkmark icon to provide immediate user feedback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        // actions on unmount
        return () => {
            if (open) {
                console.log('Page changed to:', location.pathname);

                handleClose();
            }
        };
    }, [open, location.pathname, handleClose, dispatch]); // Triggers whenever pathname changes

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
                <Typography variant="h5">Command Stream</Typography>
                <Box sx={{ height: '150px', overflow: 'scroll' }}>
                    {!isNullOrUndefined(feedbackCommands)
                        ? feedbackCommands.map(({ command }) => {
                              const key = command.payload.aggregateCompositeIdentifier.id;

                              return (
                                  // eslint-disable-next-line react/jsx-no-undef
                                  <Stack key={key}>
                                      <Typography variant="body1">{command.commandType}</Typography>
                                      <Typography variant="body1">
                                          {JSON.stringify(command.payload)}
                                      </Typography>
                                  </Stack>
                              );
                          })
                        : null}
                </Box>
            </Alert>
        </Snackbar>
    );
};
