import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

const log = (data: unknown): void => console.log(JSON.stringify(data));

export const CommandButton = (commandFormAndLabels: ICommandFormAndLabels) => (
    // TODO use MUI Button
    <Link to="/CommandExecution" state={{ commandFormAndLabels }}>
        {commandFormAndLabels.label}
    </Link>
);
