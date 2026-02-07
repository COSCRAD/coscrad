import { Inject } from '@nestjs/common';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../../coscrad-cli/logging';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../repositories/note-query-repository.interface';
import { NoteReadAccessGrantedToUser } from './note-read-access-granted-to-user.event';

export interface IAccessible {
    allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void>;
}

@CoscradEventConsumer('NOTE_READ_ACCESS_GRANTED_TO_USER')
export class NoteReadAccessGrantedToUserEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepopsitory: IAccessible,
        @Inject(COSCRAD_LOGGER_TOKEN)
        private readonly logger: ICoscradLogger
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: noteId },
            userId,
        },
    }: NoteReadAccessGrantedToUser): Promise<void> {
        await this.queryRepopsitory.allowUser(noteId, userId);
    }
}
