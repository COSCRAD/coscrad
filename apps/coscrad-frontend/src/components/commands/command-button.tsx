import { ICommandFormAndLabels } from '@coscrad/api-interfaces';

const log = (data: unknown): void => console.log(JSON.stringify(data));

interface CommandButtonProps {
    onButtonClick: (commandType: string) => void;
    commandFormAndLabels: ICommandFormAndLabels;
}

export const CommandButton = ({
    commandFormAndLabels: { type, form },
    onButtonClick,
}: CommandButtonProps) => (
    <button
        key={form.label}
        onClick={() => {
            log({ form });
            onButtonClick(type);
        }}
    >
        {form.label}
    </button>
);
