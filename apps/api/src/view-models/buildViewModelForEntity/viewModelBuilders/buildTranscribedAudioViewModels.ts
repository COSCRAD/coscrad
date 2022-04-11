import { TranscribedAudio } from 'apps/api/src/domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { TranscribedAudioViewModel } from '../viewModels/transcribed-audio/transcribed-audio.view-model';
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
}: ViewModelBuilderDependencies): Promise<TranscribedAudioViewModel[]> => {
    const repository = repositoryProvider.forEntity<TranscribedAudio>(entityTypes.transcribedAudio);

    const baseAudioURL = configService.get<string>('BASE_DIGITAL_ASSET_URL');

    const searchResult = await repository.fetchMany();

    const allViewModels = searchResult
        .filter((result): result is TranscribedAudio => !isInternalError(result))
        .map((domainModel) => new TranscribedAudioViewModel(domainModel, baseAudioURL));

    return allViewModels;
};
