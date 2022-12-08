import { ITagViewModel } from './tag.view-model.interface';

export type WithTags<T> = T & {
    tags: ITagViewModel[];
};
