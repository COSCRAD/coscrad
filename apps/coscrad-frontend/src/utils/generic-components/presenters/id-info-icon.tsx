import { ResourceType } from '@coscrad/api-interfaces';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Tooltip } from '@mui/material';

interface IdInfoIconProps {
    id: string;
    type: ResourceType;
}

export const IdInfoIcon = ({ id, type }: IdInfoIconProps): JSX.Element => (
    <Box component="span">
        <Tooltip title={`ID: ${type}/${id}`}>
            <InfoIcon />
        </Tooltip>
    </Box>
);
