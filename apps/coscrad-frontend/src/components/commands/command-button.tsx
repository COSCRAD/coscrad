import { ICommandMeta } from '@coscrad/api-interfaces';
import { Button } from '@mui/material';

interface CommandButtonProps {
    onButtonClick: (commandType: string) => void;
    commandMeta: ICommandMeta;
}

export const CommandButton = ({
    commandMeta: { type, label },
    onButtonClick,
}: CommandButtonProps) => (
    <Button
        key={label}
        onClick={() => {
            onButtonClick(type);
        }}
    >
        {label}
    </Button>
);
