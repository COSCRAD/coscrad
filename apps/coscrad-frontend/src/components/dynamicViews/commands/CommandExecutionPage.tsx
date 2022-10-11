import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { useLocation } from 'react-router-dom';
import { ComamndForm } from './CommandForm/CommandForm';

export const CommandExecutionPage = (): JSX.Element => {
    const location = useLocation();

    const commandFormAndLabels: ICommandFormAndLabels = location.state
        ?.commandFormAndLabels as ICommandFormAndLabels;

    return <ComamndForm {...commandFormAndLabels}></ComamndForm>;
};
