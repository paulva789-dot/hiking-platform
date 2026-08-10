import type { Region } from './types';

/**
 * Landmark sites shown on /sites. Photos are hotlinked from Wikimedia Commons
 * via Special:FilePath (redirects to the current file, any resolution) —
 * each `commonsFile` is a real, verified filename on commons.wikimedia.org.
 * Elevations are approximate (site/town elevation above sea level, not
 * necessarily a summit), since most of these places aren't formally surveyed.
 */
const commonsUrl = (file: string, width = 1200) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export interface CameroonSite {
  slug: string;
  name: string;
  /** Display label, e.g. "East / South" for places that straddle two regions. */
  region: string;
  /** The Region enum value used for the region → place picker and filtering. */
  regionKey: Region;
  lat: number;
  lng: number;
  /** Approximate elevation above sea level, in metres. */
  elevationM: number;
  /** Drives which animated overlay (drifting clouds / moving water) the photo gets. */
  sceneType: 'mountain' | 'water' | 'none';
  image: string;
  imageCredit: string;
  teaser: string;
  history: string;
  /** A cultural tradition, belief or story tied to the place, distinct from its factual history. */
  culture: string;
  wikipediaUrl: string;
}

export const CAMEROON_SITES: CameroonSite[] = [
  {
    slug: 'mount-cameroon',
    name: 'Mount Cameroon (Fako)',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 4.2028,
    lng: 9.1708,
    elevationM: 4040,
    sceneType: 'mountain',
    image: commonsUrl('Mount fako (mount Cameroon).jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "West Africa's highest peak, an active volcano the Bakweri call Mongo ma Ndemi.",
    history:
      "At 4,040 m, Fako is West Africa's tallest peak and one of Africa's most active volcanoes — it has erupted more than a dozen times in the last century, most recently in 2000. The Bakweri people call it Mongo ma Ndemi, \"Mountain of Greatness,\" and it also carries the name \"Chariot of the Gods\" from early Portuguese sailors who saw it steaming from the Atlantic. Every February it hosts the Race of Hope, a brutal up-and-down mountain run first held in 1973.",
    culture:
      "For the Bakweri, the mountain is the home of Epasa Moto, a powerful spirit believed to control eruptions and to appear to those who show it disrespect. Before major climbs — and especially after an eruption — elders have historically made offerings at the mountain's base to ask safe passage, a practice some guides and porters still observe informally today.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mount_Cameroon',
  },
  {
    slug: 'rhumsiki-kapsiki-peak',
    name: 'Rhumsiki & Kapsiki Peak',
    region: 'Far North',
    regionKey: 'FAR_NORTH',
    lat: 10.9667,
    lng: 13.7333,
    elevationM: 1224,
    sceneType: 'mountain',
    image: commonsUrl('Rhumsiki Peak.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A 1,224 m volcanic plug rising over the Mandara Mountains, home of the Kapsiki people.',
    history:
      "Rhumsiki village sits in the Mandara Mountains near the Nigerian border, ringed by dozens of jagged volcanic plugs — the eroded cores of long-dead volcanoes — the tallest of which is the 1,224 m Kapsiki Peak. The Kapsiki people who live here are known for crab divination, in which a diviner reads the rearranged position of small objects after a captured crab has disturbed them to answer questions about marriage, harvests or travel. It remains one of northern Cameroon's most visited landscapes.",
    culture:
      "Crab divination (va kə gə́la) is practised by a hereditary caste of Kapsiki diviners, who arrange small carved stones, seeds and pottery shards representing questions around a buried calabash before releasing a freshwater crab over them; the crab's disturbance of the objects is read the next morning. Blacksmiths hold a distinct, semi-outcast social status in Kapsiki society, credited with both toolmaking skill and supernatural power, and traditionally marry only within their own caste.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Rhumsiki',
  },
  {
    slug: 'lake-nyos',
    name: 'Lake Nyos',
    region: 'North-West',
    regionKey: 'NORTH_WEST',
    lat: 6.4375,
    lng: 10.2971,
    elevationM: 1091,
    sceneType: 'water',
    image: commonsUrl('Nyos Lake.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A crater lake that released a lethal CO₂ cloud in 1986, killing over 1,700 people.',
    history:
      'Lake Nyos fills the crater of a dormant volcano along the Cameroon Volcanic Line. On the night of 21 August 1986, magma-fed carbon dioxide that had built up under pressure in the lake\'s deep water suddenly burst to the surface, releasing a dense CO₂ cloud that rolled down the valley and asphyxiated around 1,746 people and thousands of livestock in nearby villages. It is one of only three known "exploding lakes" on Earth, alongside Lake Monoun elsewhere in Cameroon and Lake Kivu in DR Congo/Rwanda. Degassing pipes installed from 2001 now continuously vent CO₂ to prevent a recurrence.',
    culture:
      "Long before the 1986 disaster was explained scientifically, local oral tradition already treated Nyos and other crater lakes in the region as inhabited by spirits capable of violence if disturbed — a belief that hardened into deep caution after the tragedy. Survivor communities that resettled after 1986 still mark the anniversary each August, and the lake is generally approached only with a local guide out of a mix of respect and continued unease about the ground itself.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lake_Nyos',
  },
  {
    slug: 'waza-national-park',
    name: 'Waza National Park',
    region: 'Far North',
    regionKey: 'FAR_NORTH',
    lat: 11.3167,
    lng: 14.7167,
    elevationM: 320,
    sceneType: 'none',
    image: commonsUrl('Elephants around tree in Waza, Cameroon.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "Sahelian savanna reserve and a UNESCO Biosphere Reserve since 1979.",
    history:
      "Waza began life in 1934 as a French colonial hunting reserve and became a full national park in 1968, protecting roughly 1,700 km² of Sahelian savanna near the Chad border. UNESCO designated it a Biosphere Reserve in 1979 in recognition of its elephants, giraffes, lions and vast bird populations that gather around its seasonal floodplains. It remains Cameroon's best-known wildlife park, though poaching and regional insecurity have periodically threatened its animal populations.",
    culture:
      "The Kotoko and Mousgoum communities living around Waza's floodplain have fished and grazed cattle on this land for centuries, following the seasonal rise and fall of the Logone system rather than fixed field boundaries. Kotoko chiefs (sultans) at nearby towns like Logone-Birni still hold ceremonial authority rooted in a kingdom that predates colonial rule, and local knowledge of the plain's water and grazing cycles has long shaped where and when the park's wildlife can safely be viewed.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Waza_National_Park',
  },
  {
    slug: 'lobe-falls-kribi',
    name: 'Lobé Falls, Kribi',
    region: 'South',
    regionKey: 'SOUTH',
    lat: 2.8833,
    lng: 9.9167,
    elevationM: 20,
    sceneType: 'water',
    image: commonsUrl('Chutes de la Lobe.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Rare waterfalls that drop directly into the Atlantic Ocean, just south of Kribi.',
    history:
      "A few kilometres south of the beach town of Kribi, the Lobé River tumbles roughly 20 m in a wide curtain straight into the Atlantic Ocean — one of very few waterfalls in the world to do so. The falls sit on the edge of land historically used by Bagyeli (Pygmy) communities, who still guide visitors through the surrounding rainforest. Fishing pirogues launch right at the base of the falls, a scene that has made Lobé one of the most photographed spots on Cameroon's coast.",
    culture:
      "The Bagyeli, a forest people related to other Central African Pygmy groups, have traditionally treated stretches of forest along the Lobé as ancestral hunting and gathering ground, with detailed plant knowledge — including medicinal bark and forest yams — passed down orally rather than written. Today several Bagyeli families work as guides for visitors, one of the more direct ways travellers to Lobé encounter that knowledge firsthand rather than through a museum display.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Kribi',
  },
  {
    slug: 'limbe',
    name: 'Limbe',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 4.0227,
    lng: 9.2016,
    elevationM: 15,
    sceneType: 'water',
    image: commonsUrl('DOWN BEACH LIMBE CAMEROON.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "Black volcanic-sand coastal town, founded in 1858 as the missionary settlement Victoria.",
    history:
      "Limbe was founded in 1858 by the English Baptist missionary Alfred Saker as \"Victoria,\" a settlement for freed slaves and a base for mission work along the coast; it kept that name until independence-era Cameroon renamed it Limbe. Its beaches are black volcanic sand, built from centuries of eruptions off Mount Cameroon's slopes just inland. The town is also home to the Limbe Botanic Garden, laid out by German colonial administrators in 1892 as one of Africa's oldest botanical gardens, and the Limbe Wildlife Centre, a rescue and rehabilitation sanctuary for primates confiscated from the bushmeat and pet trade.",
    culture:
      "Limbe's population traces back to freed and formerly enslaved settlers, Bakweri coastal families, and generations of migrant workers drawn by the colonial-era Cameroon Development Corporation plantations, giving the town an unusually mixed and cosmopolitan character for its size. Fishermen at Down Beach still launch brightly painted wooden pirogues at dawn, and the daily fish auction there — loud, fast and entirely improvised — is as much a piece of living Limbe culture as the botanic garden itself.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Limbe',
  },
  {
    slug: 'foumban-royal-palace',
    name: 'Foumban Royal Palace',
    region: 'West',
    regionKey: 'WEST',
    lat: 5.7269,
    lng: 10.9,
    elevationM: 1180,
    sceneType: 'none',
    image: commonsUrl('Bamun sultan palace.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Seat of the Bamum Sultanate since 1394, and museum to a king who invented his own script.',
    history:
      "Foumban has been the capital of the Bamum Kingdom since around 1394. The current palace was built between 1917 and 1922 by Sultan Ibrahim Njoya, who ruled from 1888 to 1933 and is remembered as one of Africa's great polymath monarchs: around 1896 he invented the Bamum script, Shu-mom, a writing system created specifically for the Bamum language, and he later founded schools, a printing press and an army to go with it. Part of the palace now houses the Bamum Palace Museum, displaying royal regalia, historic photographs and ceremonial objects going back centuries, and the sultanate's current ruler still resides on the grounds.",
    culture:
      "Foumban is Cameroon's best-known centre of bronze-casting, wood carving and beadwork, crafts historically produced for the sultan's court and now sustained by the town's large artisan quarter. Every two years the Nguon festival brings the Bamum people together for a public airing of grievances against the sultan followed by ritual reconciliation — a centuries-old check on royal power that survives as one of Cameroon's most distinctive living traditions.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Foumban_Royal_Palace',
  },
  {
    slug: 'bafut-palace',
    name: 'Bafut Palace',
    region: 'North-West',
    regionKey: 'NORTH_WEST',
    lat: 6.0833,
    lng: 10.1,
    elevationM: 1150,
    sceneType: 'none',
    image: commonsUrl("BAFUT PALACE - FON'S BUILDING.JPG"),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Traditional seat of the Fon of Bafut, one of the Grassfields kingdoms of the North-West.',
    history:
      "Bafut is one of the most prominent Grassfields chiefdoms of the North-West Region, ruled by a Fon whose royal compound (the Achum) is considered sacred ground with its own customary laws. The palace complex includes assembly halls built from raffia poles and thatch in a style unique to Bafut's building tradition, some structures dating back well over a century. A German colonial \"fort\" was built adjacent to the palace in 1907 during the brief period Bafut fell under German rule, and today stands alongside the traditional buildings as a reminder of that history. The kingdom is also known to naturalists as the setting for Gerald Durrell's 1950s animal-collecting memoirs.",
    culture:
      "The Kwifon, a secret regulatory society of titled elders, traditionally works alongside the Fon to enforce law and settle disputes, its masked members appearing in public only during set ceremonies when ordinary residents are expected to stay indoors. Bafut's masquerade dances — elaborate carved and beaded masks representing ancestral and animal spirits — are performed at funerals, festivals and the installation of a new Fon, and remain central to how the kingdom marks major life events.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bafut',
  },
  {
    slug: 'reunification-monument-yaounde',
    name: 'Reunification Monument, Yaoundé',
    region: 'Centre',
    regionKey: 'CENTRE',
    lat: 3.8721,
    lng: 11.5213,
    elevationM: 750,
    sceneType: 'none',
    image: commonsUrl('Monument Yaoundé.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A spiralling 1970s monument marking the 1961 union of French and British Cameroon.',
    history:
      "Cameroon was split between French and British colonial administration after the First World War and only reunified in October 1961, when the formerly British-run Southern Cameroons voted to join the already-independent French Cameroun. Built in the 1970s in the capital, Yaoundé, the Reunification Monument commemorates that union: its spiralling concrete form, designed by architect Gédéon Mpando with reliefs by sculptor and Jesuit priest Engelbert Mveng, is meant to represent two paths winding together into one. It remains a national symbol, though the linguistic and political tensions of that reunification still shape Cameroonian politics today.",
    culture:
      "Every 20 May, National Day parades and public celebrations converge on Yaoundé with the monument as a backdrop, and school groups from across the country are brought to it as a first civics lesson in the reunification story. At the same time, the monument has become a focal point for a more contested cultural conversation: for many Anglophone Cameroonians it stands less as a symbol of unity than as a reminder of a union whose promised equality between the two systems was never fully delivered.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Reunification_Monument',
  },
  {
    slug: 'dja-faunal-reserve',
    name: 'Dja Faunal Reserve',
    region: 'East / South',
    regionKey: 'EAST',
    lat: 3.1667,
    lng: 12.75,
    elevationM: 600,
    sceneType: 'none',
    image: commonsUrl('Dja Faunal Reserve-109438.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'One of Africa\'s largest, least-disturbed rainforests — a UNESCO World Heritage Site since 1987.',
    history:
      "Almost entirely encircled by the Dja River, this 5,260 km² reserve is one of the largest and best-protected areas of rainforest in Africa, with roughly 90% of it left undisturbed by human activity. UNESCO inscribed it as a World Heritage Site in 1987 for its exceptional biodiversity, including western lowland gorillas, chimpanzees, forest elephants and over 100 mammal species. Baka communities, forest people with a long history of low-impact hunting and gathering in this region, still live in and around the reserve, and their ecological knowledge has informed much of the conservation work carried out there.",
    culture:
      "The Baka practise a distinctive polyphonic and yodelled singing style, performed communally during forest rituals and social gatherings, that UNESCO recognised in 2003 as a Masterpiece of the Oral and Intangible Heritage of Humanity. Central to Baka spirituality is Jengi, a forest spirit invoked to ensure a successful hunt and to initiate young men into adulthood, appearing at ceremonies as a costumed figure covered in raffia leaves.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Dja_Faunal_Reserve',
  },
  {
    slug: 'bamenda-ring-road',
    name: 'Bamenda & the Ring Road',
    region: 'North-West',
    regionKey: 'NORTH_WEST',
    lat: 5.9631,
    lng: 10.1591,
    elevationM: 1200,
    sceneType: 'mountain',
    image: commonsUrl('Bamenda from mountain road.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A ~367 km highland loop through Grassfields chiefdoms, tea estates and crater lakes.',
    history:
      "Bamenda, perched on the edge of the Bamenda Highlands, is the regional capital and cultural hub of Anglophone North-West Cameroon. From it runs the Ring Road, a roughly 367 km unpaved loop laid out during the colonial period to connect the Grassfields chiefdoms scattered across the highlands. Along its route are Fon-ruled kingdoms such as Bafut and Kom, colonial-era tea estates including Ndawara, waterfalls, and volcanic crater lakes — making it one of West Africa's classic overland routes for travellers willing to take on rough roads for highland scenery most of the country never sees.",
    culture:
      "Each Grassfields kingdom along the Ring Road keeps its own Fon, palace and masquerade societies, but they share a common social fabric built around age-grade groups, palm-wine hospitality rituals for visitors, and elaborate funeral celebrations ('cry-dies') that can draw hundreds of relatives back from as far as Douala or Europe. Weekly rotating markets, where traders move between towns on a fixed day-of-the-week cycle that has run for generations, still structure much of daily economic life across the highlands.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bamenda',
  },
  {
    slug: 'bandjoun-chefferie',
    name: 'Bandjoun Chefferie',
    region: 'West',
    regionKey: 'WEST',
    lat: 5.3667,
    lng: 10.4167,
    elevationM: 1450,
    sceneType: 'none',
    image: commonsUrl('Bandjoun palace.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'One of the largest Bamiléké royal chiefdoms, with a carved palace and museum open to visitors.',
    history:
      "Bandjoun is one of the largest and best-preserved of the roughly one hundred Bamiléké chefferies (traditional chiefdoms) that dot Cameroon's West Region. Its royal compound is centred on La'akam, an imposing chief's house raised on stilts and covered in dense wood carving and thatch, built in the distinctive Bamiléké style found nowhere else in the country. Part of the palace now operates as the Bandjoun Museum, displaying royal statues, masks, beaded thrones and ceremonial objects, and the reigning Fon still governs from the compound according to customary law that runs alongside the modern Cameroonian state.",
    culture:
      "Bamiléké funerary culture treats death as a major social event rather than a private loss: elaborate, sometimes multi-day 'cry-die' funeral celebrations honour the deceased with music, dance and the display of ancestral status objects, and can be delayed months so that far-flung family can attend. Wood carving here carries real political weight — carved thrones, doorposts and society masks are commissioned specifically to mark a person's rank within the chiefdom's hierarchy of notable societies.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bandjoun',
  },
  {
    slug: 'dschang',
    name: 'Dschang & the Bamboutos highlands',
    region: 'West',
    regionKey: 'WEST',
    lat: 5.4483,
    lng: 10.0658,
    elevationM: 1400,
    sceneType: 'mountain',
    image: commonsUrl('Le Lac municipal de DSCHANG.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "A cool hill-station town at 1,400 m, built by German and French colonists to escape the heat.",
    history:
      "Sitting at around 1,400 m in the West Region's highlands, Dschang has one of the coolest climates in Cameroon, which is exactly why German colonists first developed it as a hill station in the early 1900s, followed by the French, who expanded it into a rest and agricultural research centre. That legacy survives in the University of Dschang, one of Cameroon's leading agricultural universities, and in the town's Lac Municipal, a landscaped lake and park built during the French period that remains the town's main gathering spot. The surrounding Bamboutos highlands, terraced with market gardens and coffee, are dramatically cut by the Dschang cliffs (Falaise de Dschang), a volcanic escarpment popular with hikers.",
    culture:
      "Dschang sits in Baham and Bandjoun chiefdom territory, and the surrounding Bamiléké farming villages built their terraced hillside plots around communal labour groups called 'njangi,' rotating savings-and-work associations that still fund everything from farm labour to funerals and school fees across the West Region today. As a university town, Dschang has also become one of the livelier places in Cameroon to hear both traditional Bamiléké music and its contemporary urban offshoots side by side.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Dschang',
  },
  {
    slug: 'ekom-nkam-falls',
    name: 'Ekom-Nkam Falls',
    region: 'Littoral (West border)',
    regionKey: 'LITTORAL',
    lat: 5.1167,
    lng: 9.9333,
    elevationM: 600,
    sceneType: 'water',
    image: commonsUrl('Chutes Ekom Nkam.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'An 80 m curtain waterfall on the Nkam River, made famous by a scene in the 1984 film Greystoke.',
    history:
      "The Nkam River drops roughly 80 m over a sheer rock face near Melong, close to the West Region town of Bafang, forming one of Cameroon's most dramatic waterfalls. Ekom-Nkam gained international attention when it was used as a filming location for Greystoke: The Legend of Tarzan, Lord of the Apes (1984), and it has drawn photographers and hikers ever since for the view from the clifftop platforms opposite the falls. It sits within a working landscape of smallholder cocoa and food-crop farms, and local guides from Melong lead the short but steep descent to the base of the falls.",
    culture:
      "As with many waterfalls across the Grassfields and Littoral highlands, local Bangwa and Nweh oral tradition holds that a water spirit inhabits the pool beneath the falls, and elders have historically discouraged swimming there out of respect rather than simple caution about the current. Cocoa has been the backbone of the surrounding villages' cash economy since French colonial administrators introduced it in the early twentieth century, and harvest season still shapes the rhythm of local life around the falls.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Nkam_River',
  },
  {
    slug: 'kribi-beach-port',
    name: 'Kribi',
    region: 'South',
    regionKey: 'SOUTH',
    lat: 2.9333,
    lng: 9.9167,
    elevationM: 10,
    sceneType: 'water',
    image: commonsUrl('Beach of Kribi, Cameroon.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "Cameroon's main beach resort town, with pale sand, a German-built lighthouse and a deep-water port.",
    history:
      "Kribi grew up as a coastal trading post under German colonial rule in the 1890s, when it briefly served as the administrative capital of Kamerun before that role moved to Buea. A cast-iron lighthouse the Germans erected on the seafront still stands and remains a local landmark. Today Kribi is Cameroon's best-known beach resort, its pale sand and calm, warm water drawing visitors from Yaoundé and Douala on weekends, while just outside town its role as a working port has grown sharply since the 2018 opening of the Kribi Deep Sea Port, now one of the largest container terminals on the Gulf of Guinea.",
    culture:
      "Kribi's Batanga and Mabea communities belong to the wider Sawa (coastal) family of peoples who share a deep-rooted maritime culture built around canoe fishing, smoked-fish trade and water-centred festivals, expressed most visibly further north at Douala's Ngondo but echoed in Kribi's own smaller lakeside and coastal ceremonies honouring ancestral water spirits. Grilled fresh fish served on the beach with miondo (fermented cassava sticks) is the town's signature dish, sold every evening by women running informal stalls along the shore.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Kribi',
  },
  {
    slug: 'korup-national-park',
    name: 'Korup National Park',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 5.2,
    lng: 8.85,
    elevationM: 100,
    sceneType: 'none',
    image: commonsUrl('Korup National park.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "Africa's oldest rainforest, protected since 1986 and laced with a canopy walkway and swing bridges.",
    history:
      "Korup protects over 1,260 km² of lowland rainforest believed to be among the oldest in Africa, having survived relatively undisturbed through past ice ages while forests elsewhere retreated — which helps explain its extraordinary plant diversity, with well over 600 tree species recorded. It was gazetted as a national park in 1986 after a long international conservation campaign led with the Cameroonian government, and its Mana Bridges, a set of swaying suspension footbridges over the Mana River, are now one of its best-known features for visitors heading into the forest interior. The park is home to drills, red colobus monkeys and forest elephants, among more than 400 recorded bird species.",
    culture:
      "Oroko and neighbouring communities around Korup have long maintained sacred groves and taboo species — plants and animals that customary law forbids hunting or cutting — a form of informal conservation that predates the park's official protection by generations and that researchers now credit with helping preserve some of its rarest plants. Traditional herbalists from villages bordering the park still hold detailed knowledge of forest medicinal plants, some of which has fed directly into pharmaceutical research conducted in and around Korup since the 1990s.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Korup_National_Park',
  },
  {
    slug: 'musgum-mud-huts',
    name: 'Musgum Mud Huts, Pouss',
    region: 'Far North',
    regionKey: 'FAR_NORTH',
    lat: 10.85,
    lng: 14.9333,
    elevationM: 320,
    sceneType: 'none',
    image: commonsUrl('Maison obus.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Shell-shaped mud dwellings near the Chad border, built without a single piece of timber.',
    history:
      "Around the village of Pouss on the floodplain near the Chad border, the Musgum people traditionally built houses entirely from sun-dried mud in tall, ribbed, dome or cone shapes that outsiders nicknamed cases obus, \"shell houses,\" for their resemblance to artillery shells. Built up in coils without any wooden frame, and patterned with raised horizontal and diagonal ridges that also serve as a ladder for repairs, they are considered one of the most distinctive vernacular building traditions in Africa. Very few original huts remain in daily use today, and both UNESCO and Cameroonian heritage bodies have supported restoration projects to keep the technique from disappearing entirely.",
    culture:
      "Building a case obus was traditionally a communal skill taught through direct apprenticeship rather than any written method, with the ridged exterior pattern doubling as a practical ladder for the annual re-plastering the huts need after the rainy season. The Musgum are also skilled fishermen and potters of the Logone floodplain, and their seasonal move between fishing camps and home villages as the river rises and falls has shaped settlement patterns in this corner of the Far North for centuries.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Musgum_mud_hut',
  },
  {
    slug: 'seme-beach',
    name: 'Seme Beach',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 3.9736,
    lng: 9.2394,
    elevationM: 10,
    sceneType: 'water',
    image: commonsUrl('Seme beach limbe Cameroon.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A quieter black-sand beach south of Limbe, built up around a beachfront resort.',
    history:
      "A few kilometres south of central Limbe, Seme Beach is one of the calmer stretches of the South-West coast, its dark volcanic sand backed by palms and the low outline of Mount Cameroon inland. A beachfront hotel and resort development here in the 2000s turned what was a fishing shoreline into one of the region's more organised weekend getaways, with the town's older fishing camps continuing to work the coastline alongside it.",
    culture:
      "Like the rest of the Limbe coastline, Seme sits in Bakweri fishing territory, where canoe crews still read the surf and tides using knowledge passed down rather than instruments. Weekends bring families from Limbe and Douala for grilled fish and swimming, making Seme as much a piece of everyday South-West leisure culture as it is a tourist stop.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Limbe',
  },
  {
    slug: 'mondoni-beach',
    name: 'Mondoni Beach',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 4.0517,
    lng: 9.1719,
    elevationM: 10,
    sceneType: 'water',
    image: commonsUrl('Limbe Atlantic Ocean 1.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A working fishing beach on the Limbe–Idenau coast, lava rock and black sand under Mount Cameroon.',
    history:
      "Mondoni lies on the stretch of South-West coastline between Limbe and Idenau where Mount Cameroon's lava flows have reached the Atlantic in past eruptions, leaving a shoreline of black volcanic sand and rock pools rather than the pale beaches further south. It remains primarily a working fishing community rather than a resort, with wooden pirogues drawn up on the sand and nets laid out to dry — a more unfiltered look at how this coast actually makes its living.",
    culture:
      "Fishing households along this coast are almost all Bakweri or Isubu, and daily life still runs on tide and season rather than the clock: crews go out before dawn and the catch is sold straight off the beach to traders who carry it inland to Buea and Limbe's markets by mid-morning. Boat-building here follows techniques handed down within families, with new pirogues still carved and fire-hardened by hand rather than bought pre-made.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Limbe',
  },
  {
    slug: 'bota-island',
    name: 'Bota Island',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 3.9814,
    lng: 9.2467,
    elevationM: 5,
    sceneType: 'water',
    image: commonsUrl('Bota Island in Limbe Southwest Cameroon.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "A cluster of small islands off Limbe's Bota district, reached by dugout canoe.",
    history:
      "Bota Island sits just offshore from Limbe's Bota neighbourhood, part of a small archipelago of volcanic islets that also gave the area its role as a 19th-century port and, briefly, a base connected to the coastal trade that ran through Victoria (as Limbe was then called). Fishermen still cross to the islands daily by dugout canoe, and the short crossing has become a popular half-day trip for visitors staying in Limbe who want open water and a view back at Mount Cameroon from the sea.",
    culture:
      "The waters around Bota are worked by Bakweri and Isubu fishing families whose canoe routes between the mainland and the islands have stayed largely unchanged for generations, even as Limbe itself has grown into an industrial port town around them. Local boatmen who ferry visitors across often double as informal guides, sharing stories about the islands and the wrecks and reefs in the surrounding water passed down from older fishermen.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Limbe',
  },
  {
    slug: 'mont-mbankolo',
    name: 'Mont Mbankolo',
    region: 'Centre',
    regionKey: 'CENTRE',
    lat: 3.9089,
    lng: 11.5028,
    elevationM: 1000,
    sceneType: 'mountain',
    image: commonsUrl('Mont mbankolo yaoundé.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "One of the seven hills of Yaoundé, and the capital's favourite dawn hike.",
    history:
      "Yaoundé is built across seven hills, and Mbankolo is one of the tallest and most climbed of them, its summit ringed by the radio and television transmission masts that have broadcast to the capital since the mid-20th century. The climb is short enough to fit before work, which is exactly how most people who go up it treat it, and the payoff is a panoramic view over Yaoundé's red-roofed hills and valleys that the city's flat main avenues never give you.",
    culture:
      "Mbankolo sits on land that has been Ewondo territory for generations, and its slopes are still dotted with family compounds and small farms worked the same way they were before the transmission towers arrived. Dawn on Mbankolo is a genuine piece of Yaoundé daily life rather than a tourist ritual — office workers, students and church groups climbing before the heat sets in, often finishing with roadside beignets and coffee at the base.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Yaound%C3%A9',
  },
  {
    slug: 'mvog-betsi-zoo',
    name: 'Mvog-Betsi Zoo & the Mefou primate sanctuary',
    region: 'Centre',
    regionKey: 'CENTRE',
    lat: 3.8547,
    lng: 11.4936,
    elevationM: 750,
    sceneType: 'none',
    image: commonsUrl('Yaoundé Mvog Bétsi.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "Yaoundé's municipal zoo, and the origin story of one of Africa's largest primate rescues.",
    history:
      "Mvog-Betsi has been Yaoundé's municipal zoo for decades, historically a cramped first encounter with Cameroonian wildlife for generations of the capital's schoolchildren. Overcrowding and welfare concerns here in the 1990s led the conservation group Ape Action Africa to establish a proper sanctuary at Mefou National Park, about 35 km south of the city, to rehome gorillas and chimpanzees confiscated from the illegal bushmeat and pet trade — some of them transferred directly from Mvog-Betsi's own cages. Mefou has since grown into one of the largest primate rescue projects in Africa, caring for several hundred animals.",
    culture:
      "For most Yaoundé families, Mvog-Betsi remains the accessible in-town version of this story — an afternoon trip rather than a half-day drive to Mefou — and it is often paired with school science trips that introduce the illegal wildlife trade as a live conservation issue rather than an abstract one. The zoo and the sanctuary together are one of the more visible places where Cameroonian conservation NGOs, government wildlife services and international donors work side by side.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mefou_National_Park',
  },
  {
    slug: 'lobeke-national-park',
    name: 'Lobéké National Park',
    region: 'East',
    regionKey: 'EAST',
    lat: 2.15,
    lng: 15.6,
    elevationM: 400,
    sceneType: 'none',
    image: commonsUrl('Buffle dans le Parc National de Lobéké.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Congo Basin rainforest shared with two neighbouring CEMAC countries as one UNESCO site.',
    history:
      "Lobéké protects roughly 2,180 km² of dense Congo Basin rainforest in Cameroon's far south-east corner, gazetted as a national park between 1999 and 2001. Rather than standing alone, it forms one third of the Sangha Trinational, a single unbroken forest landscape that Cameroon manages jointly with the Republic of the Congo and the Central African Republic — three CEMAC countries sharing one UNESCO World Heritage Site since 2012. Its bais, natural forest clearings with mineral-rich water, draw forest elephants, western lowland gorillas and forest buffalo into the open where they can actually be seen, unlike in the dense forest around them.",
    culture:
      "Baka and Bangando communities live in and around Lobéké, with the Baka's forest knowledge — tracking, plant medicine, and the polyphonic singing tradition shared with their relatives near the Dja reserve — central to how the park is managed and interpreted for visitors. Because the protected forest crosses three national borders without a break, conservation staff and trackers from Cameroon, Congo and the Central African Republic work across those borders more routinely than almost anyone else in the region, a quiet, practical version of the regional integration CEMAC is meant to represent.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lob%C3%A9k%C3%A9_National_Park',
  },
  {
    slug: 'benoue-national-park',
    name: 'Bénoué National Park',
    region: 'North',
    regionKey: 'NORTH',
    lat: 8.3333,
    lng: 13.8333,
    elevationM: 220,
    sceneType: 'none',
    image: commonsUrl('BénouéNP4.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'Savanna and gallery forest along the Bénoué River — lions, hippos and a UNESCO Biosphere Reserve.',
    history:
      "Bénoué National Park protects about 1,800 km² of Sudano-Guinean savanna and riverside gallery forest along the Bénoué River, whose waters eventually cross into Nigeria to feed the Niger. Established in 1968 and named a UNESCO Biosphere Reserve in 1981, it is one of a cluster of parks in the North Region — alongside Faro and Bouba Njida — that historically drew big-game hunting concessions and now increasingly draws photographic safari visitors to see its lions, hippos, elephants and Kob antelope.",
    culture:
      "The North Region around Bénoué is Fulani (Peul) country, where transhumant cattle-herding routes have crossed this land for centuries and still brush against the park's boundaries during the dry season. Customary authority here runs through Lamidats — Fulani sultanates such as the powerful Rey Bouba lamidat nearby — whose Lamidos hold real standing over local land and community affairs alongside the modern Cameroonian state, a parallel system of governance that predates the park by well over a century.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/B%C3%A9nou%C3%A9_National_Park',
  },
  {
    slug: 'vina-falls',
    name: 'Vina Falls (Chutes de la Vina)',
    region: 'Adamawa',
    regionKey: 'ADAMAWA',
    lat: 7.2333,
    lng: 13.65,
    elevationM: 1100,
    sceneType: 'water',
    image: commonsUrl('Chute vina2.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A waterfall dropping off the edge of the Adamawa Plateau near Ngaoundéré.',
    history:
      "The Vina River drops over a broken volcanic ledge on the Adamawa Plateau not far from Ngaoundéré, forming one of the signature natural landmarks of the Adamawa Region. The plateau itself is the highland spine of central Cameroon — a cooler, grassy tableland separating the rainforested south from the Sahelian north — and its volcanic origins are what give the Vina its dramatic drop rather than a gentle lowland stream.",
    culture:
      "The plateau around the falls is Mbum and Fulani (Peul) country, and cattle grazing shapes the landscape almost as much as geology does: the grasslands around Vina Falls are part of the seasonal transhumance routes that Mbororo Fulani herders have followed for generations. The falls sit within reach of Ngaoundéré, seat of one of the most powerful 19th-century Fulani Lamidats, and are a popular short trip from the city for exactly the reason most waterfalls are — a break from the heat and a place families and church groups picnic on weekends.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Vina_(department)',
  },
  {
    slug: 'ngaoundere-falaise',
    name: 'Ngaoundéré & the Adamawa Plateau escarpment',
    region: 'Adamawa',
    regionKey: 'ADAMAWA',
    lat: 7.3167,
    lng: 13.5833,
    elevationM: 1100,
    sceneType: 'mountain',
    image: commonsUrl('La falaise de Ngaoundéré.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: "The Adamawa capital, perched where its volcanic plateau breaks into a dramatic escarpment.",
    history:
      "Ngaoundéré sits at the edge of the Adamawa Plateau, where the highland tableland that forms the 'roof' of central Cameroon gives way to a dramatic falaise (escarpment) dropping toward the lowlands. The town became the seat of a powerful Fulani Lamidat during the 19th-century Fulani expansion across the region, and its Lamido's palace and Grand Mosque remain the city's traditional and religious centre. Ngaoundéré is also the northern terminus of the Transcamerounais railway from Douala and Yaoundé, historically the practical gateway where the forested south hands off to the Sahelian north.",
    culture:
      "The Ngaoundéré Lamidat still exercises real customary authority alongside the modern state, with the Lamido presiding over Islamic court matters and holding a ceremonial role the Cameroonian government formally recognises — one of the clearest surviving examples of the parallel governance found across northern Cameroon's Fulani sultanates. The plateau's cool climate supports Mbororo Fulani cattle culture on a large scale, and watching sunset from the falaise over the escarpment and grasslands below is a well-worn local tradition rather than a tourist invention.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Ngaound%C3%A9r%C3%A9',
  },
  {
    slug: 'bimbia-slave-trade-site',
    name: 'Bimbia Slave Trade Site',
    region: 'South-West',
    regionKey: 'SOUTH_WEST',
    lat: 3.9575,
    lng: 9.2242,
    elevationM: 15,
    sceneType: 'water',
    image: commonsUrl('Bimbia Slave Port.jpg'),
    imageCredit: 'Wikimedia Commons',
    teaser: 'A former slave port south-east of Limbe where tens of thousands were shipped out in chains.',
    history:
      "Bimbia sits on the Atlantic coast just south-east of Limbe, and from the 17th century until the trade's suppression in the mid-19th century it was one of the busiest slave ports on this stretch of coastline — trade here was most intense between 1760 and 1841, and researchers estimate around 40,000 enslaved people passed through it before being shipped across the Atlantic. The site still holds physical traces of that history: chains and dungeons, slave quarters, a tattooing room where captives were marked according to buyer, an oil mill, and two successive \"doors of no return\" through which people were marched to the waiting ships. It was also here that Bimbia's own Isubu kings — William I and William II of Bimbia — signed 19th-century treaties with Britain aimed at suppressing the trade, and where Jamaican-born Baptist missionary Joseph Merrick founded Cameroon's first Baptist church in 1843, followed by a monument to English missionary Alfred Saker, who went on to found nearby Limbe. Overgrown and largely forgotten for over a century, the site was rediscovered in 1987, declared a National Cultural Heritage site by the Cameroonian government in 2017, and is now the subject of an active push toward UNESCO World Heritage status.",
    culture:
      "Bimbia was the seat of an independent Isubu (Subu) kingdom before German annexation in 1884, and its rulers' adoption of English names — William I, William II — reflects the diplomatic relationships coastal Central African kingdoms built with Britain during the era of anti-slave-trade treaties, a history now central to how the site is presented rather than a footnote. Today the Bimbia Bonadikombo community forest committee manages access to the ruins, and guided walks through the site are treated explicitly as heritage and remembrance tourism — a place of pilgrimage for the African diaspora tracing this history back to where it began, not a conventional sightseeing stop.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bimbia',
  },
];
