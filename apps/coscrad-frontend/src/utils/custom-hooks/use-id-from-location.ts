import { useParams } from 'react-router-dom';
import { ID_ROUTE_PARAM_KEY } from '../../app/routes';

export const useIdFromLocation = () => {
    const paramsFromLocation = useParams();

    const idFromLocation = paramsFromLocation[ID_ROUTE_PARAM_KEY];

    if (typeof idFromLocation !== 'string' || idFromLocation.length === 0) {
        throw new Error(`Failed to read ID from route params`);
    }

    return [idFromLocation] as const;
};
