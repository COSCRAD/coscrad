import { ResourceType } from '@coscrad/api-interfaces';
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
import { CopyIdButton } from './copy-id-button';

interface IdInfoIconProps {
    id: string;
    type: ResourceType;
}

export const IdInfoIcon = ({ id, type }: IdInfoIconProps): JSX.Element => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    return (
        <>
        <div data-testid='copy-id'/>
            <Tooltip title={`Click to Copy ID ${id}`}>
                <IconButton component="span" onClick={handleDialogOpen}>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
            <Dialog onClose={handleDialogClose} open={openDialog}>
                <DialogTitle>
                    {type} ID:
                    <Typography component="div" variant="body2">
                        {id}
                    </Typography>
                </DialogTitle>
                <DialogContent data-testid={'copy-id-dialog'}>
                    <DialogContentText>
                        <CopyIdButton id={id} type={type} idType="id" />
                        <CopyIdButton id={id} type={type} idType="compositeId" />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};
