import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { IMaybeLoadable, NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { NotFound } from '../NotFound';
import { displayLoadableWithErrorsAndLoading } from './displayLoadableWithErrorsAndLoading';
import { MapLoadedDataToProps } from './types';

export const displayLoadableSearchResult =
    <T, U>(
        WrappedPresenterComponent: FunctionalComponent<U>,
        /**
         * This "Inversion of Control" provides flexibility. For example,
         * we typically prefer to nest array data within an object. In case no
         * map is provided, the default behaviour is to treat the loadable as the props.
         */
        mapLoadedDataToPresenterProps?: MapLoadedDataToProps<T, U>
    ) =>
    (searchResult: IMaybeLoadable<T>) => {
        const { data } = searchResult;

        if (data === NOT_FOUND) return <NotFound />;

        return displayLoadableWithErrorsAndLoading(
            WrappedPresenterComponent,
            mapLoadedDataToPresenterProps
            // We have already checked for the case that NOT_FOUND is provided
            // we may want to tighten up types here
        )(searchResult as ILoadable<T>);
    };
