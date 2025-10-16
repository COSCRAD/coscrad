import { ITermViewModel } from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../../app/hooks';
import { RootState } from '../../../../../store';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { selectTermById } from '../selectors';
import { fetchTermById } from '../thunks';

export const useLoadableTermById = (id: string): ILoadable<ITermViewModel | NOT_FOUND> => {
    const loadable = useSelector((state: RootState) => selectTermById(state, id));

    const { data } = loadable;

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isNull(data)) {
            dispatch(fetchTermById(id));
        }
    }, [data, dispatch, id]);

    // @ts-expect-error This is a tough one
    return loadable;
};
