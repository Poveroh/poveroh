import { z } from '../zod'

/**
 * Timezone enum representing the various timezones that can be used in the application
 */
export const TimezoneEnum = z
    .enum([
        'AFRICA_ALGIERS',
        'AFRICA_CAIRO',
        'AFRICA_CASABLANCA',
        'AFRICA_HARARE',
        'AFRICA_JOHANNESBURG',
        'AFRICA_MONROVIA',
        'AFRICA_NAIROBI',
        'AFRICA_WEST_CENTRAL',

        'AMERICA_ARGENTINA_BUENOS_AIRES',
        'AMERICA_BOGOTA',
        'AMERICA_CARACAS',
        'AMERICA_CHICAGO',
        'AMERICA_CHIHUAHUA',
        'AMERICA_DENVER',
        'AMERICA_GUATEMALA',
        'AMERICA_GUYANA',
        'AMERICA_HALIFAX',
        'AMERICA_INDIANA_INDIANAPOLIS',
        'AMERICA_JUNEAU',
        'AMERICA_LA_PAZ',
        'AMERICA_LIMA',
        'AMERICA_QUITO',
        'AMERICA_LOS_ANGELES',
        'AMERICA_MAZATLAN',
        'AMERICA_MEXICO_CITY',
        'AMERICA_GUADALAJARA',
        'AMERICA_MONTERREY',
        'AMERICA_MONTEVIDEO',
        'AMERICA_NEW_YORK',
        'AMERICA_PHOENIX',
        'AMERICA_PUERTO_RICO',
        'AMERICA_REGINA',
        'AMERICA_SANTIAGO',
        'AMERICA_SAO_PAULO',
        'AMERICA_ST_JOHNS',
        'AMERICA_TIJUANA',

        'ASIA_ALMATY',
        'ASIA_ASTANA',
        'ASIA_BAGHDAD',
        'ASIA_BAKU',
        'ASIA_BANGKOK',
        'ASIA_CHENNAI',
        'ASIA_HANOI',
        'ASIA_CHONGQING',
        'ASIA_COLOMBO',
        'ASIA_DHAKA',
        'ASIA_HONG_KONG',
        'ASIA_IRKUTSK',
        'ASIA_JAKARTA',
        'ASIA_JERUSALEM',
        'ASIA_KABUL',
        'ASIA_KAMCHATKA',
        'ASIA_KARACHI',
        'ASIA_ISLAMABAD',
        'ASIA_KATHMANDU',
        'ASIA_KOLKATA',
        'ASIA_MUMBAI',
        'ASIA_NEW_DELHI',
        'ASIA_KRASNOYARSK',
        'ASIA_KUALA_LUMPUR',
        'ASIA_KUWAIT',
        'ASIA_MAGADAN',
        'ASIA_MUSCAT',
        'ASIA_ABU_DHABI',
        'ASIA_NOVOSIBIRSK',
        'ASIA_RIYADH',
        'ASIA_SEOUL',
        'ASIA_SHANGHAI',
        'ASIA_SINGAPORE',
        'ASIA_SREDNEKOLYMSK',
        'ASIA_TAIPEI',
        'ASIA_TASHKENT',
        'ASIA_TBILISI',
        'ASIA_TEHRAN',
        'ASIA_TOKYO',
        'ASIA_OSAKA',
        'ASIA_SAPPORO',
        'ASIA_ULAANBAATAR',
        'ASIA_URUMQI',
        'ASIA_VLADIVOSTOK',
        'ASIA_YAKUTSK',
        'ASIA_YEKATERINBURG',
        'ASIA_YEREVAN',

        'ATLANTIC_AZORES',
        'ATLANTIC_CAPE_VERDE',
        'ATLANTIC_SOUTH_GEORGIA',

        'AUSTRALIA_ADELAIDE',
        'AUSTRALIA_BRISBANE',
        'AUSTRALIA_CANBERRA',
        'AUSTRALIA_DARWIN',
        'AUSTRALIA_HOBART',
        'AUSTRALIA_MELBOURNE',
        'AUSTRALIA_PERTH',
        'AUSTRALIA_SYDNEY',

        'ETC_GMT_PLUS_12',
        'ETC_UTC',

        'EUROPE_AMSTERDAM',
        'EUROPE_ATHENS',
        'EUROPE_BELGRADE',
        'EUROPE_BERN',
        'EUROPE_BERLIN',
        'EUROPE_BRATISLAVA',
        'EUROPE_BRUSSELS',
        'EUROPE_BUCHAREST',
        'EUROPE_BUDAPEST',
        'EUROPE_COPENHAGEN',
        'EUROPE_DUBLIN',
        'EUROPE_HELSINKI',
        'EUROPE_ISTANBUL',
        'EUROPE_KALININGRAD',
        'EUROPE_LISBON',
        'EUROPE_LJUBLJANA',
        'EUROPE_LONDON',
        'EUROPE_EDINBURGH',
        'EUROPE_MADRID',
        'EUROPE_MINSK',
        'EUROPE_MOSCOW',
        'EUROPE_ST_PETERSBURG',
        'EUROPE_PARIS',
        'EUROPE_PRAGUE',
        'EUROPE_RIGA',
        'EUROPE_ROME',
        'EUROPE_SAMARA',
        'EUROPE_SARAJEVO',
        'EUROPE_SKOPJE',
        'EUROPE_SOFIA',
        'EUROPE_STOCKHOLM',
        'EUROPE_TALLINN',
        'EUROPE_VIENNA',
        'EUROPE_VILNIUS',
        'EUROPE_VOLGOGRAD',
        'EUROPE_WARSAW',
        'EUROPE_ZAGREB',
        'EUROPE_ZURICH',

        'PACIFIC_APIA',
        'PACIFIC_AUCKLAND',
        'PACIFIC_WELLINGTON',
        'PACIFIC_CHATHAM',
        'PACIFIC_FAKAOFO',
        'PACIFIC_FIJI',
        'PACIFIC_GUADALCANAL',
        'PACIFIC_GUAM',
        'PACIFIC_HONOLULU',
        'PACIFIC_MAJURO',
        'PACIFIC_MIDWAY',
        'PACIFIC_NOUMEA',
        'PACIFIC_PAGO_PAGO',
        'PACIFIC_PORT_MORESBY',
        'PACIFIC_TONGATAPU'
    ])
    .openapi('TimezoneEnum')

/**
 * Snapshot frequency enum representing how often snapshots are created
 */
export const SnapshotFrequencyEnum = z
    .enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL'])
    .openapi('SnapshotFrequencyEnum')

/**
 * Asset type enum representing the supported asset categories
 */
export const AssetTypeEnum = z
    .enum([
        'STOCK',
        'BOND',
        'ETF',
        'MUTUAL_FUND',
        'CRYPTOCURRENCY',
        'REAL_ESTATE',
        'COLLECTIBLE',
        'PRIVATE_EQUITY',
        'VENTURE_CAPITAL',
        'PRIVATE_DEBT',
        'P2P_LENDING',
        'INSURANCE_POLICY',
        'AGRICULTURAL_LAND',
        'OTHER'
    ])
    .openapi('AssetTypeEnum')

/**
 * Financial account type enum representing the supported account categories
 */
export const FinancialAccountTypeEnum = z
    .enum([
        'ONLINE_BANK',
        'BANK_ACCOUNT',
        'CIRCUIT',
        'DEPOSIT_BANK',
        'BROKER',
        'WALLET',
        'CASH',
        'CREDIT_CARD',
        'OTHER'
    ])
    .openapi('FinancialAccountTypeEnum')

/**
 * Transaction action enum representing the available transaction actions
 */
export const TransactionActionEnum = z.enum(['EXPENSES', 'INCOME', 'TRANSFER']).openapi('TransactionActionEnum')

/**
 * Transaction status enum representing the transaction processing states
 */
export const TransactionStatusEnum = z
    .enum(['APPROVED', 'REJECTED', 'IMPORT_PENDING', 'IMPORT_REJECTED', 'IMPORT_APPROVED'])
    .openapi('TransactionStatusEnum')

/**
 * Import transaction status enum representing the allowed statuses when approving/rejecting import transactions
 */
export const ImportTransactionStatusEnum = z
    .enum(['IMPORT_APPROVED', 'IMPORT_REJECTED'])
    .openapi('ImportTransactionStatusEnum')

/**
 * Currency enum representing the supported currencies in the application
 */
export const CurrencyEnum = z
    .enum([
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CNY',
        'INR',
        'AUD',
        'CAD',
        'CHF',
        'SEK',
        'NZD',
        'MXN',
        'SGD',
        'HKD',
        'NOK',
        'KRW',
        'TRY',
        'UNKNOWN'
    ])
    .openapi('CurrencyEnum')

/**
 * Remember period enum representing available session persistence durations
 */
export const RememberPeriodEnum = z
    .enum(['SAME_DAY', 'THREE_DAYS', 'SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'NINETY_DAYS'])
    .openapi('RememberPeriodEnum')

/**
 * Cycle period enum representing the supported cycle periods
 */
export const CyclePeriodEnum = z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).openapi('CyclePeriodEnum')

/**
 * Appearance mode enum representing the available branding display modes
 */
export const AppearanceModeEnum = z.enum(['LOGO', 'ICON']).openapi('AppearanceModeEnum')

/**
 * File type enum representing the supported export file formats
 */
export const FileTypeEnum = z.enum(['CSV', 'PDF']).openapi('FileTypeEnum')

/**
 * Language enum representing the supported localization languages
 */
export const LanguageEnum = z
    .enum([
        'EN',
        'ES',
        'FR',
        'DE',
        'IT',
        'PT',
        'NL',
        'RU',
        'ZH',
        'JA',
        'KO',
        'AR',
        'HI',
        'TH',
        'VI',
        'TR',
        'PL',
        'CS',
        'HU',
        'RO',
        'BG',
        'HR',
        'SK',
        'SL',
        'ET',
        'LV',
        'LT',
        'MT',
        'FI',
        'SV',
        'DA',
        'NO',
        'IS',
        'EL',
        'HE',
        'FA',
        'UR',
        'BN',
        'TA',
        'TE',
        'ML',
        'KN',
        'GU',
        'MR',
        'PA',
        'OR',
        'AS',
        'NE',
        'SI',
        'MY',
        'KH',
        'LO',
        'KA',
        'AM',
        'TI',
        'SW',
        'ZU',
        'AF',
        'XH',
        'ST',
        'TN',
        'SS',
        'VE',
        'TS',
        'NR',
        'IG',
        'YO',
        'HA',
        'FF',
        'WO',
        'BM',
        'DY',
        'SN'
    ])
    .openapi('LanguageEnum')

/**
 * Date format enum representing the available date display formats
 */
export const DateFormatEnum = z
    .enum([
        'DD_MM_YYYY',
        'MM_DD_YYYY',
        'YYYY_MM_DD',
        'DD_MM_YY',
        'MM_DD_YY',
        'YY_MM_DD',
        'DD_MMMM_YYYY',
        'MMMM_DD_YYYY',
        'YYYY_MMMM_DD'
    ])
    .openapi('DateFormatEnum')

/**
 * Onboarding step enum representing the user onboarding workflow stages
 * In order: EMAIL -> GENERALITES -> PREFERENCES -> COMPLETED
 */
export const OnBoardingStepEnum = z
    .enum(['EMAIL', 'GENERALITES', 'PREFERENCES', 'COMPLETED'])
    .openapi('OnBoardingStepEnum')

/**
 * Countries enum representing the supported country values
 */
export const CountriesEnum = z
    .enum([
        'AFGHANISTAN',
        'ALBANIA',
        'ALGERIA',
        'ANDORRA',
        'ANGOLA',
        'ANTIGUA_AND_BARBUDA',
        'ARGENTINA',
        'ARMENIA',
        'AUSTRALIA',
        'AUSTRIA',
        'AZERBAIJAN',
        'BAHAMAS',
        'BAHRAIN',
        'BANGLADESH',
        'BARBADOS',
        'BELARUS',
        'BELGIUM',
        'BELIZE',
        'BENIN',
        'BHUTAN',
        'BOLIVIA',
        'BOSNIA_AND_HERZEGOVINA',
        'BOTSWANA',
        'BRAZIL',
        'BRUNEI',
        'BULGARIA',
        'BURKINA_FASO',
        'BURUNDI',
        'CABO_VERDE',
        'CAMBODIA',
        'CAMEROON',
        'CANADA',
        'CENTRAL_AFRICAN_REPUBLIC',
        'CHAD',
        'CHILE',
        'CHINA',
        'COLOMBIA',
        'COMOROS',
        'CONGO_DEMOCRATIC_REPUBLIC',
        'CONGO_REPUBLIC',
        'COSTA_RICA',
        'CROATIA',
        'CUBA',
        'CYPRUS',
        'CZECH_REPUBLIC',
        'DENMARK',
        'DJIBOUTI',
        'DOMINICA',
        'DOMINICAN_REPUBLIC',
        'ECUADOR',
        'EGYPT',
        'EL_SALVADOR',
        'EQUATORIAL_GUINEA',
        'ERITREA',
        'ESTONIA',
        'ESWATINI',
        'ETHIOPIA',
        'FIJI',
        'FINLAND',
        'FRANCE',
        'GABON',
        'GAMBIA',
        'GEORGIA',
        'GERMANY',
        'GHANA',
        'GREECE',
        'GRENADA',
        'GUATEMALA',
        'GUINEA',
        'GUINEA_BISSAU',
        'GUYANA',
        'HAITI',
        'HONDURAS',
        'HUNGARY',
        'ICELAND',
        'INDIA',
        'INDONESIA',
        'IRAN',
        'IRAQ',
        'IRELAND',
        'ISRAEL',
        'ITALY',
        'JAMAICA',
        'JAPAN',
        'JORDAN',
        'KAZAKHSTAN',
        'KENYA',
        'KIRIBATI',
        'KOREA_NORTH',
        'KOREA_SOUTH',
        'KUWAIT',
        'KYRGYZSTAN',
        'LAOS',
        'LATVIA',
        'LEBANON',
        'LESOTHO',
        'LIBERIA',
        'LIBYA',
        'LIECHTENSTEIN',
        'LITHUANIA',
        'LUXEMBOURG',
        'MADAGASCAR',
        'MALAWI',
        'MALAYSIA',
        'MALDIVES',
        'MALI',
        'MALTA',
        'MARSHALL_ISLANDS',
        'MAURITANIA',
        'MAURITIUS',
        'MEXICO',
        'MICRONESIA',
        'MOLDOVA',
        'MONACO',
        'MONGOLIA',
        'MONTENEGRO',
        'MOROCCO',
        'MOZAMBIQUE',
        'MYANMAR',
        'NAMIBIA',
        'NAURU',
        'NEPAL',
        'NETHERLANDS',
        'NEW_ZEALAND',
        'NICARAGUA',
        'NIGER',
        'NIGERIA',
        'NORTH_MACEDONIA',
        'NORWAY',
        'OMAN',
        'PAKISTAN',
        'PALAU',
        'PALESTINE',
        'PANAMA',
        'PAPUA_NEW_GUINEA',
        'PARAGUAY',
        'PERU',
        'PHILIPPINES',
        'POLAND',
        'PORTUGAL',
        'QATAR',
        'ROMANIA',
        'RUSSIA',
        'RWANDA',
        'SAINT_KITTS_AND_NEVIS',
        'SAINT_LUCIA',
        'SAINT_VINCENT_AND_GRENADINES',
        'SAMOA',
        'SAN_MARINO',
        'SAO_TOME_AND_PRINCIPE',
        'SAUDI_ARABIA',
        'SENEGAL',
        'SERBIA',
        'SEYCHELLES',
        'SIERRA_LEONE',
        'SINGAPORE',
        'SLOVAKIA',
        'SLOVENIA',
        'SOLOMON_ISLANDS',
        'SOMALIA',
        'SOUTH_AFRICA',
        'SOUTH_SUDAN',
        'SPAIN',
        'SRI_LANKA',
        'SUDAN',
        'SURINAME',
        'SWEDEN',
        'SWITZERLAND',
        'SYRIA',
        'TAIWAN',
        'TAJIKISTAN',
        'TANZANIA',
        'THAILAND',
        'TIMOR_LESTE',
        'TOGO',
        'TONGA',
        'TRINIDAD_AND_TOBAGO',
        'TUNISIA',
        'TURKEY',
        'TURKMENISTAN',
        'TUVALU',
        'UGANDA',
        'UKRAINE',
        'UNITED_ARAB_EMIRATES',
        'UNITED_KINGDOM',
        'UNITED_STATES',
        'URUGUAY',
        'UZBEKISTAN',
        'VANUATU',
        'VATICAN_CITY',
        'VENEZUELA',
        'VIETNAM',
        'YEMEN',
        'ZAMBIA',
        'ZIMBABWE'
    ])
    .openapi('CountriesEnum')

/**
 * Dashboard widget enum representing the available dashboard widget types, which are used to identify the widgets in the dashboard layout and rendering logic
 */
export const DashboardWidgetEnum = z
    .enum([
        'net-worth-evolution',
        'kpi-row',
        'liquidity-evolution',
        'income-expense-month',
        'month-comparison',
        'category-trend',
        'account-balances',
        'expense-macro-distribution',
        'recent-transactions'
    ])
    .openapi('DashboardWidgetEnum')

/**
 * Col span enum representing the allowed column spans for dashboard widgets, where 12 is full width, 6 is half width, 4 is one third, and 3 is one quarter
 */
export const ColSpanEnum = z.enum(['12', '6', '4', '3']).openapi('ColSpanEnum')
