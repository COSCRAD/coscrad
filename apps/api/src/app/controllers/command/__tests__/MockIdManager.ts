import { isPositiveInteger } from '@coscrad/validation';
import { IIdManager } from '../../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../../domain/types/AggregateId';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import { isOK, OK } from '../../../../lib/types/ok';

const numberOfReservedDigits = 4;

/**
 * Incrementing the index brings this to 10**n - 1, which will have n chars when
 * converted to string. Anything beyond this will have too many characters to
 * fit the pattern.
 */
const maxIdIndex = 10 ** numberOfReservedDigits - 2;

const hardwiredUuidPrefix = '41fb2d7f-c483-4e09-a1f0-e9909a6b';

const fillerChar = '0';

const buildId = (sequentialId: number) => {
    if (!isPositiveInteger(sequentialId)) {
        throw new InternalError(`Invalid sequential id: ${sequentialId}`);
    }

    return `${hardwiredUuidPrefix}${sequentialId
        .toString()
        .padStart(numberOfReservedDigits, fillerChar)}`;
};

export class MockIdManager implements IIdManager {
    private uuidStatusMap: Map<AggregateId, boolean> = new Map();

    private currentIndex = 0;

    status(id: AggregateId): Promise<NotFound | NotAvailable | OK> {
        if (!this.uuidStatusMap.has(id)) return Promise.resolve(NotFound);

        const isAvailable = this.uuidStatusMap.get(id);

        if (typeof isAvailable !== 'boolean') {
            throw new InternalError(`Invalid value in UUID map: ${typeof isAvailable}`);
        }

        if (!isAvailable) return Promise.resolve(NotAvailable);

        return Promise.resolve(OK);
    }

    async use(id: AggregateId): Promise<void> {
        const status = await this.status(id);

        const isOk = isOK(status);

        if (!isOk) {
            throw new InternalError(`The id: ${id} is either not registered or not available`);
        }

        this.uuidStatusMap.set(id, false);

        return Promise.resolve();
    }

    generate(): Promise<AggregateId> {
        if (this.currentIndex > maxIdIndex) {
            throw new InternalError(
                `You have surpassed the limit of: ${maxIdIndex} for number of IDs generated`
            );
        }

        this.currentIndex++;

        const newId = this.buildUuid();

        this.uuidStatusMap.set(newId, true);

        return Promise.resolve(newId);
    }

    private buildUuid(): string {
        return buildId(this.currentIndex);
    }
}
