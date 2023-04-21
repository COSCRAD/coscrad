import { ResourceType } from '@coscrad/api-interfaces';
import InfoIcon from '@mui/icons-material/Info';
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
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
                        <CopyIdButton id={id} type={type} idType="compositeId" />
                        <CopyIdButton id={id} type={type} idType="id" />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};
