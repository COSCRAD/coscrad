import { useLoadableBooks } from '../../../store/slices/resources/books';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { BookIndexPresenter } from './book-index.presenter';

export const BookIndexContainer = (): JSX.Element => {
    const [loadableBooks] = useLoadableBooks();

    const Presenter = displayLoadableWithErrorsAndLoading(BookIndexPresenter);

    return <Presenter {...loadableBooks} />;
};
