import { AudioWithTranscript } from 'apps/api/src/domain/models/audio-with-transcript/entities/audio-with-transcript.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { AudioWithTranscriptViewModel } from '../viewModels/audio-with-transcript/audio-with-transcript.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';

/**
 * TODO- For these `run of the mill` multiple view model builders, which do not
 * require any state other than the corresponding domain model (as opposed to
 * a more complex view model like `VocabularyListViewModel` which requires `VocabularyList`
 * and `Term` domain models as state), create a helper that takes in the
 * - entityType
 * - DomainModel constructor
 * - ViewModel constructor
 * so that we don't have to do some much copy and pasting.
 */
export default async ({
    repositoryProvider,
    configService,
}: ViewModelBuilderDependencies): Promise<AudioWithTranscriptViewModel[]> => {
    const repository = repositoryProvider.forEntity<AudioWithTranscript>(
        entityTypes.audioWithTranscript
    );

    const baseAudioURL = configService.get<string>('BASE_DIGITAL_ASSET_URL');

    const searchResult = await repository.fetchMany();

    const allViewModels = searchResult
        .filter((result): result is AudioWithTranscript => !isInternalError(result))
        .map((domainModel) => new AudioWithTranscriptViewModel(domainModel, baseAudioURL));

    return allViewModels;
};
