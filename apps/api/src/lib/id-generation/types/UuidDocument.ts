import { UniquelyIdentifiableType } from '../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../domain/types/AggregateId';

type ISOTimestamp = string;

/**
 * We may want to make this a class so we can validate invariants (e.g., that
 * dateUsed is undefined if usedBy is as well.)
 */
export type UuidDto = {
    // this is a sequential ID that can be used as a readable slug
    id: AggregateId;

    sequenceNumber: string;

    // The type of aggregate (could be an Event) that is using this UUID
    usedBy?: UniquelyIdentifiableType;

    // The time the UUID was generated
    timeGenerated: ISOTimestamp;

    // The time the UUID was used
    timeUsed?: ISOTimestamp;
};
