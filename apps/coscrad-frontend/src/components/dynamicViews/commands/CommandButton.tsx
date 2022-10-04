import { ICommandInfo } from '@coscrad/api-interfaces';

const log = (data: unknown): void => console.log(JSON.stringify(data));

export const CommandButton = ({ label, schema }: ICommandInfo) => (
    <button key={label} onClick={() => log(schema)}>
        {label}
    </button>
);
