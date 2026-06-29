export interface CityEntry { city: string; country: string; }

export const WORLD_CITIES: CityEntry[] = [
  // ── Nigeria ──────────────────────────────────────────────────────────────
  { city: 'Lagos',          country: 'Nigeria' }, { city: 'Abuja',         country: 'Nigeria' },
  { city: 'Port Harcourt',  country: 'Nigeria' }, { city: 'Kano',          country: 'Nigeria' },
  { city: 'Ibadan',         country: 'Nigeria' }, { city: 'Benin City',    country: 'Nigeria' },
  { city: 'Enugu',          country: 'Nigeria' }, { city: 'Kaduna',        country: 'Nigeria' },
  { city: 'Aba',            country: 'Nigeria' }, { city: 'Warri',         country: 'Nigeria' },
  { city: 'Onitsha',        country: 'Nigeria' }, { city: 'Uyo',           country: 'Nigeria' },
  { city: 'Calabar',        country: 'Nigeria' }, { city: 'Abeokuta',      country: 'Nigeria' },
  { city: 'Jos',            country: 'Nigeria' }, { city: 'Maiduguri',     country: 'Nigeria' },
  { city: 'Sokoto',         country: 'Nigeria' }, { city: 'Zaria',         country: 'Nigeria' },
  { city: 'Owerri',         country: 'Nigeria' }, { city: 'Asaba',         country: 'Nigeria' },
  { city: 'Akure',          country: 'Nigeria' }, { city: 'Osogbo',        country: 'Nigeria' },
  { city: 'Ilorin',         country: 'Nigeria' }, { city: 'Makurdi',       country: 'Nigeria' },
  { city: 'Yola',           country: 'Nigeria' }, { city: 'Bauchi',        country: 'Nigeria' },
  { city: 'Ado-Ekiti',      country: 'Nigeria' }, { city: 'Gombe',         country: 'Nigeria' },
  { city: 'Minna',          country: 'Nigeria' }, { city: 'Lokoja',        country: 'Nigeria' },

  // ── Ghana ─────────────────────────────────────────────────────────────────
  { city: 'Accra',          country: 'Ghana' }, { city: 'Kumasi',         country: 'Ghana' },
  { city: 'Takoradi',       country: 'Ghana' }, { city: 'Tamale',         country: 'Ghana' },
  { city: 'Cape Coast',     country: 'Ghana' }, { city: 'Sunyani',        country: 'Ghana' },
  { city: 'Koforidua',      country: 'Ghana' }, { city: 'Ho',             country: 'Ghana' },
  { city: 'Bolgatanga',     country: 'Ghana' }, { city: 'Wa',             country: 'Ghana' },
  { city: 'Obuasi',         country: 'Ghana' }, { city: 'Techiman',       country: 'Ghana' },

  // ── Kenya ─────────────────────────────────────────────────────────────────
  { city: 'Nairobi',        country: 'Kenya' }, { city: 'Mombasa',        country: 'Kenya' },
  { city: 'Kisumu',         country: 'Kenya' }, { city: 'Nakuru',         country: 'Kenya' },
  { city: 'Eldoret',        country: 'Kenya' }, { city: 'Thika',          country: 'Kenya' },
  { city: 'Malindi',        country: 'Kenya' }, { city: 'Kitale',         country: 'Kenya' },
  { city: 'Garissa',        country: 'Kenya' }, { city: 'Kakamega',       country: 'Kenya' },
  { city: 'Nyeri',          country: 'Kenya' }, { city: 'Machakos',       country: 'Kenya' },

  // ── South Africa ──────────────────────────────────────────────────────────
  { city: 'Johannesburg',   country: 'South Africa' }, { city: 'Cape Town',      country: 'South Africa' },
  { city: 'Durban',         country: 'South Africa' }, { city: 'Pretoria',       country: 'South Africa' },
  { city: 'Port Elizabeth', country: 'South Africa' }, { city: 'Bloemfontein',   country: 'South Africa' },
  { city: 'East London',    country: 'South Africa' }, { city: 'Nelspruit',      country: 'South Africa' },
  { city: 'Kimberley',      country: 'South Africa' }, { city: 'Polokwane',      country: 'South Africa' },
  { city: 'Soweto',         country: 'South Africa' }, { city: 'Sandton',        country: 'South Africa' },
  { city: 'Benoni',         country: 'South Africa' }, { city: 'Tembisa',        country: 'South Africa' },
  { city: 'Pietermaritzburg', country: 'South Africa' }, { city: 'Midrand',      country: 'South Africa' },

  // ── Uganda ────────────────────────────────────────────────────────────────
  { city: 'Kampala',        country: 'Uganda' }, { city: 'Entebbe',        country: 'Uganda' },
  { city: 'Gulu',           country: 'Uganda' }, { city: 'Mbarara',        country: 'Uganda' },
  { city: 'Jinja',          country: 'Uganda' }, { city: 'Mbale',          country: 'Uganda' },
  { city: 'Lira',           country: 'Uganda' }, { city: 'Arua',           country: 'Uganda' },

  // ── Tanzania ──────────────────────────────────────────────────────────────
  { city: 'Dar es Salaam',  country: 'Tanzania' }, { city: 'Mwanza',         country: 'Tanzania' },
  { city: 'Arusha',         country: 'Tanzania' }, { city: 'Moshi',          country: 'Tanzania' },
  { city: 'Dodoma',         country: 'Tanzania' }, { city: 'Zanzibar City',  country: 'Tanzania' },
  { city: 'Tanga',          country: 'Tanzania' }, { city: 'Morogoro',       country: 'Tanzania' },

  // ── Ethiopia ──────────────────────────────────────────────────────────────
  { city: 'Addis Ababa',    country: 'Ethiopia' }, { city: 'Dire Dawa',      country: 'Ethiopia' },
  { city: 'Mekelle',        country: 'Ethiopia' }, { city: 'Gondar',         country: 'Ethiopia' },
  { city: 'Adama',          country: 'Ethiopia' }, { city: 'Bahir Dar',      country: 'Ethiopia' },
  { city: 'Hawassa',        country: 'Ethiopia' }, { city: 'Jimma',          country: 'Ethiopia' },

  // ── Senegal ───────────────────────────────────────────────────────────────
  { city: 'Dakar',          country: 'Senegal' }, { city: 'Thiès',          country: 'Senegal' },
  { city: 'Kaolack',        country: 'Senegal' }, { city: 'Ziguinchor',     country: 'Senegal' },
  { city: 'Saint-Louis',    country: 'Senegal' }, { city: 'Touba',          country: 'Senegal' },

  // ── Cameroon ──────────────────────────────────────────────────────────────
  { city: 'Douala',         country: 'Cameroon' }, { city: 'Yaoundé',        country: 'Cameroon' },
  { city: 'Bamenda',        country: 'Cameroon' }, { city: 'Bafoussam',      country: 'Cameroon' },
  { city: 'Garoua',         country: 'Cameroon' }, { city: 'Maroua',         country: 'Cameroon' },

  // ── Côte d'Ivoire ─────────────────────────────────────────────────────────
  { city: 'Abidjan',        country: "Côte d'Ivoire" }, { city: 'Yamoussoukro', country: "Côte d'Ivoire" },
  { city: 'Bouaké',         country: "Côte d'Ivoire" }, { city: 'Daloa',        country: "Côte d'Ivoire" },
  { city: 'San-Pédro',      country: "Côte d'Ivoire" }, { city: 'Korhogo',      country: "Côte d'Ivoire" },

  // ── Morocco ───────────────────────────────────────────────────────────────
  { city: 'Casablanca',     country: 'Morocco' }, { city: 'Rabat',          country: 'Morocco' },
  { city: 'Fez',            country: 'Morocco' }, { city: 'Marrakech',      country: 'Morocco' },
  { city: 'Tangier',        country: 'Morocco' }, { city: 'Agadir',         country: 'Morocco' },
  { city: 'Meknes',         country: 'Morocco' }, { city: 'Oujda',          country: 'Morocco' },
  { city: 'Kenitra',        country: 'Morocco' }, { city: 'Tétouan',        country: 'Morocco' },

  // ── Egypt ─────────────────────────────────────────────────────────────────
  { city: 'Cairo',          country: 'Egypt' }, { city: 'Alexandria',      country: 'Egypt' },
  { city: 'Giza',           country: 'Egypt' }, { city: 'Port Said',       country: 'Egypt' },
  { city: 'Suez',           country: 'Egypt' }, { city: 'Luxor',           country: 'Egypt' },
  { city: 'Aswan',          country: 'Egypt' }, { city: 'Hurghada',        country: 'Egypt' },
  { city: 'Mansoura',       country: 'Egypt' }, { city: 'Tanta',           country: 'Egypt' },

  // ── Rwanda ────────────────────────────────────────────────────────────────
  { city: 'Kigali',         country: 'Rwanda' }, { city: 'Butare',          country: 'Rwanda' },
  { city: 'Gisenyi',        country: 'Rwanda' }, { city: 'Ruhengeri',       country: 'Rwanda' },

  // ── Zambia ────────────────────────────────────────────────────────────────
  { city: 'Lusaka',         country: 'Zambia' }, { city: 'Ndola',           country: 'Zambia' },
  { city: 'Kitwe',          country: 'Zambia' }, { city: 'Kabwe',           country: 'Zambia' },
  { city: 'Livingstone',    country: 'Zambia' },

  // ── Zimbabwe ──────────────────────────────────────────────────────────────
  { city: 'Harare',         country: 'Zimbabwe' }, { city: 'Bulawayo',       country: 'Zimbabwe' },
  { city: 'Mutare',         country: 'Zimbabwe' }, { city: 'Gweru',          country: 'Zimbabwe' },

  // ── Angola ────────────────────────────────────────────────────────────────
  { city: 'Luanda',         country: 'Angola' }, { city: 'Huambo',          country: 'Angola' },
  { city: 'Lobito',         country: 'Angola' }, { city: 'Benguela',        country: 'Angola' },

  // ── DR Congo ──────────────────────────────────────────────────────────────
  { city: 'Kinshasa',       country: 'DR Congo' }, { city: 'Lubumbashi',     country: 'DR Congo' },
  { city: 'Mbuji-Mayi',     country: 'DR Congo' }, { city: 'Kisangani',      country: 'DR Congo' },
  { city: 'Kananga',        country: 'DR Congo' }, { city: 'Goma',           country: 'DR Congo' },

  // ── Other African countries ───────────────────────────────────────────────
  { city: 'Bamako',         country: 'Mali' },        { city: 'Sikasso',       country: 'Mali' },
  { city: 'Lomé',           country: 'Togo' },        { city: 'Sokodé',        country: 'Togo' },
  { city: 'Cotonou',        country: 'Benin' },       { city: 'Porto-Novo',    country: 'Benin' },
  { city: 'Conakry',        country: 'Guinea' },      { city: 'Freetown',      country: 'Sierra Leone' },
  { city: 'Monrovia',       country: 'Liberia' },     { city: 'Ouagadougou',   country: 'Burkina Faso' },
  { city: 'Niamey',         country: 'Niger' },       { city: 'N\'Djamena',    country: 'Chad' },
  { city: 'Libreville',     country: 'Gabon' },       { city: 'Brazzaville',   country: 'Congo' },
  { city: 'Malabo',         country: 'Equatorial Guinea' },
  { city: 'Mogadishu',      country: 'Somalia' },     { city: 'Djibouti',      country: 'Djibouti' },
  { city: 'Asmara',         country: 'Eritrea' },     { city: 'Khartoum',      country: 'Sudan' },
  { city: 'Antananarivo',   country: 'Madagascar' },  { city: 'Maputo',        country: 'Mozambique' },
  { city: 'Windhoek',       country: 'Namibia' },     { city: 'Gaborone',      country: 'Botswana' },
  { city: 'Maseru',         country: 'Lesotho' },     { city: 'Mbabane',       country: 'Eswatini' },
  { city: 'Moroni',         country: 'Comoros' },     { city: 'Banjul',        country: 'Gambia' },
  { city: 'Bissau',         country: 'Guinea-Bissau' },
  { city: 'Praia',          country: 'Cape Verde' },  { city: 'São Tomé',      country: 'São Tomé and Príncipe' },
  { city: 'Lilongwe',       country: 'Malawi' },      { city: 'Blantyre',      country: 'Malawi' },
  { city: 'Juba',           country: 'South Sudan' },

  // ── UK ────────────────────────────────────────────────────────────────────
  { city: 'London',         country: 'UK' }, { city: 'Manchester',      country: 'UK' },
  { city: 'Birmingham',     country: 'UK' }, { city: 'Glasgow',         country: 'UK' },
  { city: 'Leeds',          country: 'UK' }, { city: 'Liverpool',       country: 'UK' },
  { city: 'Edinburgh',      country: 'UK' }, { city: 'Bristol',         country: 'UK' },
  { city: 'Sheffield',      country: 'UK' }, { city: 'Leicester',       country: 'UK' },
  { city: 'Nottingham',     country: 'UK' }, { city: 'Cardiff',         country: 'UK' },
  { city: 'Newcastle',      country: 'UK' }, { city: 'Bradford',        country: 'UK' },
  { city: 'Coventry',       country: 'UK' }, { city: 'Southampton',     country: 'UK' },
  { city: 'Belfast',        country: 'UK' }, { city: 'Wolverhampton',   country: 'UK' },
  { city: 'Derby',          country: 'UK' }, { city: 'Oxford',          country: 'UK' },
  { city: 'Cambridge',      country: 'UK' }, { city: 'Brighton',        country: 'UK' },
  { city: 'Portsmouth',     country: 'UK' }, { city: 'Reading',         country: 'UK' },
  { city: 'Luton',          country: 'UK' }, { city: 'Peckham',         country: 'UK' },
  { city: 'Croydon',        country: 'UK' }, { city: 'Hackney',         country: 'UK' },
  { city: 'Brixton',        country: 'UK' }, { city: 'Woolwich',        country: 'UK' },

  // ── Germany ───────────────────────────────────────────────────────────────
  { city: 'Berlin',         country: 'Germany' }, { city: 'Hamburg',         country: 'Germany' },
  { city: 'Munich',         country: 'Germany' }, { city: 'Cologne',         country: 'Germany' },
  { city: 'Frankfurt',      country: 'Germany' }, { city: 'Stuttgart',       country: 'Germany' },
  { city: 'Düsseldorf',     country: 'Germany' }, { city: 'Leipzig',         country: 'Germany' },
  { city: 'Dortmund',       country: 'Germany' }, { city: 'Essen',           country: 'Germany' },
  { city: 'Bremen',         country: 'Germany' }, { city: 'Dresden',         country: 'Germany' },
  { city: 'Hanover',        country: 'Germany' }, { city: 'Nuremberg',       country: 'Germany' },
  { city: 'Duisburg',       country: 'Germany' }, { city: 'Bochum',          country: 'Germany' },
  { city: 'Wuppertal',      country: 'Germany' }, { city: 'Bielefeld',       country: 'Germany' },
  { city: 'Bonn',           country: 'Germany' }, { city: 'Münster',         country: 'Germany' },
  { city: 'Karlsruhe',      country: 'Germany' }, { city: 'Mannheim',        country: 'Germany' },
  { city: 'Augsburg',       country: 'Germany' }, { city: 'Wiesbaden',       country: 'Germany' },
  { city: 'Potsdam',        country: 'Germany' }, { city: 'Aachen',          country: 'Germany' },
  { city: 'Halle',          country: 'Germany' }, { city: 'Magdeburg',       country: 'Germany' },
  { city: 'Freiburg',       country: 'Germany' }, { city: 'Erfurt',          country: 'Germany' },
  { city: 'Mainz',          country: 'Germany' }, { city: 'Rostock',         country: 'Germany' },
  { city: 'Kassel',         country: 'Germany' }, { city: 'Kiel',            country: 'Germany' },
  { city: 'Chemnitz',       country: 'Germany' }, { city: 'Lübeck',          country: 'Germany' },
  { city: 'Oberhausen',     country: 'Germany' }, { city: 'Krefeld',         country: 'Germany' },
  { city: 'Hagen',          country: 'Germany' }, { city: 'Saarbrücken',     country: 'Germany' },
  { city: 'Mülheim',        country: 'Germany' }, { city: 'Osnabrück',       country: 'Germany' },

  // ── France ────────────────────────────────────────────────────────────────
  { city: 'Paris',          country: 'France' }, { city: 'Marseille',       country: 'France' },
  { city: 'Lyon',           country: 'France' }, { city: 'Toulouse',        country: 'France' },
  { city: 'Nice',           country: 'France' }, { city: 'Nantes',          country: 'France' },
  { city: 'Montpellier',    country: 'France' }, { city: 'Strasbourg',      country: 'France' },
  { city: 'Bordeaux',       country: 'France' }, { city: 'Lille',           country: 'France' },
  { city: 'Rennes',         country: 'France' }, { city: 'Reims',           country: 'France' },
  { city: 'Grenoble',       country: 'France' }, { city: 'Toulon',          country: 'France' },
  { city: 'Dijon',          country: 'France' }, { city: 'Angers',          country: 'France' },
  { city: 'Nîmes',          country: 'France' }, { city: 'Clermont-Ferrand', country: 'France' },

  // ── Netherlands ───────────────────────────────────────────────────────────
  { city: 'Amsterdam',      country: 'Netherlands' }, { city: 'Rotterdam',      country: 'Netherlands' },
  { city: 'The Hague',      country: 'Netherlands' }, { city: 'Utrecht',        country: 'Netherlands' },
  { city: 'Eindhoven',      country: 'Netherlands' }, { city: 'Tilburg',        country: 'Netherlands' },
  { city: 'Groningen',      country: 'Netherlands' }, { city: 'Almere',         country: 'Netherlands' },
  { city: 'Breda',          country: 'Netherlands' }, { city: 'Nijmegen',       country: 'Netherlands' },

  // ── Belgium ───────────────────────────────────────────────────────────────
  { city: 'Brussels',       country: 'Belgium' }, { city: 'Antwerp',         country: 'Belgium' },
  { city: 'Ghent',          country: 'Belgium' }, { city: 'Bruges',          country: 'Belgium' },
  { city: 'Liège',          country: 'Belgium' }, { city: 'Charleroi',       country: 'Belgium' },

  // ── Italy ─────────────────────────────────────────────────────────────────
  { city: 'Rome',           country: 'Italy' }, { city: 'Milan',           country: 'Italy' },
  { city: 'Naples',         country: 'Italy' }, { city: 'Turin',           country: 'Italy' },
  { city: 'Palermo',        country: 'Italy' }, { city: 'Genoa',           country: 'Italy' },
  { city: 'Bologna',        country: 'Italy' }, { city: 'Florence',        country: 'Italy' },
  { city: 'Venice',         country: 'Italy' }, { city: 'Catania',         country: 'Italy' },
  { city: 'Bari',           country: 'Italy' }, { city: 'Verona',          country: 'Italy' },

  // ── Spain ─────────────────────────────────────────────────────────────────
  { city: 'Madrid',         country: 'Spain' }, { city: 'Barcelona',       country: 'Spain' },
  { city: 'Valencia',       country: 'Spain' }, { city: 'Seville',         country: 'Spain' },
  { city: 'Zaragoza',       country: 'Spain' }, { city: 'Málaga',          country: 'Spain' },
  { city: 'Murcia',         country: 'Spain' }, { city: 'Bilbao',          country: 'Spain' },
  { city: 'Alicante',       country: 'Spain' }, { city: 'Córdoba',         country: 'Spain' },
  { city: 'Valladolid',     country: 'Spain' }, { city: 'Palma',           country: 'Spain' },

  // ── Portugal ──────────────────────────────────────────────────────────────
  { city: 'Lisbon',         country: 'Portugal' }, { city: 'Porto',          country: 'Portugal' },
  { city: 'Braga',          country: 'Portugal' }, { city: 'Coimbra',        country: 'Portugal' },
  { city: 'Setúbal',        country: 'Portugal' }, { city: 'Funchal',        country: 'Portugal' },

  // ── Sweden ────────────────────────────────────────────────────────────────
  { city: 'Stockholm',      country: 'Sweden' }, { city: 'Gothenburg',      country: 'Sweden' },
  { city: 'Malmö',          country: 'Sweden' }, { city: 'Uppsala',         country: 'Sweden' },
  { city: 'Västerås',       country: 'Sweden' }, { city: 'Örebro',          country: 'Sweden' },

  // ── Norway ────────────────────────────────────────────────────────────────
  { city: 'Oslo',           country: 'Norway' }, { city: 'Bergen',          country: 'Norway' },
  { city: 'Stavanger',      country: 'Norway' }, { city: 'Trondheim',       country: 'Norway' },

  // ── Denmark ───────────────────────────────────────────────────────────────
  { city: 'Copenhagen',     country: 'Denmark' }, { city: 'Aarhus',          country: 'Denmark' },
  { city: 'Odense',         country: 'Denmark' }, { city: 'Aalborg',         country: 'Denmark' },

  // ── Other Europe ──────────────────────────────────────────────────────────
  { city: 'Dublin',         country: 'Ireland' },      { city: 'Cork',           country: 'Ireland' },
  { city: 'Limerick',       country: 'Ireland' },      { city: 'Galway',         country: 'Ireland' },
  { city: 'Vienna',         country: 'Austria' },      { city: 'Graz',           country: 'Austria' },
  { city: 'Salzburg',       country: 'Austria' },      { city: 'Linz',           country: 'Austria' },
  { city: 'Zurich',         country: 'Switzerland' },  { city: 'Geneva',         country: 'Switzerland' },
  { city: 'Basel',          country: 'Switzerland' },  { city: 'Bern',           country: 'Switzerland' },
  { city: 'Warsaw',         country: 'Poland' },       { city: 'Kraków',         country: 'Poland' },
  { city: 'Łódź',           country: 'Poland' },       { city: 'Wrocław',        country: 'Poland' },
  { city: 'Poznań',         country: 'Poland' },       { city: 'Gdańsk',         country: 'Poland' },
  { city: 'Athens',         country: 'Greece' },       { city: 'Thessaloniki',   country: 'Greece' },
  { city: 'Prague',         country: 'Czech Republic' }, { city: 'Brno',         country: 'Czech Republic' },
  { city: 'Bratislava',     country: 'Slovakia' },     { city: 'Budapest',       country: 'Hungary' },
  { city: 'Bucharest',      country: 'Romania' },      { city: 'Cluj-Napoca',    country: 'Romania' },
  { city: 'Sofia',          country: 'Bulgaria' },     { city: 'Zagreb',         country: 'Croatia' },
  { city: 'Belgrade',       country: 'Serbia' },       { city: 'Ljubljana',      country: 'Slovenia' },
  { city: 'Sarajevo',       country: 'Bosnia and Herzegovina' },
  { city: 'Podgorica',      country: 'Montenegro' },   { city: 'Skopje',         country: 'North Macedonia' },
  { city: 'Tirana',         country: 'Albania' },      { city: 'Pristina',       country: 'Kosovo' },
  { city: 'Riga',           country: 'Latvia' },       { city: 'Tallinn',        country: 'Estonia' },
  { city: 'Vilnius',        country: 'Lithuania' },    { city: 'Helsinki',       country: 'Finland' },
  { city: 'Tampere',        country: 'Finland' },      { city: 'Reykjavik',      country: 'Iceland' },
  { city: 'Luxembourg City', country: 'Luxembourg' },  { city: 'Valletta',       country: 'Malta' },
  { city: 'Nicosia',        country: 'Cyprus' },       { city: 'Limassol',       country: 'Cyprus' },

  // ── USA ───────────────────────────────────────────────────────────────────
  { city: 'New York',       country: 'USA' }, { city: 'Los Angeles',     country: 'USA' },
  { city: 'Chicago',        country: 'USA' }, { city: 'Houston',         country: 'USA' },
  { city: 'Phoenix',        country: 'USA' }, { city: 'Philadelphia',    country: 'USA' },
  { city: 'San Antonio',    country: 'USA' }, { city: 'San Diego',       country: 'USA' },
  { city: 'Dallas',         country: 'USA' }, { city: 'San Jose',        country: 'USA' },
  { city: 'Austin',         country: 'USA' }, { city: 'Jacksonville',    country: 'USA' },
  { city: 'Fort Worth',     country: 'USA' }, { city: 'Columbus',        country: 'USA' },
  { city: 'Charlotte',      country: 'USA' }, { city: 'Indianapolis',    country: 'USA' },
  { city: 'San Francisco',  country: 'USA' }, { city: 'Seattle',         country: 'USA' },
  { city: 'Denver',         country: 'USA' }, { city: 'Nashville',       country: 'USA' },
  { city: 'Washington DC',  country: 'USA' }, { city: 'Boston',          country: 'USA' },
  { city: 'Las Vegas',      country: 'USA' }, { city: 'Memphis',         country: 'USA' },
  { city: 'Portland',       country: 'USA' }, { city: 'Louisville',      country: 'USA' },
  { city: 'Baltimore',      country: 'USA' }, { city: 'Milwaukee',       country: 'USA' },
  { city: 'Atlanta',        country: 'USA' }, { city: 'Miami',           country: 'USA' },
  { city: 'Minneapolis',    country: 'USA' }, { city: 'Tampa',           country: 'USA' },
  { city: 'New Orleans',    country: 'USA' }, { city: 'Cleveland',       country: 'USA' },
  { city: 'Orlando',        country: 'USA' }, { city: 'Pittsburgh',      country: 'USA' },
  { city: 'Raleigh',        country: 'USA' }, { city: 'Sacramento',      country: 'USA' },
  { city: 'Bronx',          country: 'USA' }, { city: 'Brooklyn',        country: 'USA' },
  { city: 'Queens',         country: 'USA' }, { city: 'Harlem',          country: 'USA' },
  { city: 'Detroit',        country: 'USA' }, { city: 'Oklahoma City',   country: 'USA' },
  { city: 'Richmond',       country: 'USA' }, { city: 'Newark',          country: 'USA' },
  { city: 'Greensboro',     country: 'USA' }, { city: 'Durham',          country: 'USA' },

  // ── Canada ────────────────────────────────────────────────────────────────
  { city: 'Toronto',        country: 'Canada' }, { city: 'Montreal',       country: 'Canada' },
  { city: 'Vancouver',      country: 'Canada' }, { city: 'Calgary',        country: 'Canada' },
  { city: 'Edmonton',       country: 'Canada' }, { city: 'Ottawa',         country: 'Canada' },
  { city: 'Winnipeg',       country: 'Canada' }, { city: 'Quebec City',    country: 'Canada' },
  { city: 'Hamilton',       country: 'Canada' }, { city: 'Kitchener',      country: 'Canada' },
  { city: 'London',         country: 'Canada' }, { city: 'Halifax',        country: 'Canada' },
  { city: 'Brampton',       country: 'Canada' }, { city: 'Mississauga',    country: 'Canada' },
  { city: 'Scarborough',    country: 'Canada' }, { city: 'Markham',        country: 'Canada' },
  { city: 'Vaughan',        country: 'Canada' }, { city: 'Richmond Hill',  country: 'Canada' },

  // ── Caribbean & Latin America ─────────────────────────────────────────────
  { city: 'Kingston',       country: 'Jamaica' },         { city: 'Montego Bay',    country: 'Jamaica' },
  { city: 'Spanish Town',   country: 'Jamaica' },
  { city: 'Port of Spain',  country: 'Trinidad and Tobago' }, { city: 'San Fernando', country: 'Trinidad and Tobago' },
  { city: 'Bridgetown',     country: 'Barbados' },
  { city: 'Nassau',         country: 'Bahamas' },
  { city: 'Georgetown',     country: 'Guyana' },
  { city: 'Paramaribo',     country: 'Suriname' },
  { city: 'São Paulo',      country: 'Brazil' }, { city: 'Rio de Janeiro', country: 'Brazil' },
  { city: 'Brasília',       country: 'Brazil' }, { city: 'Salvador',       country: 'Brazil' },
  { city: 'Fortaleza',      country: 'Brazil' }, { city: 'Belo Horizonte', country: 'Brazil' },
  { city: 'Manaus',         country: 'Brazil' }, { city: 'Curitiba',       country: 'Brazil' },
  { city: 'Recife',         country: 'Brazil' }, { city: 'Porto Alegre',   country: 'Brazil' },
  { city: 'Mexico City',    country: 'Mexico' }, { city: 'Guadalajara',    country: 'Mexico' },
  { city: 'Monterrey',      country: 'Mexico' }, { city: 'Puebla',         country: 'Mexico' },
  { city: 'Bogotá',         country: 'Colombia' }, { city: 'Medellín',     country: 'Colombia' },
  { city: 'Cali',           country: 'Colombia' }, { city: 'Lima',         country: 'Peru' },
  { city: 'Buenos Aires',   country: 'Argentina' }, { city: 'Santiago',    country: 'Chile' },
  { city: 'Caracas',        country: 'Venezuela' }, { city: 'Quito',       country: 'Ecuador' },
  { city: 'La Paz',         country: 'Bolivia' },   { city: 'Asunción',    country: 'Paraguay' },
  { city: 'Montevideo',     country: 'Uruguay' },   { city: 'Panama City', country: 'Panama' },
  { city: 'San José',       country: 'Costa Rica' }, { city: 'Havana',     country: 'Cuba' },

  // ── Middle East ───────────────────────────────────────────────────────────
  { city: 'Dubai',          country: 'UAE' }, { city: 'Abu Dhabi',       country: 'UAE' },
  { city: 'Sharjah',        country: 'UAE' }, { city: 'Ajman',           country: 'UAE' },
  { city: 'Riyadh',         country: 'Saudi Arabia' }, { city: 'Jeddah',   country: 'Saudi Arabia' },
  { city: 'Mecca',          country: 'Saudi Arabia' }, { city: 'Medina',   country: 'Saudi Arabia' },
  { city: 'Dammam',         country: 'Saudi Arabia' },
  { city: 'Kuwait City',    country: 'Kuwait' }, { city: 'Doha',          country: 'Qatar' },
  { city: 'Manama',         country: 'Bahrain' }, { city: 'Muscat',       country: 'Oman' },
  { city: 'Amman',          country: 'Jordan' }, { city: 'Beirut',        country: 'Lebanon' },
  { city: 'Tel Aviv',       country: 'Israel' }, { city: 'Jerusalem',     country: 'Israel' },
  { city: 'Istanbul',       country: 'Turkey' }, { city: 'Ankara',        country: 'Turkey' },
  { city: 'Izmir',          country: 'Turkey' }, { city: 'Bursa',         country: 'Turkey' },
  { city: 'Tehran',         country: 'Iran' },   { city: 'Baghdad',       country: 'Iraq' },
  { city: 'Erbil',          country: 'Iraq' },   { city: 'Damascus',      country: 'Syria' },

  // ── Asia ──────────────────────────────────────────────────────────────────
  { city: 'Mumbai',         country: 'India' }, { city: 'Delhi',          country: 'India' },
  { city: 'Bangalore',      country: 'India' }, { city: 'Hyderabad',      country: 'India' },
  { city: 'Ahmedabad',      country: 'India' }, { city: 'Chennai',        country: 'India' },
  { city: 'Kolkata',        country: 'India' }, { city: 'Surat',          country: 'India' },
  { city: 'Pune',           country: 'India' }, { city: 'Jaipur',         country: 'India' },
  { city: 'Beijing',        country: 'China' }, { city: 'Shanghai',       country: 'China' },
  { city: 'Guangzhou',      country: 'China' }, { city: 'Shenzhen',       country: 'China' },
  { city: 'Chengdu',        country: 'China' }, { city: 'Tianjin',        country: 'China' },
  { city: 'Tokyo',          country: 'Japan' }, { city: 'Yokohama',       country: 'Japan' },
  { city: 'Osaka',          country: 'Japan' }, { city: 'Nagoya',         country: 'Japan' },
  { city: 'Sapporo',        country: 'Japan' }, { city: 'Kyoto',          country: 'Japan' },
  { city: 'Seoul',          country: 'South Korea' }, { city: 'Busan',    country: 'South Korea' },
  { city: 'Singapore',      country: 'Singapore' },
  { city: 'Kuala Lumpur',   country: 'Malaysia' }, { city: 'George Town', country: 'Malaysia' },
  { city: 'Bangkok',        country: 'Thailand' }, { city: 'Chiang Mai',  country: 'Thailand' },
  { city: 'Jakarta',        country: 'Indonesia' }, { city: 'Surabaya',   country: 'Indonesia' },
  { city: 'Manila',         country: 'Philippines' }, { city: 'Cebu City', country: 'Philippines' },
  { city: 'Dhaka',          country: 'Bangladesh' }, { city: 'Karachi',   country: 'Pakistan' },
  { city: 'Lahore',         country: 'Pakistan' }, { city: 'Colombo',     country: 'Sri Lanka' },
  { city: 'Kathmandu',      country: 'Nepal' }, { city: 'Yangon',         country: 'Myanmar' },
  { city: 'Phnom Penh',     country: 'Cambodia' }, { city: 'Hanoi',       country: 'Vietnam' },
  { city: 'Ho Chi Minh City', country: 'Vietnam' },

  // ── Australia & New Zealand ───────────────────────────────────────────────
  { city: 'Sydney',         country: 'Australia' }, { city: 'Melbourne',      country: 'Australia' },
  { city: 'Brisbane',       country: 'Australia' }, { city: 'Perth',          country: 'Australia' },
  { city: 'Adelaide',       country: 'Australia' }, { city: 'Gold Coast',     country: 'Australia' },
  { city: 'Canberra',       country: 'Australia' }, { city: 'Newcastle',      country: 'Australia' },
  { city: 'Wollongong',     country: 'Australia' }, { city: 'Hobart',         country: 'Australia' },
  { city: 'Auckland',       country: 'New Zealand' }, { city: 'Wellington',   country: 'New Zealand' },
  { city: 'Christchurch',   country: 'New Zealand' }, { city: 'Hamilton',     country: 'New Zealand' },
];
