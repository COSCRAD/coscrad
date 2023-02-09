import { IIdGenerator } from '../../../domain/interfaces/id-generator.interface';
import { AggregateId } from '../../../domain/types/AggregateId';
import { AggregateType } from '../../../domain/types/AggregateType';
import { InternalError } from '../../../lib/errors/InternalError';
import { IAudioParsingStrategy } from '../audio-parsing-strategy.interface';
import { BulkAudioFilenameParser } from '../bulk-audio-filename-parser';
import { AudioRegistrationStrategy } from './audio-registration-strategy.enum';
import { BAParadigmsAudioRegistrationStrategy } from './ba-paradigms-audio-registration-strategy';

const createCommandStreamBuilder = (
    registrationStrategy: AudioRegistrationStrategy,
    idGenerator: IIdGenerator,
    tagCompositeIdentifier: { type: typeof AggregateType.tag; id: AggregateId }
): IAudioParsingStrategy => {
    if (registrationStrategy === AudioRegistrationStrategy.baParadigms)
        return new BAParadigmsAudioRegistrationStrategy(
            `https://be.tsilhqotinlanguage.ca:3003/download?id=`,
            idGenerator,
            tagCompositeIdentifier
        );

    const exhaustiveCheck: never = registrationStrategy;

    throw new InternalError(
        `Failed to find a command stream creation strategy of type: ${exhaustiveCheck}`
    );
};

export const createBulkMediaParser = (
    registrationStrategy: AudioRegistrationStrategy,
    idGenerator: IIdGenerator,
    tagCompositeIdentifier: { type: typeof AggregateType.tag; id: AggregateId }
): BulkAudioFilenameParser => {
    const strategy = createCommandStreamBuilder(
        registrationStrategy,
        idGenerator,
        tagCompositeIdentifier
    );

    return new BulkAudioFilenameParser(strategy);
};
