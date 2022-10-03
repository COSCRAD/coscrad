import { defaultPresenter } from './defaultPresenter';

type Presenter = (data: unknown) => JSX.Element;

const dataTypeToPresenter: Partial<Record<string, Presenter>> = {
    YEAR: defaultPresenter,
};

export const buildPresenterForPropertyFromDataType = (dataType: any) => {
    const lookupResult = dataTypeToPresenter[dataType];

    if (!lookupResult) return defaultPresenter;

    return lookupResult;
};
