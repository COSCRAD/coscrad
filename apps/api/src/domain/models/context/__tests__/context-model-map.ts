import { IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { GeneralContext } from '../general-context/general-context.entity';
import { IdentityContext } from '../identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../page-range-context/page-range.context.entity';
import { TextFieldContext } from '../text-field-context/text-field-context.entity';
import { TimeRange, TimeRangeContext } from '../time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

/**
 * To get a dummy instance of a context model with type `contextType`,
 * ```ts
 * const contextModelMap = buildContextModelMap();
 *
 * const myContextModelInstance = contextModelMap.get(contextType);
 * ```
 * Note that we use a builder pattern here to avoid sharing references to this map.
 *
 * Also note that the returned context models have been designed so that they
 * are highly unlikely to be consistent with the state of any given resource
 * instance. This can be useful when testing the validation of context against
 * resource state.
 */
export const buildContextModelMap = () =>
    new Map<string, IEdgeConnectionContext>()
        .set(EdgeConnectionContextType.general, new GeneralContext())
        .set(EdgeConnectionContextType.identity, new IdentityContext())
        .set(
            EdgeConnectionContextType.pageRange,
            new PageRangeContext({
                type: EdgeConnectionContextType.pageRange,
                pageIdentifiers: ['kj2k23kkk44444444'],
            })
        )
        .set(
            EdgeConnectionContextType.textField,
            new TextFieldContext({
                type: EdgeConnectionContextType.textField,
                target: 'foobarbaz',
                charRange: [0, 10000000000000],
            })
        )
        .set(
            EdgeConnectionContextType.timeRange,
            new TimeRangeContext({
                type: EdgeConnectionContextType.timeRange,
                timeRange: new TimeRange({
                    inPoint: 0,
                    outPoint: 100000000000000,
                }),
            })
        );
