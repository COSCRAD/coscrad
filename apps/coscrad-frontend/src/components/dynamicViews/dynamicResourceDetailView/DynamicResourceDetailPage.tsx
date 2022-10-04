import { useLocation } from 'react-router-dom';
import { CommandInfo } from '../commands';
import { buildViewModelComponentFromCoscradDataDefinition } from './buildViewModelComponentFromCoscradDataDefinition';

export const DynamicResourceDetailPage = () => {
    const location = useLocation();

    const schema = location.state?.schema;

    const data = location.state?.data;

    const actions = location.state?.actions;

    const DetailPresenter = buildViewModelComponentFromCoscradDataDefinition(
        schema,
        actions as CommandInfo[]
    );

    return DetailPresenter(data);
};
