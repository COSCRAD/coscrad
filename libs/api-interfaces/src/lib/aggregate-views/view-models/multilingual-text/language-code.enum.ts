/**
 * Eventually, we should make the set of langauges available configurable. For
 * now, we statically define the same set for all instances of COSCRAD.
 *
 * Note that we want to use the official ISO 639-3 langauge codes standard
 * in case we need interoperability with other systems.
 *
 * https://iso639-3.sil.org/code_tables/639/data
 */
export enum LanguageCode {
    chilcotin = 'clc',
    haida = 'hai',
    english = 'eng',
    french = 'fra',
    chinook = 'chn',
}
