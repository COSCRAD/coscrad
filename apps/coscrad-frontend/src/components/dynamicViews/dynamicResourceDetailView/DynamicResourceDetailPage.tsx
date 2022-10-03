import { useLocation } from 'react-router-dom';
import { buildViewModelComponentFromCoscradDataDefinition } from './buildViewModelComponentFromCoscradDataDefinition';

export const DynamicResourceDetailPage = () => {
    const location = useLocation();

    const schema = location.state?.schema;

    const data = location.state?.data;

    const DetailPresenter = buildViewModelComponentFromCoscradDataDefinition(schema);

    return DetailPresenter(data);
};
