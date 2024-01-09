import { AggregateType, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../factories/get-instance-factory-for-resource';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities/digital-text.entity';
import { DigitalTextCreated } from '../events/digital-text-created.event';
import { CreateDigitalText } from './create-digital-text.command';

@CommandHandler(CreateDigitalText)
export class CreateDigitalTextCommandHandler extends BaseCreateCommandHandler<DigitalText> {
    protected createNewInstance({
        title,
        languageCodeForTitle,
        aggregateCompositeIdentifier: { id },
    }: CreateDigitalText): ResultOrError<DigitalText> {
        const createDto: DTO<DigitalText> = {
            type: AggregateType.digitalText,
            id,
            published: false,
            title: new MultilingualText({
                items: [
                    new MultilingualTextItem({
                        text: title,
                        languageCode: languageCodeForTitle,
                        role: MultilingualTextItemRole.original,
                    }),
                ],
            }),
            // You must run a subsequent command to add pages
            pages: [],
        };

        // TODO: consider using our new aggregate root decorator to build this
        const newInstanceOrError = getInstanceFactoryForResource<DigitalText>(
            ResourceType.digitalText
        )(createDto);

        return newInstanceOrError;
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource<DigitalText>(ResourceType.digitalText)
            .fetchMany();

        const preExistingDigitalTexts = searchResult.filter((result): result is DigitalText => {
            if (isInternalError(result)) {
                throw new InternalError(`Invalid digital text in database!`, [result]);
            }

            return true;
        });

        return new DeluxeInMemoryStore({
            [AggregateType.digitalText]: preExistingDigitalTexts,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: DigitalText
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(command: CreateDigitalText, eventMeta: EventRecordMetadata): BaseEvent {
        return new DigitalTextCreated(command, eventMeta);
    }
}
