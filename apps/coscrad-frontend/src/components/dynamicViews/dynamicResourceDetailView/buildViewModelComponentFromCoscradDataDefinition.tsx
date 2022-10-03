import { buildPresenterForPropertyFromDataType } from './DataPresenters';

export const buildViewModelComponentFromCoscradDataDefinition = (fullSchema: any) => (data: any) =>
    (
        <>
            <h1>Dynamic View</h1>
            {Object.entries(fullSchema).map(([propertyKey, dataSchema]: [string, any]) => {
                const propertyValue = data[propertyKey];

                if (!propertyValue) return <div key={propertyKey}></div>;

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
