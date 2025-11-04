import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../../app/hooks';
import { selectLoadableTerms } from '../selectors';
import { fetchTerms } from '../thunks';

export const useLoadableTerms = () => {
    const loadable = useSelector(selectLoadableTerms);

    const { data, pageSize, filter } = loadable;

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data === null) {
            dispatch(
                fetchTerms({
                    pagination: {
                        page: 1,
                        size: pageSize,
                    },
                })
            );
        }
    }, [data, dispatch, pageSize, filter]);

    return loadable;
};
