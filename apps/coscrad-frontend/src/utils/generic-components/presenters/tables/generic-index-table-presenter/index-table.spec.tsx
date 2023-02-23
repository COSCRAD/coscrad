import { HasId } from '@coscrad/api-interfaces';
import { Link, MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../../test-utils';
import { GenericIndexTablePresenterProps, IndexTable } from './index-table';
import { HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

type Widget = HasId & {
    foo: string;
    bar: number[];
    baz: {
        nestedProp: string[];
    };
};

/**
 * We introduce a fake model for the purpose of this test so not to assume
 * anything other than the existence of an `id` property.
 */
const widgets: Widget[] = [
    {
        id: '1',
        foo: 'a',
        bar: [1, 2, 3],
        baz: {
            nestedProp: ['b', 'c'],
        },
    },
    {
        id: '2',
        foo: 'e',
        bar: [11, 233, 34],
        baz: {
            nestedProp: ['c'],
        },
    },
    {
        id: '3',
        foo: 'hello world',
        bar: [1, 23, 34],
        baz: {
            nestedProp: [],
        },
    },
];

const allHeadings: HeadingLabel<Widget>[] = [
    {
        propertyKey: 'id',
        headingLabel: 'LINK',
    },
    {
        propertyKey: 'foo',
        headingLabel: 'Foo',
    },
    {
        propertyKey: 'bar',
        headingLabel: 'The Bars',
    },
    {
        propertyKey: 'baz',
        headingLabel: 'Checkout Baz',
    },
];

const filterableProperties: (keyof Widget)[] = [
    'foo', 'bar', 'baz'
]

const comprehensiveCellRenderersDefinition: CellRenderersDefinition<Widget> = {
    id: ({ id }: Widget) => <Link to={id}>LINK</Link>,
    foo: ({ foo, bar }: Widget) => `combined prop: ${foo} (${bar})`,
    bar: ({ bar }: Widget) => <div>{bar.length > 0 ? bar[0] : 'NO BAR!'}</div>,
    baz: ({ baz: { nestedProp } }: Widget) => nestedProp.join(' and then '),
};

/**
 * If inspecting the snapshot proves tedious or flakey, we may want to check
 * look for a `data-testid` prop on rendered cells.
 */
const assertValidTableRender = (props: GenericIndexTablePresenterProps<Widget>) => {
    // act
    const { baseElement } = renderWithProviders(
        <MemoryRouter>
            <IndexTable {...props} />
        </MemoryRouter>
    );

    expect(baseElement).toMatchSnapshot();
};

const heading = 'Widgets';

describe('IndexTable', () => {
    describe('when the table setup is valid', () => {
        describe('when all properies are included in the table (registered in headings)', () => {
            describe('when there is a cell renderer for every property', () => {
                it('should render properly', () => {
                    assertValidTableRender({
                        headingLabels: allHeadings,
                        tableData: widgets,
                        cellRenderersDefinition: comprehensiveCellRenderersDefinition,
                        heading,
                        filterableProperties: []
                    });
                });
            });

            describe('when a cell renderer is optionally omitted for one property (foo)', () => {
                const partialRenderers = {
                    id: comprehensiveCellRenderersDefinition.id,
                    bar: comprehensiveCellRenderersDefinition.bar,
                    baz: comprehensiveCellRenderersDefinition.baz,
                };

                it('should render properly', () => {
                    assertValidTableRender({
                        headingLabels: allHeadings,
                        tableData: widgets,
                        cellRenderersDefinition: partialRenderers,
                        heading,
                        filterableProperties
                    });
                });
            });

            describe('when all of the cell renders are omitted', () => {
                it('should render properly', () => {
                    assertValidTableRender({
                        headingLabels: allHeadings,
                        tableData: widgets,
                        cellRenderersDefinition: {},
                        heading,
                        filterableProperties
                    });
                });
            });
        });

        describe('when some of the properties are omitted from the table (foo,bar)', () => {
            const partialHeadings = allHeadings.filter(({ propertyKey }) =>
                ['id', 'baz'].includes(propertyKey)
            );

            describe('when there is a cell renderer for every included property', () => {
                const renderers = {
                    id: comprehensiveCellRenderersDefinition.id,
                    baz: comprehensiveCellRenderersDefinition.baz,
                };

                assertValidTableRender({
                    headingLabels: partialHeadings,
                    tableData: widgets,
                    cellRenderersDefinition: renderers,
                    heading,
                    filterableProperties
                });
            });

            describe('when a cell renderer is omitted for an included property (baz)', () => {
                assertValidTableRender({
                    headingLabels: partialHeadings,
                    tableData: widgets,
                    cellRenderersDefinition: {
                        id: comprehensiveCellRenderersDefinition.id,
                    },
                    heading,
                    filterableProperties
                });
            });

            describe('when no cell renderers are specified', () => {
                assertValidTableRender({
                    headingLabels: partialHeadings,
                    tableData: widgets,
                    cellRenderersDefinition: {},
                    heading,
                    filterableProperties
                });
            });
        });
    });

    describe('when the table setup is invalid', () => {
        const partialHeadings = allHeadings.filter(({ propertyKey }) =>
            ['id', 'baz'].includes(propertyKey)
        );
        describe('when there are unnecessary renderers', () => {
            const renderersWithExtra = {
                id: comprehensiveCellRenderersDefinition.id,
                baz: comprehensiveCellRenderersDefinition.baz,
                bar: (_: Widget) => 'I am not necessary- bar is not included in the table',
            };

            const attemptBadRender = () =>
                IndexTable({
                    headingLabels: partialHeadings,
                    tableData: widgets,
                    cellRenderersDefinition: renderersWithExtra,
                    heading,
                    filterableProperties
                });

            it('should throw', () => {
                expect(attemptBadRender).toThrow();
            });
        });

        describe('when there are no headings specified', () => {
            const attemptBadRender = () =>
                IndexTable({
                    headingLabels: [],
                    tableData: widgets,
                    cellRenderersDefinition: {},
                    heading,
                    filterableProperties
                });

            it('should throw', () => {
                expect(attemptBadRender).toThrow();
            });
        });
    });
});
