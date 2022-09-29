import { CoscradDataType } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation';
import { DefaultPresenter } from './DefaultPresenter';

type Presenter = (data: unknown) => JSX.Element;

const dataTypeToPresenter: Partial<Record<CoscradDataType, Presenter>> = {
    [CoscradDataType.Year]: DefaultPresenter,
};

export const buildPresenterForPropertyFromDataType = (dataType: CoscradDataType | undefined) => {
    const lookupResult = dataTypeToPresenter[dataType];

    if (isNullOrUndefined(lookupResult)) return DefaultPresenter;

    return lookupResult;
};
