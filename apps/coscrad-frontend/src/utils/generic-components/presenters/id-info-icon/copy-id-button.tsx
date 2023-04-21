import { ResourceType } from '@coscrad/api-interfaces';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button, Tooltip } from '@mui/material';
import { useState } from 'react';

type IdType = 'compositeId' | 'id';

interface CopyIdButtonProps {
    id: string;
    type: ResourceType;
    idType: IdType;
}

export const CopyIdButton = ({ id, type, idType }: CopyIdButtonProps): JSX.Element => {
    const [showIdTooltip, setShowIdTooltip] = useState(false);

    const handleCopyClick = (idType) => {
        const idToCopy = idType === 'compositeId' ? `${type}/${id}` : id;
        navigator.clipboard.writeText(idToCopy);
        setShowIdTooltip(true);
    };

    const handleOnTooltipClose = () => {
        setShowIdTooltip(false);
    };

    return (
        <Tooltip
            open={showIdTooltip}
            title={'Copied to clipboard!'}
            leaveDelay={500}
            leaveTouchDelay={500}
            onClose={handleOnTooltipClose}
        >
            <Button
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyClick(idType)}
                sx={{ mr: 1 }}
            >
                Copy ID {idType === 'compositeId' ? 'Composite Id' : 'Id'}
            </Button>
        </Tooltip>
    );
};
