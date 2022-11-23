import { IBookPage } from '@coscrad/api-interfaces';
import { Carousel } from '../../../higher-order-components/carousel';
import { BookPage } from './book-page';

interface BookReaderProps {
    pages: IBookPage[];
}

export const BookReader = ({ pages }: BookReaderProps): JSX.Element => (
    // TODO We'll want to expose the ability to set the page identifier as soon as it is needed
    <Carousel propsForItems={pages} Presenter={BookPage} />
);
