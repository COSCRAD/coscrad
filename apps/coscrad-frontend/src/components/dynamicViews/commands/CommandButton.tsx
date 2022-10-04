import { CommandInfo } from './CommandPanel';

const log = (data: unknown): void => console.log(JSON.stringify(data));

export const CommandButton = ({ label, schema }: CommandInfo) => (
    <button key={label} onClick={() => log(schema)}>
        {label}
    </button>
);
