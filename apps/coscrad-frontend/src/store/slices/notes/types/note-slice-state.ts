import { INoteViewModel, WithTags } from '@coscrad/api-interfaces';
import { ILoadable } from '../../interfaces/loadable.interface';

/**
 * Note that we will make a breaking change to the API at somepoint and return
 * an `IIndexQueryResult<INoteViewModel>` instead.
 *
 * See [this story](https://www.pivotaltracker.com/story/show/183618856).
 */
export type NoteSliceState = ILoadable<WithTags<INoteViewModel>[]>;
