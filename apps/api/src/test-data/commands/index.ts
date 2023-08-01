import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { buildBibliographicReferenceTestCommandFsas } from './build-bibliographic-reference-test-command-fsas';
import { buildGeneralResourceTestCommandFsas } from './build-general-resource-test-command-fsas';
import { buildMediaItemTestCommandFsas } from './build-media-item-test-command-fsas';
import { buildPlaylistTestCommandFsas } from './build-playlist-test-command-fsas';
import { buildSongTestCommandFsas } from './build-song-test-command-fsas';
import { buildSpatialFeatureTestCommandFsas } from './build-spatial-feature-test-command-fsas';
import { buildTagTestCommandFsas } from './build-tag-test-command-fsas';
import { buildTermTestCommandFsas } from './build-term-test-command-fsas';
import { buildVideoTestCommandFsas } from './build-video-test-command-fsas';
import { buildEdgeConnectionTestCommandFsas } from './bulid-edge-connection-test-command-fsas';

export const buildTestCommandFsaMap = () =>
    [
        // Resources
        ...buildGeneralResourceTestCommandFsas(),
        ...buildSongTestCommandFsas(),
        ...buildTermTestCommandFsas(),
        ...buildSpatialFeatureTestCommandFsas(),
        ...buildPlaylistTestCommandFsas(),
        ...buildMediaItemTestCommandFsas(),
        ...buildBibliographicReferenceTestCommandFsas(),
        ...buildVideoTestCommandFsas(),
        // Edge Connections
        ...buildEdgeConnectionTestCommandFsas(),
        // System Aggregates
        ...buildTagTestCommandFsas(),
    ].reduce((fsaMap, nextFsa) => fsaMap.set(nextFsa.type, nextFsa), new Map<string, CommandFSA>());
