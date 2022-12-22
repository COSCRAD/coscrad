import {
    AggregateType,
    IBaseViewModel,
    IDetailQueryResult,
    IFormField,
    IIndexQueryResult,
    isResourceType,
} from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { buildUseLoadableForSingleCategorizableType } from '../../higher-order-components/buildUseLoadableResourcesOfSingleType';
import { StaticSelect } from './static-select';

type SimpleFormField = Omit<IFormField, 'options'>;

interface DynamicSelectProps {
    aggregateType: AggregateType;
    simpleFormField: SimpleFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
}

const buildFormFieldFromEntities = (
    entities: IDetailQueryResult<IBaseViewModel>[],
    simpleFormField: SimpleFormField
): IFormField => ({
    ...simpleFormField,
    options: entities.map((entity) => ({
        value: entity.id,
        // TODO We need a summary view for every aggregate
        display: `Entity: ${entity.id}`,
    })),
});

export const DynamicSelect = ({
    aggregateType,
    simpleFormField,
    onNewSelection,
}: DynamicSelectProps): JSX.Element => {
    if (!isResourceType(aggregateType)) {
        throw new Error(
            `Non-resource aggregate: ${aggregateType} is not supported as dynamic form target`
        );
    }
    const loadableModels = buildUseLoadableForSingleCategorizableType(aggregateType)();

    const SelectPresenter = ({
        entities,
        simpleFormField,
    }: {
        entities: IDetailQueryResult<IBaseViewModel>[];
        simpleFormField: SimpleFormField;
    }) => (
        <StaticSelect
            formField={buildFormFieldFromEntities(entities, simpleFormField)}
            onNewSelection={onNewSelection}
        />
    );

    const PresenterWithLoadingAndErrors = displayLoadableWithErrorsAndLoading<
        IIndexQueryResult<IBaseViewModel>,
        { entities: IDetailQueryResult<IBaseViewModel>[] }
    >(SelectPresenter, ({ entities }) => ({ entities, simpleFormField }));

    return <PresenterWithLoadingAndErrors {...loadableModels} />;
};
