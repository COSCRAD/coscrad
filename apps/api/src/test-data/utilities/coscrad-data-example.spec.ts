import { DTO } from '../../types/DTO';
import { buildTestInstance, CoscradDataExample } from './coscrad-data-example';

describe(`@CoscradDataExample`, () => {
    describe(`when the decorated class is well-formed`, () => {
        describe(`when only one example has been registered`, () => {
            @CoscradDataExample({
                example: {
                    priority: 1,
                    name: 'shop',
                },
            })
            class TodoItem {
                public priority: number;
                public name: string;

                constructor(priority: number, name: string) {
                    this.priority = priority;
                    this.name = name;
                }

                public static fromDto({ priority, name }: DTO<TodoItem>): TodoItem {
                    return new TodoItem(priority, name);
                }
            }

            describe(`when no overrides are provided`, () => {
                it(`should build an instance with the expected properties`, () => {
                    const result = buildTestInstance(TodoItem);

                    expect(result).toBeInstanceOf(TodoItem);

                    const { priority, name } = result;

                    expect(priority).toBe(1);

                    expect(name).toBe('shop');
                });
            });

            describe(`when overrides are provided`, () => {
                it(`should build an instance with the expected properties`, () => {
                    const updatedPriority = 3;

                    const updatedName = 'running';

                    const result = buildTestInstance(TodoItem, {
                        priority: updatedPriority,
                        name: updatedName,
                    });

                    expect(result).toBeInstanceOf(TodoItem);

                    const { priority, name } = result;

                    expect(priority).toBe(updatedPriority);

                    expect(name).toBe(updatedName);
                });
            });
        });

        describe(`when several examples have been registered`, () => {
            // Note that decorators are applied "bottom to top"
            @CoscradDataExample({
                example: {
                    priority: 2,
                    name: 'dance',
                },
            })
            @CoscradDataExample({
                example: {
                    priority: 1,
                    name: 'shop',
                },
            })
            class TodoItem {
                public priority: number;
                public name: string;

                constructor(priority: number, name: string) {
                    this.priority = priority;
                    this.name = name;
                }

                public static fromDto({ priority, name }: DTO<TodoItem>): TodoItem {
                    return new TodoItem(priority, name);
                }
            }
            it(`should use the first example`, () => {
                const result = buildTestInstance(TodoItem);

                expect(result).toBeInstanceOf(TodoItem);

                const { priority, name } = result;

                expect(priority).toBe(1);

                expect(name).toBe('shop');
            });
        });
    });

    describe(`when the decorated class does not have a static factory method called "fromDto"`, () => {
        @CoscradDataExample({
            example: {
                priority: 1,
                name: 'shop',
            },
        })
        class TodoItem {
            public priority: number;
            public name: string;
        }

        it(`should throw`, () => {
            const tryIt = () => {
                buildTestInstance(TodoItem);
            };

            expect(tryIt).toThrow();
        });
    });
});
