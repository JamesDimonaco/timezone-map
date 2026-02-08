// Mapping of ISO 3166-1 numeric country codes to their primary UTC offset key
// For countries with multiple timezones, we use the most populous region's offset
export const countryTimezoneMap: Record<string, string> = {
  // Africa
  "012": "UTC+1",   // Algeria
  "024": "UTC+1",   // Angola
  "072": "UTC+2",   // Botswana
  "854": "UTC+0",   // Burkina Faso
  "108": "UTC+2",   // Burundi
  "120": "UTC+1",   // Cameroon
  "140": "UTC+1",   // Central African Republic
  "148": "UTC+1",   // Chad
  "174": "UTC+3",   // Comoros
  "178": "UTC+1",   // Congo
  "180": "UTC+2",   // DR Congo (Kinshasa)
  "262": "UTC+3",   // Djibouti
  "818": "UTC+2",   // Egypt
  "226": "UTC+1",   // Equatorial Guinea
  "232": "UTC+3",   // Eritrea
  "748": "UTC+2",   // Eswatini
  "231": "UTC+3",   // Ethiopia
  "266": "UTC+1",   // Gabon
  "270": "UTC+0",   // Gambia
  "288": "UTC+0",   // Ghana
  "324": "UTC+0",   // Guinea
  "624": "UTC+0",   // Guinea-Bissau
  "384": "UTC+0",   // Ivory Coast
  "404": "UTC+3",   // Kenya
  "426": "UTC+2",   // Lesotho
  "430": "UTC+0",   // Liberia
  "434": "UTC+2",   // Libya
  "450": "UTC+3",   // Madagascar
  "454": "UTC+2",   // Malawi
  "466": "UTC+0",   // Mali
  "478": "UTC+0",   // Mauritania
  "504": "UTC+1",   // Morocco
  "508": "UTC+2",   // Mozambique
  "516": "UTC+2",   // Namibia
  "562": "UTC+1",   // Niger
  "566": "UTC+1",   // Nigeria
  "646": "UTC+2",   // Rwanda
  "678": "UTC+0",   // Sao Tome & Principe
  "686": "UTC+0",   // Senegal
  "694": "UTC+0",   // Sierra Leone
  "706": "UTC+3",   // Somalia
  "710": "UTC+2",   // South Africa
  "728": "UTC+2",   // South Sudan
  "729": "UTC+2",   // Sudan
  "834": "UTC+3",   // Tanzania
  "768": "UTC+0",   // Togo
  "788": "UTC+1",   // Tunisia
  "800": "UTC+3",   // Uganda
  "894": "UTC+2",   // Zambia
  "716": "UTC+2",   // Zimbabwe
  "204": "UTC+1",   // Benin

  // Europe
  "008": "UTC+1",   // Albania
  "020": "UTC+1",   // Andorra
  "040": "UTC+1",   // Austria
  "112": "UTC+3",   // Belarus
  "056": "UTC+1",   // Belgium
  "070": "UTC+1",   // Bosnia and Herzegovina
  "100": "UTC+2",   // Bulgaria
  "191": "UTC+1",   // Croatia
  "196": "UTC+2",   // Cyprus
  "203": "UTC+1",   // Czech Republic
  "208": "UTC+1",   // Denmark
  "233": "UTC+2",   // Estonia
  "246": "UTC+2",   // Finland
  "250": "UTC+1",   // France
  "276": "UTC+1",   // Germany
  "300": "UTC+2",   // Greece
  "348": "UTC+1",   // Hungary
  "352": "UTC+0",   // Iceland
  "372": "UTC+0",   // Ireland
  "380": "UTC+1",   // Italy
  "498": "UTC+2",   // Moldova
  "499": "UTC+1",   // Montenegro
  "528": "UTC+1",   // Netherlands
  "807": "UTC+1",   // North Macedonia
  "578": "UTC+1",   // Norway
  "616": "UTC+1",   // Poland
  "620": "UTC+0",   // Portugal
  "642": "UTC+2",   // Romania
  "688": "UTC+1",   // Serbia
  "703": "UTC+1",   // Slovakia
  "705": "UTC+1",   // Slovenia
  "724": "UTC+1",   // Spain
  "752": "UTC+1",   // Sweden
  "756": "UTC+1",   // Switzerland
  "804": "UTC+2",   // Ukraine
  "826": "UTC+0",   // United Kingdom
  "440": "UTC+2",   // Lithuania
  "428": "UTC+2",   // Latvia
  "442": "UTC+1",   // Luxembourg

  // Asia
  "004": "UTC+4:30",  // Afghanistan
  "051": "UTC+4",   // Armenia
  "031": "UTC+4",   // Azerbaijan
  "050": "UTC+6",   // Bangladesh
  "064": "UTC+6",   // Bhutan
  "096": "UTC+8",   // Brunei
  "116": "UTC+7",   // Cambodia
  "156": "UTC+8",   // China
  "158": "UTC+8",   // Taiwan
  "268": "UTC+4",   // Georgia
  "356": "UTC+5:30",  // India
  "360": "UTC+7",   // Indonesia (Jakarta)
  "364": "UTC+3:30",  // Iran
  "368": "UTC+3",   // Iraq
  "376": "UTC+2",   // Israel
  "392": "UTC+9",   // Japan
  "400": "UTC+3",   // Jordan
  "398": "UTC+6",   // Kazakhstan
  "408": "UTC+9",   // North Korea
  "410": "UTC+9",   // South Korea
  "414": "UTC+3",   // Kuwait
  "417": "UTC+6",   // Kyrgyzstan
  "418": "UTC+7",   // Laos
  "422": "UTC+2",   // Lebanon
  "458": "UTC+8",   // Malaysia
  "496": "UTC+8",   // Mongolia
  "104": "UTC+6:30",  // Myanmar
  "524": "UTC+5:45",  // Nepal
  "512": "UTC+4",   // Oman
  "586": "UTC+5",   // Pakistan
  "275": "UTC+2",   // Palestine
  "608": "UTC+8",   // Philippines
  "634": "UTC+3",   // Qatar
  "682": "UTC+3",   // Saudi Arabia
  "702": "UTC+8",   // Singapore (not in 110m, but just in case)
  "144": "UTC+5:30",  // Sri Lanka
  "760": "UTC+3",   // Syria
  "762": "UTC+5",   // Tajikistan
  "764": "UTC+7",   // Thailand
  "795": "UTC+5",   // Turkmenistan
  "784": "UTC+4",   // UAE
  "860": "UTC+5",   // Uzbekistan
  "704": "UTC+7",   // Vietnam
  "887": "UTC+3",   // Yemen

  // North America
  "124": "UTC-5",   // Canada (Eastern)
  "484": "UTC-6",   // Mexico
  "840": "UTC-5",   // United States (Eastern)
  "044": "UTC-5",   // Bahamas
  "084": "UTC-6",   // Belize
  "188": "UTC-6",   // Costa Rica
  "192": "UTC-5",   // Cuba
  "214": "UTC-4",   // Dominican Republic
  "222": "UTC-6",   // El Salvador
  "320": "UTC-6",   // Guatemala
  "332": "UTC-5",   // Haiti
  "340": "UTC-6",   // Honduras
  "388": "UTC-5",   // Jamaica
  "558": "UTC-6",   // Nicaragua
  "591": "UTC-5",   // Panama
  "630": "UTC-4",   // Puerto Rico
  "780": "UTC-4",   // Trinidad and Tobago

  // South America
  "032": "UTC-3",   // Argentina
  "068": "UTC-4",   // Bolivia
  "076": "UTC-3",   // Brazil (Brasilia)
  "152": "UTC-4",   // Chile
  "170": "UTC-5",   // Colombia
  "218": "UTC-5",   // Ecuador
  "238": "UTC-3",   // Falkland Islands
  "254": "UTC-3",   // French Guiana
  "328": "UTC-4",   // Guyana
  "600": "UTC-4",   // Paraguay
  "604": "UTC-5",   // Peru
  "740": "UTC-3",   // Suriname
  "858": "UTC-3",   // Uruguay
  "862": "UTC-4",   // Venezuela

  // Oceania
  "036": "UTC+10",  // Australia (Eastern)
  "090": "UTC+11",  // Solomon Islands
  "242": "UTC+12",  // Fiji
  "540": "UTC+11",  // New Caledonia
  "554": "UTC+12",  // New Zealand
  "548": "UTC+11",  // Vanuatu
  "598": "UTC+10",  // Papua New Guinea

  // Russia and Central Asia
  "643": "UTC+3",   // Russia (Moscow)

  // Turkey
  "792": "UTC+3",   // Turkey

  // Greenland
  "304": "UTC-3",   // Greenland

  // Western Sahara
  "732": "UTC+1",   // Western Sahara

  // Antarctica (skip - leave uncolored)
  "010": "",         // Antarctica

  // Small/special territories
  "260": "UTC-3",   // French Southern Territories
  "626": "UTC+9",   // Timor-Leste
};
