import { InternalError } from '../../../../lib/errors/InternalError';
import buildTestData from '../../../../test-data/buildTestData';
import { ContextTypeToInstance } from '../../../models/context/types/ContextTypeToInstance';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';

export default <TContextType extends EdgeConnectionContextType = EdgeConnectionContextType>(
    contextType: TContextType
): ContextTypeToInstance[TContextType] => {
    const { connections } = buildTestData();

    const validContext = connections
        .flatMap(({ members }) => members)
        .map(({ context }) => context)
        .find(
            (context): context is ContextTypeToInstance[TContextType] =>
                context.type === contextType
        );

    // This shouldn't happen; we seed test data comprehensively.
    if (!validContext)
        throw new InternalError(
            `Failed to find a valid context of type: ${contextType} in test data`
        );

    return validContext;
};
