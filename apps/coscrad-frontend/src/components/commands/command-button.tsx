import { ICommandMeta } from '@coscrad/api-interfaces';

interface CommandButtonProps {
    onButtonClick: (commandType: string) => void;
    commandFormAndLabels: ICommandMeta;
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
