import { LanguageEnum } from './contracts.js'
import { Item } from './item.js'

/**
 * Single source of truth for every supported Language enum code: its display
 * label and the canonical BCP-47 locale tag (e.g. "it-IT") accepted by Intl
 * APIs and moment's locale loader. LanguageCatalog and LanguageLocaleMap are
 * both derived from this record so the two never drift out of sync.
 */
const LanguageOptions: Record<LanguageEnum, { label: string; locale: string }> = {
    EN: { label: 'English', locale: 'en-US' },
    ES: { label: 'Spanish', locale: 'es-ES' },
    FR: { label: 'French', locale: 'fr-FR' },
    DE: { label: 'German', locale: 'de-DE' },
    IT: { label: 'Italian', locale: 'it-IT' },
    PT: { label: 'Portuguese', locale: 'pt-PT' },
    NL: { label: 'Dutch', locale: 'nl-NL' },
    RU: { label: 'Russian', locale: 'ru-RU' },
    ZH: { label: 'Chinese', locale: 'zh-CN' },
    JA: { label: 'Japanese', locale: 'ja-JP' },
    KO: { label: 'Korean', locale: 'ko-KR' },
    AR: { label: 'Arabic', locale: 'ar-SA' },
    HI: { label: 'Hindi', locale: 'hi-IN' },
    TH: { label: 'Thai', locale: 'th-TH' },
    VI: { label: 'Vietnamese', locale: 'vi-VN' },
    TR: { label: 'Turkish', locale: 'tr-TR' },
    PL: { label: 'Polish', locale: 'pl-PL' },
    CS: { label: 'Czech', locale: 'cs-CZ' },
    HU: { label: 'Hungarian', locale: 'hu-HU' },
    RO: { label: 'Romanian', locale: 'ro-RO' },
    BG: { label: 'Bulgarian', locale: 'bg-BG' },
    HR: { label: 'Croatian', locale: 'hr-HR' },
    SK: { label: 'Slovak', locale: 'sk-SK' },
    SL: { label: 'Slovenian', locale: 'sl-SI' },
    ET: { label: 'Estonian', locale: 'et-EE' },
    LV: { label: 'Latvian', locale: 'lv-LV' },
    LT: { label: 'Lithuanian', locale: 'lt-LT' },
    MT: { label: 'Maltese', locale: 'mt-MT' },
    FI: { label: 'Finnish', locale: 'fi-FI' },
    SV: { label: 'Swedish', locale: 'sv-SE' },
    DA: { label: 'Danish', locale: 'da-DK' },
    NO: { label: 'Norwegian', locale: 'no-NO' },
    IS: { label: 'Icelandic', locale: 'is-IS' },
    EL: { label: 'Greek', locale: 'el-GR' },
    HE: { label: 'Hebrew', locale: 'he-IL' },
    FA: { label: 'Persian', locale: 'fa-IR' },
    UR: { label: 'Urdu', locale: 'ur-PK' },
    BN: { label: 'Bengali', locale: 'bn-BD' },
    TA: { label: 'Tamil', locale: 'ta-IN' },
    TE: { label: 'Telugu', locale: 'te-IN' },
    ML: { label: 'Malayalam', locale: 'ml-IN' },
    KN: { label: 'Kannada', locale: 'kn-IN' },
    GU: { label: 'Gujarati', locale: 'gu-IN' },
    MR: { label: 'Marathi', locale: 'mr-IN' },
    PA: { label: 'Punjabi', locale: 'pa-IN' },
    OR: { label: 'Odia', locale: 'or-IN' },
    AS: { label: 'Assamese', locale: 'as-IN' },
    NE: { label: 'Nepali', locale: 'ne-NP' },
    SI: { label: 'Sinhala', locale: 'si-LK' },
    MY: { label: 'Burmese', locale: 'my-MM' },
    KH: { label: 'Khmer', locale: 'km-KH' },
    LO: { label: 'Lao', locale: 'lo-LA' },
    KA: { label: 'Georgian', locale: 'ka-GE' },
    AM: { label: 'Amharic', locale: 'am-ET' },
    TI: { label: 'Tigrinya', locale: 'ti-ET' },
    SW: { label: 'Swahili', locale: 'sw-TZ' },
    ZU: { label: 'Zulu', locale: 'zu-ZA' },
    AF: { label: 'Afrikaans', locale: 'af-ZA' },
    XH: { label: 'Xhosa', locale: 'xh-ZA' },
    ST: { label: 'Southern Sotho', locale: 'st-ZA' },
    TN: { label: 'Tswana', locale: 'tn-ZA' },
    SS: { label: 'Swati', locale: 'ss-ZA' },
    VE: { label: 'Venda', locale: 've-ZA' },
    TS: { label: 'Tsonga', locale: 'ts-ZA' },
    NR: { label: 'Ndebele', locale: 'nr-ZA' },
    IG: { label: 'Igbo', locale: 'ig-NG' },
    YO: { label: 'Yoruba', locale: 'yo-NG' },
    HA: { label: 'Hausa', locale: 'ha-NG' },
    FF: { label: 'Fulah', locale: 'ff-SN' },
    WO: { label: 'Wolof', locale: 'wo-SN' },
    BM: { label: 'Bambara', locale: 'bm-ML' },
    DY: { label: 'Dyula', locale: 'dyu-CI' },
    SN: { label: 'Shona', locale: 'sn-ZW' }
}

export const LanguageCatalog: Item<LanguageEnum>[] = Object.entries(LanguageOptions).map(([value, { label }]) => ({
    label,
    value: value as LanguageEnum
}))

export const LanguageLocaleMap: Record<LanguageEnum, string> = Object.fromEntries(
    Object.entries(LanguageOptions).map(([value, { locale }]) => [value, locale])
) as Record<LanguageEnum, string>
