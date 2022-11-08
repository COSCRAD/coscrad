import { useLoadableBookById } from '../../../store/slices/resources/books';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { BookDetailPresenter } from './book-detail.presenter';

export const BookDetailContainer = (): JSX.Element => {
    const loadableBook = useLoadableBookById();

    const Presenter = displayLoadableSearchResult(BookDetailPresenter);

    return <Presenter {...loadableBook} />;
};
