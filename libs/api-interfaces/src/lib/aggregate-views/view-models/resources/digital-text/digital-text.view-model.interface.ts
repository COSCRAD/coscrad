import { IBaseViewModel } from '../../base.view-model.interface';
import { ITagViewModel } from '../../tag.view-model.interface';
import { IMultilingualText } from '../common';
import { IDigitalTextPage } from './digital-text-page.interface';

export interface IDigitalTextViewModel extends IBaseViewModel {
    type: 'digitalText';

    title: IMultilingualText;

    isPublished: boolean;

    tags: ITagViewModel[];

    pages: IDigitalTextPage[];

    // TODO Is this really something we want to require at this level?
    hasReadAccess(userWithGroups: unknown): boolean;
}
