import { ResourceType } from '@coscrad/api-interfaces';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useState } from 'react';

interface IdInfoIconProps {
    id: string;
    type: ResourceType;
}

export const IdInfoIcon = ({ id, type }: IdInfoIconProps): JSX.Element => {
    const [openDialog, setOpenDialog] = useState(false);

    const [showIdTooltip, setShowIdTooltip] = useState(false);
    const [showCompositeIdTooltip, setShowCompositeIdTooltip] = useState(false);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleIdCopyClick = (value) => {
        navigator.clipboard.writeText(id);
        setShowIdTooltip(true);
    };

    const handleCompositeIdCopyClick = (value) => {
        navigator.clipboard.writeText(`${type}/${id}`);
        setShowCompositeIdTooltip(true);
    };

    const handleOnIdTooltipClose = () => {
        setShowIdTooltip(false);
    };

    const handleOnCompositeIdTooltipClose = () => {
        setShowCompositeIdTooltip(false);
    };

    return (
        <>
            <Tooltip title={`Click to Copy ID ${id}`}>
                <IconButton component="span" onClick={handleDialogOpen}>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
            <Dialog onClose={handleDialogClose} open={openDialog}>
                <DialogTitle>
                    {type} ID: {id}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Tooltip
                            open={showIdTooltip}
                            title={'Copied to clipboard!'}
                            leaveDelay={500}
                            leaveTouchDelay={500}
                            onClose={handleOnIdTooltipClose}
                        >
                            <Button
                                startIcon={<ContentCopyIcon />}
                                onClick={handleIdCopyClick}
                                sx={{ mr: 1 }}
                            >
                                Copy ID
                            </Button>
                        </Tooltip>
                        <Tooltip
                            open={showCompositeIdTooltip}
                            title={'Copied to clipboard!'}
                            leaveDelay={500}
                            leaveTouchDelay={500}
                            onClose={handleOnCompositeIdTooltipClose}
                        >
                            <Button
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCompositeIdCopyClick}
                            >
                                Copy Composite ID ("ResourceType/ID")
                            </Button>
                        </Tooltip>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};
