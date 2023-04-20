import {
    isNonEmptyString,
    isNullOrUndefined,
    isNumber,
    isString,
} from '@coscrad/validation-constraints';
import { SinglePropertyPresenter } from './single-property-presenter';

export type PropertyLabels<T> = {
    [K in keyof T]?: T[K] extends string | number ? string : never;
};

interface MultiPropertyPresenterProps<T> {
    keysAndLabels: PropertyLabels<T>;
    data: T;
}

export const MultiplePropertyPresenter = <T,>({
    keysAndLabels,
    data,
}: MultiPropertyPresenterProps<T>): JSX.Element => (
    <>
        {Object.entries(keysAndLabels)
            .filter(([propertyKey, _]) => !isNullOrUndefined(data[propertyKey]))
            .filter(([propertyKey, _]) => {
                if (!isString(data[propertyKey]) && !isNumber(data[propertyKey])) {
                    throw new Error(
                        'Only string or number valued properties are supported by MultiplePropertyPresenter'
                    );
                }

                if (!isNonEmptyString(data[propertyKey].toString())) return false;

                return true;
            })
            .map(([propertyKey, label]) => {
                const propertyValue = data[propertyKey];

                const propertyValueAsString = propertyValue.toString();

                return (
                    <SinglePropertyPresenter
                        key={label as string}
                        display={label as string}
                        value={propertyValueAsString}
                    />
                );
            })}
    </>
);
