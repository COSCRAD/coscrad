import { ReactNode } from 'react';

interface CommaSeparatedListProps {
    children: ReactNode;
}

export const CommaSeparatedList = ({ children }: CommaSeparatedListProps): JSX.Element => {
    return (
        <>
            {Array.isArray(children)
                ? children
                      .map((child) => <span>{child}</span>)
                      .reduce((acc, currentElement, index) => {
                          if (index === children.length - 1) return acc.concat(currentElement);

                          return acc.concat(currentElement, ', ');
                      }, [])
                : children}
        </>
    );
};
