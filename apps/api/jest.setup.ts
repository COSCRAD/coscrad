import 'reflect-metadata';

afterAll(() => {
    if (typeof global.gc === 'function') global.gc();
});
