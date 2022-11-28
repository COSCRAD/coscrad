import { IDetailQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { Carousel } from '../../higher-order-components/carousel';
import { TermDetailFullViewPresenter } from '../terms/term-detail.full-view.presenter';
import { formatBilingualText } from './utils';

export const VocabularyListDetailFullViewPresenter = ({
    data: { id, name, nameEnglish, entries },
}: IDetailQueryResult<IVocabularyListViewModel>): JSX.Element => (
    <div data-testid={id}>
        <h1>{formatBilingualText(name, nameEnglish)}</h1>
        <div>
            <h3>Entries:</h3>
            {/* TODO [https://www.pivotaltracker.com/story/show/183681556] We need to fix the following hack */}
            <Carousel
                propsForItems={entries.map(({ term }) => ({ data: term, actions: [] }))}
                Presenter={TermDetailFullViewPresenter}
            />
        </div>
        {/* TODO We need to render the Vocaulary List Form / associated filtering */}
    </div>
);