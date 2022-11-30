import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { MapLoadedDataToProps } from './types';

export type HasData<T> = {
    data: T;
};

export const displayLoadableWithErrorsAndLoading =
    <T, U>(
        WrappedPresenterComponent: FunctionalComponent<U>,
        /**
         * This "Inversion of Control" provides flexibility. For example,
         * we typically prefer to nest array data within an object. In case no
         * map is provided, the default behaviour is to treat the loadable as the props.
         */
        mapLoadedDataToPresenterProps?: MapLoadedDataToProps<T, U>
    ) =>
    (loadable: ILoadable<T>) => {
        const { errorInfo, isLoading, data: data } = loadable;

        if (errorInfo) {
            return <ErrorDisplay {...errorInfo}></ErrorDisplay>;
        }

        if (isLoading || data === null) return <Loading></Loading>;

        // default to the identity map if no map is provided (this typically is what we want with non-array loaded data)
        const props = mapLoadedDataToPresenterProps
            ? mapLoadedDataToPresenterProps(data)
            : // Is there a better way to handle the type correlation using inference?
              (data as unknown as U);

        return <WrappedPresenterComponent {...props} />;
    };
