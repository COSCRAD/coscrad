import { ICommandFormAndLabels } from '@coscrad/api-interfaces';

interface CommandButtonProps {
    onButtonClick: (commandType: string) => void;
    commandFormAndLabels: ICommandFormAndLabels;
}

export const CommandButton = ({
    commandFormAndLabels: { type, label },
    onButtonClick,
}: CommandButtonProps) => (
    <button
        key={label}
        onClick={() => {
            onButtonClick(type);
        }}
    >
        {label}
    </button>
);
