import { ReactNode } from 'react';

interface CommaSeparatedListProps {
    children: ReactNode;
}

export const CommaSeparatedList = ({ children }: CommaSeparatedListProps): JSX.Element => {
    return (
        <span>
            {Array.isArray(children)
                ? children.reduce((acc, currentElement, index) => {
                      if (index === children.length - 1) return acc.concat(currentElement);

                      const inlineListElement = <span>{currentElement}</span>;

                      return acc.concat(inlineListElement, ', ');
                  }, [])
                : children}
        </span>
    );
};
