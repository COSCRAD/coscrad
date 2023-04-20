import { ResourceType } from '@coscrad/api-interfaces';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';

interface IdInfoIconProps {
    id: string;
    type: ResourceType;
}

export const IdInfoIcon = ({ id, type }: IdInfoIconProps): JSX.Element => {
    const [openDialog, setOpenDialog] = useState(false);

    const [showTooltip, setShowTooltip] = useState(false);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(`${type}/${id}`);
        setShowTooltip(true);
    };

    const handleOnTooltipClose = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <Tooltip title="Click to View ID">
                <IconButton component="span" onClick={handleDialogOpen}>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
            <Dialog onClose={handleDialogClose} open={openDialog}>
                <DialogTitle>{type} ID:</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography
                            component="span"
                            variant="body1"
                            sx={{ fontWeight: 'bold' }}
                            mr={1}
                        >
                            {id}
                        </Typography>
                        <Tooltip
                            open={showTooltip}
                            title={'Copied to clipboard!'}
                            leaveDelay={500}
                            leaveTouchDelay={500}
                            onClose={handleOnTooltipClose}
                        >
                            <IconButton onClick={handleCopyClick}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};
