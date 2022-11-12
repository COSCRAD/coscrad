import { useLoadableBookById } from '../../../store/slices/resources/books';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { BookDetailPresenter } from './book-detail.presenter';

export const BookDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableBookById}
        DetailPresenter={BookDetailPresenter}
    />
);
