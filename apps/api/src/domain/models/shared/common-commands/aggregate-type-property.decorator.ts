import { ExternalEnum } from '@coscrad/data-types';
import { AggregateType } from '../../../types/AggregateType';

const buildDescription = (allowedTypes: AggregateType[]) => {
    if (allowedTypes.length === 0) return `this condition cannot be satisfied`;

    if (allowedTypes.length === 1) return `must be: ${allowedTypes[0]}`;

    return `One of: ${allowedTypes.join(', ')}`;
};

/**
 * Note that we don't really need to check that the `allowedTypes` array is non-empty
 * as this decorator will immediately prove uselessly restrictive in that case and
 * the error will be caught quickly.
 */
export const AggregateTypeProperty = (allowedTypes: AggregateType[]) =>
    ExternalEnum(
        {
            enumName: 'type',
            enumLabel: 'type',
            labelsAndValues: allowedTypes.map((type) => ({
                label: type,
                value: type,
            })),
        },
        {
            label: 'type',
            description: buildDescription(allowedTypes),
        }
    );
