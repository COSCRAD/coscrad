import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import { buildGeneralResourceTestCommandFsas } from './build-general-resource-test-command-fsas';
import { buildSongTestCommandFsas } from './build-song-test-command-fsas';
import { buildSpatialFeatureTestCommandFsas } from './build-spatial-feature-test-command-fsas';
import { buildTermTestCommandFsas } from './build-term-test-command-fsas';
import { buildEdgeConnectionTestCommandFsas } from './bulid-edge-connection-test-command-fsas';

export const buildTestCommandFsaMap = () =>
    [
        ...buildGeneralResourceTestCommandFsas(),
        ...buildSongTestCommandFsas(),
        ...buildTermTestCommandFsas(),
        ...buildSpatialFeatureTestCommandFsas(),
        ...buildEdgeConnectionTestCommandFsas(),
    ].reduce((fsaMap, nextFsa) => fsaMap.set(nextFsa.type, nextFsa), new Map<string, CommandFSA>());
