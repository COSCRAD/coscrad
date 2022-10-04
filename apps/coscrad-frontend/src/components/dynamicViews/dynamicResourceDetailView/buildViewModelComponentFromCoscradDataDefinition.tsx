import { ICommandInfo, IViewModel } from '@coscrad/api-interfaces';
import { CommandPanel } from '../commands';
import { buildPresenterForPropertyFromDataType } from './DataPresenters';

// TODO Share types with CoscradDataType lib to avoid using `any` here
export const buildViewModelComponentFromCoscradDataDefinition =
    (fullSchema: any, actions: ICommandInfo[] = []) =>
    (data: IViewModel[]) =>
        (
            <>
                <h1>Dynamic View</h1>
                {Object.entries(fullSchema).map(([propertyKey, dataSchema]: [string, any]) => {
                    const propertyValue = data[propertyKey];

                    if (propertyValue === null || typeof propertyValue === 'undefined')
                        return <div key={propertyKey}></div>;

                    return (
                        <div key={propertyKey}>
                            {propertyKey}:
                            {buildPresenterForPropertyFromDataType(dataSchema.coscradDataType)(
                                propertyValue
                            )}
                        </div>
                    );
                })}
                <CommandPanel actions={actions}></CommandPanel>
            </>
        );
