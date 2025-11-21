import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { ITagViewModel } from '../../tag.view-model.interface';
import { IBibliographicCitationViewModel } from '../bibliographic-citation';
import { IDigitalTextPage } from './digital-text-page.interface';

export interface IDigitalTextViewModel extends IBaseResourceViewModel {
    type: 'digitalText';

    isPublished: boolean;

    tags: Pick<ITagViewModel, 'label' | 'id'>[];

    pages: IDigitalTextPage[];

    /**
     * If this resource was cultivated from an external work (e.g. a textbook),
     * the system can track this via the bibliographic citation system.
     */
    sourceCitation?: IBibliographicCitationViewModel;
}
