/**
 * Facts for all 50 states plus the District of Columbia.
 * Population: 2020 U.S. Census. Area: total area in square miles.
 */
export const STATES = [
  {
    fips: '01', abbr: 'AL', name: 'Alabama', capital: 'Montgomery', largest: 'Huntsville',
    pop: 5024279, area: 52420, admitted: '1819-12-14', order: 22,
    nickname: 'The Yellowhammer State', region: 'South',
    fact: 'Huntsville built the rockets that carried humans to the Moon — and is now Alabama’s largest city.'
  },
  {
    fips: '02', abbr: 'AK', name: 'Alaska', capital: 'Juneau', largest: 'Anchorage',
    pop: 733391, area: 665384, admitted: '1959-01-03', order: 49,
    nickname: 'The Last Frontier', region: 'West',
    fact: 'The largest state by far, with more coastline than all other states combined and Denali rising 20,310 feet.'
  },
  {
    fips: '04', abbr: 'AZ', name: 'Arizona', capital: 'Phoenix', largest: 'Phoenix',
    pop: 7151502, area: 113990, admitted: '1912-02-14', order: 48,
    nickname: 'The Grand Canyon State', region: 'West',
    fact: 'The saguaro cactus grows wild only in the Sonoran Desert, and the Grand Canyon is a mile deep.'
  },
  {
    fips: '05', abbr: 'AR', name: 'Arkansas', capital: 'Little Rock', largest: 'Little Rock',
    pop: 3011524, area: 53179, admitted: '1836-06-15', order: 25,
    nickname: 'The Natural State', region: 'South',
    fact: 'Crater of Diamonds State Park is the only active diamond mine in the world open to the public.'
  },
  {
    fips: '06', abbr: 'CA', name: 'California', capital: 'Sacramento', largest: 'Los Angeles',
    pop: 39538223, area: 163695, admitted: '1850-09-09', order: 31,
    nickname: 'The Golden State', region: 'West',
    fact: 'Home to the tallest trees (redwoods), the oldest trees (bristlecones), and the most populous county in the U.S.'
  },
  {
    fips: '08', abbr: 'CO', name: 'Colorado', capital: 'Denver', largest: 'Denver',
    pop: 5773714, area: 104094, admitted: '1876-08-01', order: 38,
    nickname: 'The Centennial State', region: 'West',
    fact: 'Averages 6,800 feet of elevation, and the Royal Gorge Bridge hangs 956 feet above the Arkansas River.'
  },
  {
    fips: '09', abbr: 'CT', name: 'Connecticut', capital: 'Hartford', largest: 'Bridgeport',
    pop: 3605944, area: 5543, admitted: '1788-01-09', order: 5,
    nickname: 'The Constitution State', region: 'Northeast',
    fact: 'The Fundamental Orders of 1639 are considered the first written constitution in North America.'
  },
  {
    fips: '10', abbr: 'DE', name: 'Delaware', capital: 'Dover', largest: 'Wilmington',
    pop: 989948, area: 2489, admitted: '1787-12-07', order: 1,
    nickname: 'The First State', region: 'South',
    fact: 'Delaware ratified the Constitution on December 7, 1787, becoming the first state in the Union.'
  },
  {
    fips: '12', abbr: 'FL', name: 'Florida', capital: 'Tallahassee', largest: 'Jacksonville',
    pop: 21538187, area: 65758, admitted: '1845-03-03', order: 27,
    nickname: 'The Sunshine State', region: 'South',
    fact: 'The only living coral barrier reef in the continental U.S. lies off the Florida Keys.'
  },
  {
    fips: '13', abbr: 'GA', name: 'Georgia', capital: 'Atlanta', largest: 'Atlanta',
    pop: 10711908, area: 59425, admitted: '1788-01-02', order: 4,
    nickname: 'The Peach State', region: 'South',
    fact: 'The largest state east of the Mississippi — and Coca-Cola was first sold in Atlanta in 1886.'
  },
  {
    fips: '15', abbr: 'HI', name: 'Hawaii', capital: 'Honolulu', largest: 'Honolulu',
    pop: 1455271, area: 10932, admitted: '1959-08-21', order: 50,
    nickname: 'The Aloha State', region: 'West',
    fact: 'The only state made entirely of islands, and the only one that commercially grows coffee.'
  },
  {
    fips: '16', abbr: 'ID', name: 'Idaho', capital: 'Boise', largest: 'Boise',
    pop: 1839106, area: 83569, admitted: '1890-07-03', order: 43,
    nickname: 'The Gem State', region: 'West',
    fact: 'Idaho produces 72 varieties of precious and semi-precious stones, including the star garnet.'
  },
  {
    fips: '17', abbr: 'IL', name: 'Illinois', capital: 'Springfield', largest: 'Chicago',
    pop: 12812508, area: 57914, admitted: '1818-12-03', order: 21,
    nickname: 'The Prairie State', region: 'Midwest',
    fact: 'Chicago built the first skyscraper in 1885 and hosted the world’s first Ferris wheel in 1893.'
  },
  {
    fips: '18', abbr: 'IN', name: 'Indiana', capital: 'Indianapolis', largest: 'Indianapolis',
    pop: 6785528, area: 36420, admitted: '1816-12-11', order: 19,
    nickname: 'The Hoosier State', region: 'Midwest',
    fact: 'The Indianapolis 500 is the largest single-day sporting event in the world.'
  },
  {
    fips: '19', abbr: 'IA', name: 'Iowa', capital: 'Des Moines', largest: 'Des Moines',
    pop: 3190369, area: 56273, admitted: '1846-12-28', order: 29,
    nickname: 'The Hawkeye State', region: 'Midwest',
    fact: 'Its east and west borders are almost entirely rivers — the Mississippi and the Missouri.'
  },
  {
    fips: '20', abbr: 'KS', name: 'Kansas', capital: 'Topeka', largest: 'Wichita',
    pop: 2937880, area: 82278, admitted: '1861-01-29', order: 34,
    nickname: 'The Sunflower State', region: 'Midwest',
    fact: 'The geographic center of the contiguous United States is near Lebanon, Kansas.'
  },
  {
    fips: '21', abbr: 'KY', name: 'Kentucky', capital: 'Frankfort', largest: 'Louisville',
    pop: 4505836, area: 40408, admitted: '1792-06-01', order: 15,
    nickname: 'The Bluegrass State', region: 'South',
    fact: 'Mammoth Cave is the longest known cave system on Earth, with more than 400 mapped miles.'
  },
  {
    fips: '22', abbr: 'LA', name: 'Louisiana', capital: 'Baton Rouge', largest: 'New Orleans',
    pop: 4657757, area: 52378, admitted: '1812-04-30', order: 18,
    nickname: 'The Pelican State', region: 'South',
    fact: 'The only state with parishes instead of counties — and the birthplace of jazz.'
  },
  {
    fips: '23', abbr: 'ME', name: 'Maine', capital: 'Augusta', largest: 'Portland',
    pop: 1362359, area: 35380, admitted: '1820-03-15', order: 23,
    nickname: 'The Pine Tree State', region: 'Northeast',
    fact: 'The only state with a one-syllable name, and source of about 90% of America’s lobster.'
  },
  {
    fips: '24', abbr: 'MD', name: 'Maryland', capital: 'Annapolis', largest: 'Baltimore',
    pop: 6177224, area: 12406, admitted: '1788-04-28', order: 7,
    nickname: 'The Old Line State', region: 'South',
    fact: 'The U.S. Naval Academy sits in Annapolis, and the B&O Railroad began here in 1830.'
  },
  {
    fips: '25', abbr: 'MA', name: 'Massachusetts', capital: 'Boston', largest: 'Boston',
    pop: 7029917, area: 10554, admitted: '1788-02-06', order: 6,
    nickname: 'The Bay State', region: 'Northeast',
    fact: 'Boston Common (1634) is the oldest public park in the U.S.; Harvard (1636) is the oldest college.'
  },
  {
    fips: '26', abbr: 'MI', name: 'Michigan', capital: 'Lansing', largest: 'Detroit',
    pop: 10077331, area: 96714, admitted: '1837-01-26', order: 26,
    nickname: 'The Great Lakes State', region: 'Midwest',
    fact: 'Touches four of the five Great Lakes and has more lighthouses than any other state.'
  },
  {
    fips: '27', abbr: 'MN', name: 'Minnesota', capital: 'Saint Paul', largest: 'Minneapolis',
    pop: 5706494, area: 86936, admitted: '1858-05-11', order: 32,
    nickname: 'The North Star State', region: 'Midwest',
    fact: 'The Land of 10,000 Lakes actually has 11,842 — and the Mississippi River begins at Lake Itasca.'
  },
  {
    fips: '28', abbr: 'MS', name: 'Mississippi', capital: 'Jackson', largest: 'Jackson',
    pop: 2961279, area: 48432, admitted: '1817-12-10', order: 20,
    nickname: 'The Magnolia State', region: 'South',
    fact: 'The birthplace of the blues, and of Elvis Presley in Tupelo.'
  },
  {
    fips: '29', abbr: 'MO', name: 'Missouri', capital: 'Jefferson City', largest: 'Kansas City',
    pop: 6154913, area: 69707, admitted: '1821-08-10', order: 24,
    nickname: 'The Show-Me State', region: 'Midwest',
    fact: 'The Gateway Arch in St. Louis is the tallest man-made monument in the United States.'
  },
  {
    fips: '30', abbr: 'MT', name: 'Montana', capital: 'Helena', largest: 'Billings',
    pop: 1084225, area: 147040, admitted: '1889-11-08', order: 41,
    nickname: 'The Treasure State', region: 'West',
    fact: 'Going-to-the-Sun Road in Glacier National Park crosses the Continental Divide at Logan Pass.'
  },
  {
    fips: '31', abbr: 'NE', name: 'Nebraska', capital: 'Lincoln', largest: 'Omaha',
    pop: 1961504, area: 77348, admitted: '1867-03-01', order: 37,
    nickname: 'The Cornhusker State', region: 'Midwest',
    fact: 'The only state with a unicameral, nonpartisan legislature — it has just one house.'
  },
  {
    fips: '32', abbr: 'NV', name: 'Nevada', capital: 'Carson City', largest: 'Las Vegas',
    pop: 3104614, area: 110572, admitted: '1864-10-31', order: 36,
    nickname: 'The Silver State', region: 'West',
    fact: 'Great Basin National Park protects bristlecone pines that have lived for nearly 5,000 years.'
  },
  {
    fips: '33', abbr: 'NH', name: 'New Hampshire', capital: 'Concord', largest: 'Manchester',
    pop: 1377529, area: 9349, admitted: '1788-06-21', order: 9,
    nickname: 'The Granite State', region: 'Northeast',
    fact: 'Six months before the Declaration of Independence, New Hampshire declared independence from Britain.'
  },
  {
    fips: '34', abbr: 'NJ', name: 'New Jersey', capital: 'Trenton', largest: 'Newark',
    pop: 9288994, area: 8723, admitted: '1787-12-18', order: 3,
    nickname: 'The Garden State', region: 'Northeast',
    fact: 'The most densely populated state — and home of the first drive-in movie theater (1933).'
  },
  {
    fips: '35', abbr: 'NM', name: 'New Mexico', capital: 'Santa Fe', largest: 'Albuquerque',
    pop: 2117522, area: 121590, admitted: '1912-01-06', order: 47,
    nickname: 'The Land of Enchantment', region: 'West',
    fact: 'Santa Fe is the oldest capital city in the U.S., founded in 1610; Carlsbad Caverns lies below the desert.'
  },
  {
    fips: '36', abbr: 'NY', name: 'New York', capital: 'Albany', largest: 'New York City',
    pop: 20201249, area: 54555, admitted: '1788-07-26', order: 11,
    nickname: 'The Empire State', region: 'Northeast',
    fact: 'Niagara Falls State Park (1885) is the oldest state park in America.'
  },
  {
    fips: '37', abbr: 'NC', name: 'North Carolina', capital: 'Raleigh', largest: 'Charlotte',
    pop: 10439388, area: 53819, admitted: '1789-11-21', order: 12,
    nickname: 'The Tar Heel State', region: 'South',
    fact: 'The Wright brothers flew at Kitty Hawk, and Cape Hatteras is the tallest brick lighthouse in the U.S.'
  },
  {
    fips: '38', abbr: 'ND', name: 'North Dakota', capital: 'Bismarck', largest: 'Fargo',
    pop: 779094, area: 70698, admitted: '1889-11-02', order: 39,
    nickname: 'The Peace Garden State', region: 'Midwest',
    fact: 'Rugby, North Dakota, claims the geographic center of North America.'
  },
  {
    fips: '39', abbr: 'OH', name: 'Ohio', capital: 'Columbus', largest: 'Columbus',
    pop: 11799448, area: 44826, admitted: '1803-03-01', order: 17,
    nickname: 'The Buckeye State', region: 'Midwest',
    fact: 'Seven U.S. presidents were born in Ohio, and the Wright brothers built their first airplane in Dayton.'
  },
  {
    fips: '40', abbr: 'OK', name: 'Oklahoma', capital: 'Oklahoma City', largest: 'Oklahoma City',
    pop: 3959353, area: 69899, admitted: '1907-11-16', order: 46,
    nickname: 'The Sooner State', region: 'South',
    fact: 'Oklahoma has more man-made lakes than any other state — over 200 of them.'
  },
  {
    fips: '41', abbr: 'OR', name: 'Oregon', capital: 'Salem', largest: 'Portland',
    pop: 4237256, area: 98379, admitted: '1859-02-14', order: 33,
    nickname: 'The Beaver State', region: 'West',
    fact: 'Crater Lake is the deepest lake in the U.S. at 1,943 feet, fed only by rain and snow.'
  },
  {
    fips: '42', abbr: 'PA', name: 'Pennsylvania', capital: 'Harrisburg', largest: 'Philadelphia',
    pop: 13002700, area: 46054, admitted: '1787-12-12', order: 2,
    nickname: 'The Keystone State', region: 'Northeast',
    fact: 'The Liberty Bell and Independence Hall sit here, along with the first commercial U.S. oil well (1859).'
  },
  {
    fips: '44', abbr: 'RI', name: 'Rhode Island', capital: 'Providence', largest: 'Providence',
    pop: 1097379, area: 1545, admitted: '1790-05-29', order: 13,
    nickname: 'The Ocean State', region: 'Northeast',
    fact: 'The smallest state has about 400 miles of coastline and the first synagogue in America.'
  },
  {
    fips: '45', abbr: 'SC', name: 'South Carolina', capital: 'Columbia', largest: 'Charleston',
    pop: 5118425, area: 32020, admitted: '1788-05-23', order: 8,
    nickname: 'The Palmetto State', region: 'South',
    fact: 'The first shots of the Civil War were fired at Fort Sumter in Charleston Harbor in 1861.'
  },
  {
    fips: '46', abbr: 'SD', name: 'South Dakota', capital: 'Pierre', largest: 'Sioux Falls',
    pop: 886667, area: 77116, admitted: '1889-11-02', order: 40,
    nickname: 'The Mount Rushmore State', region: 'Midwest',
    fact: 'Mount Rushmore and Badlands National Park both rise from the Black Hills region.'
  },
  {
    fips: '47', abbr: 'TN', name: 'Tennessee', capital: 'Nashville', largest: 'Nashville',
    pop: 6910840, area: 42144, admitted: '1796-06-01', order: 16,
    nickname: 'The Volunteer State', region: 'South',
    fact: 'Great Smoky Mountains is the most visited national park in the country.'
  },
  {
    fips: '48', abbr: 'TX', name: 'Texas', capital: 'Austin', largest: 'Houston',
    pop: 29145505, area: 268596, admitted: '1845-12-29', order: 28,
    nickname: 'The Lone Star State', region: 'South',
    fact: 'The largest state in the contiguous U.S. — bigger than France, and once an independent republic.'
  },
  {
    fips: '49', abbr: 'UT', name: 'Utah', capital: 'Salt Lake City', largest: 'Salt Lake City',
    pop: 3271616, area: 84897, admitted: '1896-01-04', order: 45,
    nickname: 'The Beehive State', region: 'West',
    fact: 'Its “Mighty Five” national parks ring the Great Salt Lake, the largest saltwater lake in the Americas.'
  },
  {
    fips: '50', abbr: 'VT', name: 'Vermont', capital: 'Montpelier', largest: 'Burlington',
    pop: 643077, area: 9616, admitted: '1791-03-04', order: 14,
    nickname: 'The Green Mountain State', region: 'Northeast',
    fact: 'Produces more maple syrup than any other state and has banned billboards since 1968.'
  },
  {
    fips: '51', abbr: 'VA', name: 'Virginia', capital: 'Richmond', largest: 'Virginia Beach',
    pop: 8631393, area: 42775, admitted: '1788-06-25', order: 10,
    nickname: 'The Old Dominion', region: 'South',
    fact: 'Eight U.S. presidents were born here, and the Pentagon is the world’s largest office building.'
  },
  {
    fips: '53', abbr: 'WA', name: 'Washington', capital: 'Olympia', largest: 'Seattle',
    pop: 7705281, area: 71298, admitted: '1889-11-11', order: 42,
    nickname: 'The Evergreen State', region: 'West',
    fact: 'Mount Rainier watches over the only temperate rainforest in the contiguous U.S.'
  },
  {
    fips: '54', abbr: 'WV', name: 'West Virginia', capital: 'Charleston', largest: 'Charleston',
    pop: 1793716, area: 24230, admitted: '1863-06-20', order: 35,
    nickname: 'The Mountain State', region: 'South',
    fact: 'The only state lying entirely within the Appalachian Mountain region — and the “Mountain State.”'
  },
  {
    fips: '55', abbr: 'WI', name: 'Wisconsin', capital: 'Madison', largest: 'Milwaukee',
    pop: 5893718, area: 65496, admitted: '1848-05-29', order: 30,
    nickname: 'The Badger State', region: 'Midwest',
    fact: 'More than 14,000 lakes, and a state so serious about cheese it licenses Master Cheesemakers.'
  },
  {
    fips: '56', abbr: 'WY', name: 'Wyoming', capital: 'Cheyenne', largest: 'Cheyenne',
    pop: 576851, area: 97813, admitted: '1890-07-10', order: 44,
    nickname: 'The Equality State', region: 'West',
    fact: 'The least populous state, home to Yellowstone — the world’s first national park (1872).'
  },
  {
    fips: '11', abbr: 'DC', name: 'District of Columbia', capital: 'Washington', largest: 'Washington',
    pop: 689545, area: 68, admitted: '1790-07-16', order: 0,
    nickname: 'The Nation’s Capital', region: 'South',
    fact: 'A federal district, not a state: home to the Smithsonian museums and more than 170 embassies.'
  }
];

export const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];

export const STATE_BY_FIPS = new Map(STATES.map((s) => [s.fips, s]));
export const STATE_BY_ABBR = new Map(STATES.map((s) => [s.abbr, s]));

export const REGION_COLORS = {
  dark: { Northeast: '#2dd4bf', Midwest: '#a78bfa', South: '#fbbf24', West: '#38bdf8' },
  light: { Northeast: '#0e9384', Midwest: '#7c3aed', South: '#d97706', West: '#0284c7' }
};

export const METRICS = {
  signature: {
    key: 'signature',
    label: 'Regions',
    legendTitle: 'Census region',
    format: () => ''
  },
  pop: {
    key: 'pop',
    label: 'Population',
    legendTitle: 'Population (2020)',
    accessor: (s) => s.pop,
    format: (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : Math.round(v).toLocaleString()),
    scale: 'log'
  },
  density: {
    key: 'density',
    label: 'Density',
    legendTitle: 'People per sq mi',
    accessor: (s) => s.pop / s.area,
    format: (v) => `${Math.round(v).toLocaleString()}/mi²`,
    scale: 'log'
  },
  area: {
    key: 'area',
    label: 'Area',
    legendTitle: 'Total area (sq mi)',
    accessor: (s) => s.area,
    format: (v) => `${Math.round(v).toLocaleString()} mi²`,
    scale: 'log'
  },
  order: {
    key: 'order',
    label: 'Statehood',
    legendTitle: 'Year of admission',
    accessor: (s) => new Date(`${s.admitted}T00:00:00`).getFullYear(),
    format: (v) => `${Math.round(v)}`,
    scale: 'linear'
  }
};

export const NATIONAL = {
  population: STATES.reduce((sum, s) => sum + s.pop, 0),
  area: STATES.reduce((sum, s) => sum + s.area, 0),
  states: 50,
  oldest: 1787,
  newest: 1959
};
