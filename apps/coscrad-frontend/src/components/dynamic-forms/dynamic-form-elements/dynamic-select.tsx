import {
    AggregateType,
    IBaseViewModel,
    IDetailQueryResult,
    IFormField,
    IIndexQueryResult,
    isResourceType
} from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { buildUseLoadableForSingleCategorizableType } from '../../higher-order-components/buildUseLoadableResourcesOfSingleType';
import {
    AggregateStringSummarizer,
    aggregateStringSummarizerFactory
} from '../../resources/factories/aggregate-string-summarizer-factory';
import { StaticSelect } from './static-select';

type SimpleFormField = Omit<IFormField, 'options'>;

interface DynamicSelectProps {
    aggregateType: AggregateType;
    simpleFormField: SimpleFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
    currentValue: string;
    required: boolean;
}

const buildFormFieldFromEntities = <T extends IDetailQueryResult<IBaseViewModel>>(
    entities: T[],
    simpleFormField: SimpleFormField,
    stringSummarizer: AggregateStringSummarizer<T>
): IFormField => ({
    ...simpleFormField,
    options: entities.map((entity) => ({
        value: entity.id,
        display: stringSummarizer(entity),
    })),
});

export const DynamicSelect = ({
    aggregateType,
    simpleFormField,
    onNewSelection,
    currentValue,
    required
}: DynamicSelectProps): JSX.Element => {
    if (!isResourceType(aggregateType)) {
        throw new Error(
            `Non-resource aggregate: ${aggregateType} is not supported as dynamic form target`
        );
    }
    const loadableModels = buildUseLoadableForSingleCategorizableType(aggregateType)();

    const stringSummarizer = aggregateStringSummarizerFactory(aggregateType);

    const SelectPresenter = ({
        entities,
        simpleFormField,
    }: {
        entities: IDetailQueryResult<IBaseViewModel>[];
        simpleFormField: SimpleFormField;
    }) => (
        <StaticSelect
            formField={buildFormFieldFromEntities(entities, simpleFormField, stringSummarizer)}
            onNewSelection={onNewSelection}
            currentValue={currentValue}
            required={required}
        />
    );

    const PresenterWithLoadingAndErrors = displayLoadableWithErrorsAndLoading<
        IIndexQueryResult<IBaseViewModel>,
        { entities: IDetailQueryResult<IBaseViewModel>[] }
    >(SelectPresenter, ({ entities }) => ({ entities, simpleFormField }));

    return <PresenterWithLoadingAndErrors {...loadableModels} />;
};
