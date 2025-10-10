import { AggregateType } from '@coscrad/api-interfaces';
import { CommandPanel } from './src/components/commands';
import {
    buildCommandExecutor,
    buildDynamicCommandForm,
} from './src/components/commands/command-executor';
import { displayLoadableWithErrorsAndLoading } from './src/components/higher-order-components';
import { TermIndexPresenter } from './src/components/resources/terms/term-index.presenter';
import { useLoadableTerms } from './src/store/slices/resources';

export const TermIndexContainer = (): JSX.Element => {
    // TODO we need to deal with pagination here
    const loadableTerms = useLoadableTerms();

    const Presenter = displayLoadableWithErrorsAndLoading(TermIndexPresenter);

    return (
        <div>
            <Presenter {...loadableTerms} />
            {loadableTerms.data?.indexScopedActions?.length > 0 && (
                <CommandPanel
                    actions={loadableTerms.data.indexScopedActions.map((action) => ({
                        ...action,
                        executor: buildCommandExecutor(
                            buildDynamicCommandForm(action),
                            /**
                             * Naturally bound index-scoped commands do not require
                             * any payload properties to be bound aside from the
                             * `aggregateCompositeIdentifer` that must be bulit from
                             * the newly generated ID.
                             */
                            {},
                            AggregateType.term
                        ),
                    }))}
                />
            )}
        </div>
    );
};
