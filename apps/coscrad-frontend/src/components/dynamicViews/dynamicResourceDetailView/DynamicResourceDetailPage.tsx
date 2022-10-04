import { ICommandInfo } from '@coscrad/api-interfaces';
import { useLocation } from 'react-router-dom';
import { buildViewModelComponentFromCoscradDataDefinition } from './buildViewModelComponentFromCoscradDataDefinition';

export const DynamicResourceDetailPage = () => {
    const location = useLocation();

    const schema = location.state?.schema;

    const data = location.state?.data;

    const actions = location.state?.actions;

    const DetailPresenter = buildViewModelComponentFromCoscradDataDefinition(
        schema,
        actions as ICommandInfo[]
    );

    return DetailPresenter(data);
};
