import { ICommandFormAndLabels } from '@coscrad/api-interfaces';

const log = (data: unknown): void => console.log(JSON.stringify(data));

export const CommandButton = ({ label, form }: ICommandFormAndLabels) => (
    <button key={label} onClick={() => log({ form })}>
        {label}
    </button>
);
