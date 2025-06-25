import { InternalError } from '../../../../../lib/errors/InternalError';
import { parseTermRawData, TermDataLineage } from './parse-term-raw-data';

describe(`parseTermRawData`, () => {
    describe(`when the raw data is missing`, () => {
        describe(`when rawData is null`, () => {
            it(`should return an empty object`, () => {
                const result = parseTermRawData(null);

                expect(result).toEqual({});
            });
        });

        describe(`when rawData is undefined`, () => {
            const result = parseTermRawData(undefined);

            expect(result).toEqual({});
        });
    });

    describe(`when the raw data is provided`, () => {
        describe(`when the property "possibleAudioFilenames" is provided`, () => {
            describe(`when the type is valid`, () => {
                const rawData = {
                    possibleAudioFilenames: ['123a', 'song123'],
                };

                it(`should return the correct result`, () => {
                    const result = parseTermRawData(rawData);

                    expect(result).not.toBeInstanceOf(InternalError);

                    const { possibleAudioFilenames } = result as TermDataLineage;

                    expect(possibleAudioFilenames).toEqual(rawData.possibleAudioFilenames);
                });
            });

            describe(`when the type is invalid (not a string array)`, () => {
                const invalidRawData = {
                    possibleAudioFilenames: 70,
                };

                it(`should return a type error`, () => {
                    const result = parseTermRawData(invalidRawData);

                    expect(result).toBeInstanceOf(InternalError);

                    const invalidMessages = [result.toString()].filter(
                        (s) => !s.toLowerCase().includes('list of non-empty text')
                    );

                    expect(invalidMessages).toEqual([]);
                });
            });
        });

        describe(`when the property "audioFilename" is provided`, () => {
            describe(`when the type is valid`, () => {
                const rawData = {
                    audioFilename: 'foobarmama',
                };

                it(`should return the correct result`, () => {
                    const result = parseTermRawData(rawData);

                    expect(result).not.toBeInstanceOf(InternalError);

                    const { possibleAudioFilenames } = result as TermDataLineage;

                    expect(possibleAudioFilenames).toHaveLength(1);

                    expect(possibleAudioFilenames[0]).toBe(rawData.audioFilename);
                });
            });

            describe(`when the type is invalid (not a non-empty string)`, () => {
                const invalidRawData = {
                    audioFilename: ['why cannot I be an array?!'],
                };

                it(`should have a test`, () => {
                    const result = parseTermRawData(invalidRawData);

                    expect(result).toBeInstanceOf(InternalError);

                    const invalidMessages = [result.toString()].filter(
                        (s) => !s.toLowerCase().includes('non-empty text')
                    );

                    expect(invalidMessages).toEqual([]);
                });
            });
        });

        describe(`when both properties are provided`, () => {
            const rawData = {
                possibleAudioFilenames: ['111', 'goodone'],
                audioFilename: '134',
            };

            it(`should merge the properties into a single list`, () => {
                const result = parseTermRawData(rawData);

                expect(result).not.toBeInstanceOf(InternalError);

                const { possibleAudioFilenames } = result as TermDataLineage;

                expect(possibleAudioFilenames).toHaveLength(
                    rawData.possibleAudioFilenames.length + 1
                );

                const missingFilenames = possibleAudioFilenames.filter(
                    (filename) =>
                        ![...rawData.possibleAudioFilenames, rawData.audioFilename].includes(
                            filename
                        )
                );

                expect(missingFilenames).toEqual([]);
            });
        });
    });
});
