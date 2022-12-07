import { IBookViewModel } from '@coscrad/api-interfaces';

export const BookInfo = ({ title, subtitle, author, publicationDate }: IBookViewModel) => (
    <div>
        <h1>{title}</h1>
        {subtitle && <h3>{subtitle}</h3>}
        <strong>by</strong> {author}
        <br />
        {publicationDate && (
            <div>
                <strong>published</strong> {publicationDate}
            </div>
        )}
    </div>
);
