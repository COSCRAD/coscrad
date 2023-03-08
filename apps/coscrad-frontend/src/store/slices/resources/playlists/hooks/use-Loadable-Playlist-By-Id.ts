import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadablePlaylists } from './use-Loadable-Playlists';

export const useLoadablePlaylistsById = (id: string) =>
    useLoadableSearchResult(useLoadablePlaylists, id);
