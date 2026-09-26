import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';

export type UnknownPart = Record<string, any>;

export type ApiCommandFsa = {
    type: string;
    payload: { aggregateCompositeIdentifier: AggregateCompositeIdentifier } & UnknownPart;
};
