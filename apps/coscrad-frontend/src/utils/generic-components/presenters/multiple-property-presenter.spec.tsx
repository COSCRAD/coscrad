import { HasId } from '@coscrad/api-interfaces';
import { render } from '@testing-library/react';
import { MultiplePropertyPresenter, PropertyLabels } from './multiple-property-presenter';

// Build a bogus data type and a widget that uses this type, put all null, undefined, etc.
type MultiplePropertyWidget = HasId & {
    foo: string;
    bar: number;
    baz: string;
};

const widgets: MultiplePropertyWidget[] = [
    {
        id: '1',
        foo: 'sammy',
        bar: 23,
        baz: 'hello world',
    },
];

const keysAndLabels: PropertyLabels<MultiplePropertyWidget> = {
    foo: 'Foo',
    bar: 'Bar',
    baz: 'Baz',
};

describe('MultiplePropertyPresenter', () => {
    describe('when a bibliographic reference is passed in', () => {
        it('should display each of the properties present on the keysAndLabels object', () => {
            const {
                baseElement: { textContent },
            } = render(
                <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={widgets[0]} />
            );

            const missingLabels = Object.values(keysAndLabels).filter(
                (label) => !textContent.includes(label)
            );

            expect(missingLabels).toEqual([]);

            const widgetToTest = widgets[0];

            const missingValues = [widgetToTest.foo, widgetToTest.bar, widgetToTest.baz].filter(
                (value) => !textContent.includes(value.toString())
            );

            expect(missingValues).toEqual([]);
        });
    });
});
