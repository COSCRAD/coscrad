import { ITagViewModel } from '@coscrad/api-interfaces';
import { TagCard } from './tag-card';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagDetailPresenter = (tag: ITagViewModel): JSX.Element => <TagCard {...tag} />;
