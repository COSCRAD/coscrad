import { useLoadableBooks } from '../../../store/slices/resources/books';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { BookIndexPresenter } from './book-index.presenter';

export const BookIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableBooks}
        IndexPresenter={BookIndexPresenter}
    />
);
