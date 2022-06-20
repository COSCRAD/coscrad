import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IIdManager } from '../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../errors/InternalError';
import { NotAvailable } from '../types/not-available';
import { isNotFound, NotFound } from '../types/not-found';
import { isOK, OK } from '../types/ok';
import { IIdRepository } from './interfaces/id-repository.interface';

@Injectable()
export class IdManagementService implements IIdManager {
    constructor(private readonly idRepository: IIdRepository<AggregateId>) {}

    async generate(): Promise<string> {
        const id = await uuidv4();

        /**
         * Mark the newly generated id as
         * - having been generated by our system
         * - available for subsequent use
         * in the database.
         */
        await this.idRepository.create(id);

        return id;
    }

    async status(id: AggregateId): Promise<NotFound | NotAvailable | OK> {
        const idDoc = await this.idRepository.fetchById(id);

        if (isNotFound(idDoc)) return NotFound;

        const { isAvailable } = idDoc;

        if (!isAvailable) return NotAvailable;

        /**
         * The requested id exists (has been generated with our system) and is
         * available for use.
         */
        return OK;
    }

    async use(id: AggregateId): Promise<void> {
        const status = await this.status(id);

        const statusMessage = isNotFound(status) ? 'Not Found' : 'Not Available';

        if (!isOK(status)) {
            throw new InternalError(
                `The system-generated ID: ${id} cannot be used because its status is: ${statusMessage}`
            );
        }

        /**
         * Mark the ID as already in use.
         *
         * TODO In the future we may want to make sure that this occurs within a
         * transaction along with the create write for the domain model document
         * with the given ID.
         */
        return this.idRepository.reserve(id);
    }
}
