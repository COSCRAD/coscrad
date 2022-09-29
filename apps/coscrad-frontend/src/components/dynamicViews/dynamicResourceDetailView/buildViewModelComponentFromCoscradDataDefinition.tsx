import { ClassDataTypeMetadata } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation';
import { buildPresenterForPropertyFromDataType } from './DataPresenters';

export const buildViewModelComponentFromCoscradDataDefinition =
    (fullSchema: ClassDataTypeMetadata) => (data: any) =>
        (
            <>
                <h1>Dynamic View</h1>
                {Object.entries(fullSchema).map(([propertyKey, dataSchema]) => {
                    const propertyValue = data[propertyKey];

                    if (isNullOrUndefined(propertyValue)) return <div key={propertyKey}></div>;

                    return (
                        <div key={propertyKey}>
                            {propertyKey}:
                            {buildPresenterForPropertyFromDataType(dataSchema.coscradDataType)(
                                propertyValue
                            )}
                        </div>
                    );
                })}
            </>
        );
