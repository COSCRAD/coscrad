/**
 * Eventually, we should make the set of languages available configurable. For
 * now, we statically define the same set for all instances of COSCRAD.
 *
 * Note that we want to use the official ISO 639-3 language codes standard
 * in case we need interoperability with other systems.
 *
 * https://iso639-3.sil.org/code_tables/639/data
 */
export enum LanguageCode {
    Chilcotin = 'clc',
    Haida = 'hai',
    English = 'en',
    French = 'fra',
    Chinook = 'chn',
    Zapotec = 'zap',
    Spanish = 'spa',
}
