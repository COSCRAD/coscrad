import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { TranscribableResource } from '../add-line-item-to-transcript';
import { LineItemTranslated } from './line-item-translated';
import { TranslateLineItem } from './translate-line-item.command';

@CommandHandler(TranslateLineItem)
export class TranslateLineItemCommandHandler extends BaseUpdateCommandHandler<TranscribableResource> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        instance: TranscribableResource,
        { inPointMilliseconds, outPointMilliseconds, translation, languageCode }: TranslateLineItem
    ): ResultOrError<TranscribableResource> {
        return instance.translateLineItem(
            inPointMilliseconds,
            outPointMilliseconds,
            translation,
            languageCode
        ) as ResultOrError<TranscribableResource>;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: TranscribableResource
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: TranslateLineItem, eventId: string, userId: string): BaseEvent {
        return new LineItemTranslated(command, eventId, userId);
    }
}
