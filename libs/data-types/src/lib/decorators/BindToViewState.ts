import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import getCoscradDataSchemaFromPrototype from '../utilities/getCoscradDataSchemaFromPrototype';

export function BindToViewState(viewPropertyName: string): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        const existingMeta = getCoscradDataSchemaFromPrototype(target);

        const existingMetaForThisProp = existingMeta[propertyKey] || {};

        Reflect.defineMetadata(
            COSCRAD_DATA_TYPE_METADATA,
            {
                ...existingMeta,
                [propertyKey]: {
                    ...existingMetaForThisProp,
                    bindToViewProperty: viewPropertyName,
                },
            },
            target
        );
    };
}
