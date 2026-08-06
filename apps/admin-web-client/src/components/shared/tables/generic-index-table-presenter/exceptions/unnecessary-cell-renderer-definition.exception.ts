export class UnnecessaryCellRendererDefinitionException extends Error {
    constructor(cellRendererKeysNotInHeadings: string[]) {
        const msg = [
            `The following renderers are unnecessary,`,
            `as the corresponding properties are not part of the heading definition:\n`,
            cellRendererKeysNotInHeadings.join(' '),
        ].join(' ');

        super(msg);
    }
}
