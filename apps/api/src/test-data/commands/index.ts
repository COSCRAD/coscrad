import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import { buildAudioItemTestCommandFsas } from './build-audio-item-test-command-fsas';
import { buildBibliographicCitationTestCommandFsas } from './build-bibliographic-citation-test-command-fsas';
import { buildContributorTestCommandFsas } from './build-contributor-test-command-fsas';
import { buildDigitalTextCommandFsas } from './build-digital-text-test-command-fsas';
import { buildGeneralResourceTestCommandFsas } from './build-general-resource-test-command-fsas';
import { buildMediaItemTestCommandFsas } from './build-media-item-test-command-fsas';
import { buildPhotographTestCommandFsas } from './build-photograph-test-command-fsas';
import { buildPlaylistTestCommandFsas } from './build-playlist-test-command-fsas';
import { buildSongTestCommandFsas } from './build-song-test-command-fsas';
import { buildSpatialFeatureTestCommandFsas } from './build-spatial-feature-test-command-fsas';
import { buildTagTestCommandFsas } from './build-tag-test-command-fsas';
import { buildTermTestCommandFsas } from './build-term-test-command-fsas';
import { buildVideoTestCommandFsas } from './build-video-test-command-fsas';
import { buildVocabularyListTestCommandFsas } from './build-vocabulary-list-test-command-fsas';
import { buildEdgeConnectionTestCommandFsas } from './bulid-edge-connection-test-command-fsas';

export const buildTestCommandFsaMap = () => {
    const commandTypeToFsa = [
        // Resources
        ...buildAudioItemTestCommandFsas(),
        ...buildBibliographicCitationTestCommandFsas(),
        ...buildContributorTestCommandFsas(),
        ...buildDigitalTextCommandFsas(),
        ...buildGeneralResourceTestCommandFsas(),
        ...buildMediaItemTestCommandFsas(),
        ...buildPhotographTestCommandFsas(),
        ...buildPlaylistTestCommandFsas(),
        ...buildSongTestCommandFsas(),
        ...buildSpatialFeatureTestCommandFsas(),
        ...buildTermTestCommandFsas(),
        ...buildVideoTestCommandFsas(),
        ...buildVocabularyListTestCommandFsas(),
        // Edge Connections
        ...buildEdgeConnectionTestCommandFsas(),
        // System Aggregates
        ...buildTagTestCommandFsas(),
    ].reduce((fsaMap, nextFsa) => fsaMap.set(nextFsa.type, nextFsa), new Map<string, CommandFSA>());

    const result = {
        get(commandType: string): CommandFSA {
            const result = commandTypeToFsa.get(commandType);

            if (isNullOrUndefined(result)) {
                throw new InternalError(
                    `Failed to find a test instance of the command: ${commandType}. Did you forget to register a test command FSA?`
                );
            }

            return result;
        },
    };

    return result;
};
