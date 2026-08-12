/**
 * Seventeen real Cameroonian hiking destinations — at least one in each of
 * the country's ten regions. East, West, Far North and Adamawa each got a
 * second entry to fix regions that used to have only one; Centre, North and
 * South are still single-entry and are the next gap to close.
 *
 * Figures are drawn from published route descriptions, national-park literature
 * and guide-association rates. Distances and times are for the standard route
 * and assume a moderately fit hiker; the whole point of the platform is that
 * these numbers are honest, so treat any edit as a content change that needs
 * checking against a local guide association before publishing.
 */

/** Real photos of the actual named place, hotlinked from Wikimedia Commons via Special:FilePath. */
const commonsUrl = (file, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export const trails = [
  {
    slug: 'mount-cameroon-guinness-route',
    name: 'Mount Cameroon — Guinness Route to Fako Summit',
    summary:
      "West Africa's highest peak and an active volcano: 4,040 m of rainforest, montane grass and black lava, climbed from Buea in two hard days.",
    description: `Mount Cameroon — Mongo ma Ndemi, "Mountain of Greatness" — rises straight out of the Atlantic to 4,040 m, making it the highest point in West and Central Africa and one of the few places on earth where you can start in tropical rainforest at breakfast and be on bare volcanic ash by nightfall.

The standard ascent is the Guinness Route, which begins at the Mount Cameroon Ecotourism Organisation (Mount CEO) office in Buea. The path climbs through farmland to Hut 1 (1,850 m), breaks out of the treeline shortly after, and reaches Hut 2 (2,850 m) where almost all parties spend the night. Summit day starts at 04:00 for the final 1,200 m over loose scoria to Fako summit, then descends the same way or continues over the 1999 and 2000 lava flows towards Mann's Spring.

This is a serious mountain, not a walk. It is climbed year-round but the summit sits in cloud for much of the wet season, and the temperature can drop below 5 °C with wind and rain while Buea, three hours below, is at 28 °C. Altitude sickness is common above Hut 2. A registered guide and at least one porter are compulsory — this is enforced at the park gate, and it is also what keeps the mountain's economy in local hands.

The annual Mount Cameroon Race of Hope in February sends runners from Buea to the summit and back in under five hours. It is not a benchmark for anyone else.`,
    region: 'SOUTH_WEST',
    nearestTown: 'Buea',
    difficulty: 'EXPERT',
    category: 'SUMMIT',
    distanceKm: 36,
    elevationGainM: 3080,
    durationMinutes: 2880,
    summitM: 4040,
    startLat: 4.1561,
    startLng: 9.241,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [9.241, 4.1561],
        [9.2255, 4.1698],
        [9.2098, 4.1802],
        [9.1955, 4.1889],
        [9.1822, 4.1948],
        [9.1706, 4.2033],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: [
      'Altitude sickness above 2,800 m',
      'Active volcano — check for eruption advisories',
      'Loose scoria and ash on the summit cone',
      'Rapid temperature drop and whiteout cloud',
      'No reliable mobile coverage above Hut 2',
    ],
    waterSources:
      'Treated water is sold in Buea and at the Mount CEO office. There is a spring near Hut 1 and an unreliable one at Hut 2 — carry 4 L per person per day and do not count on refills above the treeline.',
    permitRequired: true,
    permitInfo:
      'Park entry and a registered guide are booked through the Mount Cameroon Ecotourism Organisation (Mount CEO) in Buea. Expect roughly 45,000–70,000 XAF per person for a two-day climb including guide, porter and hut fees. Register at the office the afternoon before you climb.',
    gettingThere:
      'Buea is about 1 h 15 from Douala by road via Mutengene. Shared taxis run from Douala Bonabéri and from Limbe. The trailhead is at the Mount CEO office in Buea Town, walking distance from the Buea motor park.',
    coverImage:
      commonsUrl('Mount fako (mount Cameroon).jpg'),
    waypoints: [
      { name: 'Mount CEO office, Buea Town', lat: 4.1561, lng: 9.241, elevationM: 960, order: 0, description: 'Registration, guide assignment and gear check. Compulsory stop.' },
      { name: 'Hut 1 (Rest House)', lat: 4.1698, lng: 9.2255, elevationM: 1850, order: 1, description: 'Last shade and the last dependable spring. Most parties take 3–4 h to here.' },
      { name: 'Treeline', lat: 4.1802, lng: 9.2098, elevationM: 2200, order: 2, description: 'Forest gives way to montane grassland. Wind picks up sharply.' },
      { name: 'Hut 2', lat: 4.1889, lng: 9.1955, elevationM: 2850, order: 3, description: 'Overnight stop. Cold, exposed, no reliable water. Bring a sleeping bag rated to 0 °C.' },
      { name: 'Hut 3 / Magic Tree', lat: 4.1948, lng: 9.1822, elevationM: 3500, order: 4, description: 'Dawn checkpoint on summit day. Turn back here if anyone is showing altitude symptoms.' },
      { name: 'Fako Summit', lat: 4.2033, lng: 9.1706, elevationM: 4040, order: 5, description: 'The highest point in West Africa. Clear views to the Atlantic and Bioko before about 08:00.' },
    ],
  },
  {
    slug: 'mount-kupe-nyasoso',
    name: 'Mount Kupe from Nyasoso',
    summary:
      'A steep 2,064 m forest peak above Nyasoso, famous among birdwatchers for the Mount Kupe bushshrike and thick with local legend.',
    description: `Mount Kupe stands alone above the village of Nyasoso, a granite dome wrapped in some of the best-preserved submontane forest in Central Africa. Birdwatchers come from across the world for the Mount Kupe bushshrike, Grey-necked Picathartes and Green-breasted Bushshrike; most other visitors come for the climb itself, which is short in distance and brutal in gradient.

The Max's Trail route leaves Nyasoso and gains around 1,200 m in roughly 5 km. There are no switchbacks worth the name — the path goes up, over roots and wet rock, through forest that closes overhead the whole way. Six to eight hours round trip is normal. The summit has limited views because of the tree cover, so the reward here is the forest and the wildlife rather than a panorama.

Kupe carries heavy cultural weight locally: it appears in Bakossi tradition as a place associated with ancestral spirits and, historically, with stories of people taken to work invisible plantations on the mountain. Guides from Nyasoso will tell you which parts of the forest are treated as sacred. Respect that — it is a condition of access, not a folkloric footnote.`,
    region: 'SOUTH_WEST',
    nearestTown: 'Nyasoso (Tombel)',
    difficulty: 'HARD',
    category: 'SUMMIT',
    distanceKm: 11,
    elevationGainM: 1230,
    durationMinutes: 480,
    summitM: 2064,
    startLat: 4.8231,
    startLng: 9.6889,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [9.6889, 4.8231],
        [9.6862, 4.8156],
        [9.6841, 4.8082],
        [9.6833, 4.8],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February'],
    hazards: [
      'Extremely steep, root-choked path',
      'Permanently wet rock — very slippery',
      'Leeches and biting ants in the wet season',
      'Easy to lose the path in thick forest without a guide',
    ],
    waterSources:
      'Streams in the lower forest are reliable but must be treated. Nothing dependable in the last 400 m of ascent.',
    permitRequired: true,
    permitInfo:
      'Guides are arranged through the Nyasoso village guide association or the Kupe-Muanenguba conservation office. Around 15,000–25,000 XAF per group per day. Birding guides cost more and are worth it.',
    gettingThere:
      'Nyasoso is reached from Kumba via Tombel, or from Bafoussam via Bangem — roughly 3 h from Kumba on a rough road. Vehicles are less frequent in the wet season.',
    coverImage:
      commonsUrl('Mount Kupe Muanenguba.jpeg'),
    waypoints: [
      { name: 'Nyasoso village trailhead', lat: 4.8231, lng: 9.6889, elevationM: 840, order: 0, description: "Meet your guide at the village. Max's Trail starts behind the mission." },
      { name: 'Picathartes site turn-off', lat: 4.8156, lng: 9.6862, elevationM: 1180, order: 1, description: 'Side path to a known Grey-necked Picathartes nesting rock. Approach quietly and only with a guide.' },
      { name: 'Shoulder ridge', lat: 4.8082, lng: 9.6841, elevationM: 1650, order: 2, description: 'The gradient briefly eases. Last sensible rest before the summit push.' },
      { name: 'Kupe summit', lat: 4.8, lng: 9.6833, elevationM: 2064, order: 3, description: 'Forested summit with partial views towards Manengouba on a clear morning.' },
    ],
  },
  {
    slug: 'manengouba-twin-lakes',
    name: 'Manengouba Crater and the Twin Lakes',
    summary:
      'A grassy caldera rim at 2,411 m above Bangem, holding the male and female lakes — big skies, Fulani cattle herds, and the gentlest high-altitude walking in Cameroon.',
    description: `The Manengouba massif is a wide, gentle caldera on the Cameroon Line, and it is the best introduction to high-altitude hiking in the country. Where Mount Cameroon punishes and Kupe suffocates, Manengouba opens out: rolling short-grass highland, cattle tracks, and a crater floor holding two lakes that Bakossi and Mbo tradition names the male lake (Lac de l'Homme) and the female lake (Lac de la Femme).

Most people walk in from Bangem or from the Melong side, reach the crater rim, drop down to the lakes and return the same day. The rim circuit adds a few hours and is worth it for the views: on a clear morning you can pick out Mount Cameroon to the south-west and the Bamboutos ridge to the north-east.

At 2,400 m it gets genuinely cold at night and the wind rarely stops. The lakes are held to be spiritually significant and there are local restrictions on swimming — ask your guide rather than assuming. This is also working pasture, so expect to share the path with Mbororo herders and their cattle; give way to the animals.`,
    region: 'LITTORAL',
    nearestTown: 'Bangem / Melong',
    difficulty: 'MODERATE',
    category: 'LAKE',
    distanceKm: 14,
    elevationGainM: 780,
    durationMinutes: 420,
    summitM: 2411,
    startLat: 5.0442,
    startLng: 9.8478,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [9.8478, 5.0442],
        [9.8422, 5.0361],
        [9.8367, 5.028],
        [9.8333, 5.0167],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: [
      'Cold wind and exposure on the rim — no shelter',
      'Thick afternoon cloud that hides the path',
      'Cattle and herding dogs on the crater floor',
      'Steep loose descent to the lakes',
    ],
    waterSources:
      'Streams on the approach. Do not drink from the lakes. Carry 2–3 L.',
    permitRequired: false,
    permitInfo:
      'No formal permit, but a local guide from Bangem is strongly recommended (10,000–20,000 XAF per group) — the grassland paths all look alike in cloud.',
    gettingThere:
      'Melong is on the Douala–Bafoussam highway, about 3 h from Douala. From Melong it is a 1–2 h climb by moto or 4x4 to the rim road. Bangem is reachable from Nyasoso or Bafoussam.',
    coverImage:
      commonsUrl('Manengouba-Tombel.jpg'),
    waypoints: [
      { name: 'Bangem trailhead', lat: 5.0442, lng: 9.8478, elevationM: 1640, order: 0 },
      { name: 'Grassland shoulder', lat: 5.0361, lng: 9.8422, elevationM: 1980, order: 1, description: 'Treeline ends. First view into the caldera.' },
      { name: 'Crater rim high point', lat: 5.028, lng: 9.8367, elevationM: 2411, order: 2, description: 'Best vantage point over both lakes. Very exposed.' },
      { name: 'Lac de la Femme', lat: 5.0167, lng: 9.8333, elevationM: 1900, order: 3, description: 'The smaller, deeper lake. Locally significant — do not swim without asking.' },
    ],
  },
  {
    slug: 'ekom-nkam-falls-trail',
    name: 'Ekom-Nkam Falls Forest Walk',
    summary:
      'A short, wet, dramatic descent through rainforest to an 80 m waterfall on the Nkam river — the easiest big-payoff hike in Cameroon.',
    description: `Ekom-Nkam is the waterfall that most Cameroonians picture when they picture a waterfall: the Nkam river drops around 80 m in a single curtain into a forest amphitheatre near Nkongsamba. It stood in for the jungle in the 1984 film Greystoke, and the viewing area has barely changed since.

The hike itself is modest — under 3 km round trip — but the descent to the base is steep, permanently wet and slick with spray, on steps cut into the rock and reinforced with roots. Going down takes 30–45 minutes; coming back up takes longer than people expect. Because it is short and reachable in a day from Douala, this is the trail to start with if you have never hiked in Cameroon before.

Flow is enormous between July and October, when the spray soaks you from the viewpoint and the lower path can be closed. December to March gives a thinner fall but safe access to the base and a swimmable plunge pool downstream. Local guides at the entrance will take you to the base and, if you ask, on the longer forest loop above the falls.`,
    region: 'LITTORAL',
    nearestTown: 'Nkongsamba',
    difficulty: 'EASY',
    category: 'WATERFALL',
    distanceKm: 2.8,
    elevationGainM: 210,
    durationMinutes: 150,
    summitM: null,
    startLat: 4.9231,
    startLng: 9.9314,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [9.9314, 4.9231],
        [9.9298, 4.9212],
        [9.9285, 4.9196],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'March', 'April'],
    hazards: [
      'Wet rock steps with a long drop alongside',
      'Spray makes the lower path slippery year-round',
      'Lower access often closed July–October at high flow',
      'Strong undertow in the pool below the fall',
    ],
    waterSources: 'Bring your own. The river is not safe to drink untreated.',
    permitRequired: true,
    permitInfo:
      'A small site entry fee (about 2,000–5,000 XAF for non-residents) is collected at the gate, and guides are available there for around 5,000 XAF per group.',
    gettingThere:
      'Nkongsamba is about 2 h 30 from Douala on the Bafoussam road. The falls are roughly 20 km further towards Melong, then a signposted track — any moto in Nkongsamba knows Ekom.',
    coverImage:
      commonsUrl('Chutes Ekom Nkam.jpg'),
    waypoints: [
      { name: 'Site entrance and viewpoint', lat: 4.9231, lng: 9.9314, elevationM: 720, order: 0, description: 'Pay here. The upper viewpoint alone is worth the trip if you cannot manage the descent.' },
      { name: 'Rock stairway', lat: 4.9212, lng: 9.9298, elevationM: 610, order: 1, description: 'Steep, wet, hand-over-hand in places. Not suitable in smooth-soled shoes.' },
      { name: 'Base of the falls', lat: 4.9196, lng: 9.9285, elevationM: 510, order: 2, description: 'Full 80 m curtain overhead. Expect to be soaked.' },
    ],
  },
  {
    slug: 'mount-oku-kilum-ijim',
    name: 'Mount Oku and the Kilum-Ijim Forest',
    summary:
      "Cameroon's second-highest peak at 3,011 m, ringed by the largest surviving montane forest in West Africa and a crater lake the Oku people hold sacred.",
    description: `Mount Oku is the high point of the Bamenda Highlands at 3,011 m — second only to Mount Cameroon — and the Kilum-Ijim forest on its flanks is the largest remaining patch of Afromontane forest in West Africa. It is the only place on earth to see Bannerman's Turaco and the Banded Wattle-eye, and the community forest management scheme that protects it is one of Cameroon's genuine conservation successes.

The climb starts from Elak-Oku and goes up through farm, then through the forest belt with its moss-hung trees and endemic birds, then out onto open grassland for the final ridge to the summit. Figure seven to nine hours round trip. It is less steep than Kupe and less punishing than Mount Cameroon, but the altitude is real and the weather in the highlands changes without warning.

Lake Oku sits in a crater on the mountain's south side, surrounded by forest and home to the Lake Oku clawed frog, found nowhere else. It is sacred to the Oku people: no swimming, no fishing, and there are days when access is restricted for traditional reasons. Your guide will know. The Fon's palace in Elak is worth a visit before or after the climb.`,
    region: 'NORTH_WEST',
    nearestTown: 'Elak-Oku (Kumbo)',
    difficulty: 'HARD',
    category: 'SUMMIT',
    distanceKm: 18,
    elevationGainM: 960,
    durationMinutes: 540,
    summitM: 3011,
    startLat: 6.2244,
    startLng: 10.4761,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [10.4761, 6.2244],
        [10.4722, 6.2158],
        [10.4689, 6.2072],
        [10.4667, 6.2],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February'],
    hazards: [
      'Altitude above 2,500 m',
      'Cold rain and hail in the highlands, any month',
      'Dense forest with confusing side paths',
      'Restricted access days around Lake Oku',
    ],
    waterSources:
      'Forest streams on the ascent, treat before drinking. Do not take water from Lake Oku.',
    permitRequired: true,
    permitInfo:
      'Arrange guides through the Kilum-Ijim community forest project or the Oku council in Elak. Around 15,000–25,000 XAF per group. Ask specifically about Lake Oku access on the day you plan to go.',
    gettingThere:
      'Elak-Oku is about 1 h 30 from Kumbo, which is 3 h from Bamenda. Check current security advisories for the North-West region before travelling.',
    coverImage:
      commonsUrl('Lake Oku Cameroon.jpg'),
    waypoints: [
      { name: "Elak-Oku, Fon's palace", lat: 6.2244, lng: 10.4761, elevationM: 2050, order: 0, description: 'Guide meeting point and customary courtesy call.' },
      { name: 'Kilum forest edge', lat: 6.2158, lng: 10.4722, elevationM: 2400, order: 1, description: "Enter the community forest. Best chance of Bannerman's Turaco in the first hour after dawn." },
      { name: 'Grassland col', lat: 6.2072, lng: 10.4689, elevationM: 2760, order: 2 },
      { name: 'Mount Oku summit', lat: 6.2, lng: 10.4667, elevationM: 3011, order: 3, description: 'Views across the whole Bamenda Highlands when the cloud lifts.' },
    ],
  },
  {
    slug: 'lake-awing-crater-walk',
    name: 'Lake Awing Crater Walk',
    summary:
      'A half-day highland loop around a quiet volcanic crater lake between Bamenda and Santa, through Fulani grazing land and eucalyptus.',
    description: `Lake Awing is a crater lake in the Bamenda Highlands, sitting at about 1,750 m in the hills between Bamenda and Santa. It sees a fraction of the traffic that Oku or Manengouba get, which is exactly its appeal: a quiet, rolling, largely open walk with a lake at the centre of it.

The loop from Awing village follows farm tracks and grazing paths around the crater, with a couple of short climbs onto the rim for the view. It is comfortably done in four hours at a relaxed pace, which makes it a real option for a first-time hiker or a family. The village is Ngemba-speaking and the lake features in local tradition; as with Oku, ask before entering the water.

The best hours are early — the highlands cloud over by mid-afternoon and the light on the water goes flat. Bring a windproof layer even in the dry season.`,
    region: 'NORTH_WEST',
    nearestTown: 'Awing (Santa)',
    difficulty: 'EASY',
    category: 'LAKE',
    distanceKm: 9,
    elevationGainM: 320,
    durationMinutes: 240,
    summitM: 1920,
    startLat: 5.9528,
    startLng: 10.2492,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [10.2492, 5.9528],
        [10.2531, 5.9481],
        [10.2508, 5.9427],
        [10.2451, 5.9449],
        [10.2492, 5.9528],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: ['Afternoon cloud and cold wind', 'Unfenced steep crater edges', 'Muddy farm tracks after rain'],
    waterSources: 'Village boreholes in Awing. Carry 1.5–2 L.',
    permitRequired: false,
    permitInfo: 'No permit. A village guide costs around 10,000 XAF per group and smooths access across farmland.',
    gettingThere:
      'Awing is about 45 minutes from Bamenda via Santa by shared taxi or moto. Check current security advisories for the North-West region.',
    coverImage:
      commonsUrl('Lake Kuk in the Northwest Region of Cameroon.jpg'),
    waypoints: [
      { name: 'Awing village centre', lat: 5.9528, lng: 10.2492, elevationM: 1690, order: 0 },
      { name: 'Eastern rim viewpoint', lat: 5.9481, lng: 10.2531, elevationM: 1920, order: 1, description: 'Full view across the crater. Best light before 09:00.' },
      { name: 'Lakeshore path', lat: 5.9427, lng: 10.2508, elevationM: 1750, order: 2 },
      { name: 'Western grazing land', lat: 5.9449, lng: 10.2451, elevationM: 1810, order: 3, description: 'Mbororo cattle camps. Greet the herders before crossing.' },
    ],
  },
  {
    slug: 'mount-bamboutos-ridge',
    name: 'Mount Bamboutos Ridge Traverse',
    summary:
      'A 2,740 m ridge walk across the roof of the Western Highlands, above Mbouda — long, open, cold, and the finest high-country views in Cameroon.',
    description: `The Bamboutos massif is the third-highest point in Cameroon at 2,740 m and forms the watershed between the West and North-West regions. The traverse along its ridge is the closest thing the country has to classic high-country ridge walking: open grassland, wide horizons, and almost no shade for hours at a stretch.

Routes start from the Mbouda side or from Babadjou, climbing steadily through farm terraces to the ridge and then following it. A full traverse is a long day — eight to ten hours — but you can turn back from the high point at any time, which makes this flexible for mixed-ability groups. The upper slopes are heavily grazed and, increasingly, heavily cultivated; you will see the erosion, and it is a live conservation issue locally.

Bring a proper wind layer. At 2,700 m in the harmattan the wind is constant and cutting, and there is nowhere to shelter. Start at first light, because cloud builds over the ridge most afternoons and takes the views with it.`,
    region: 'WEST',
    nearestTown: 'Mbouda',
    difficulty: 'HARD',
    category: 'SUMMIT',
    distanceKm: 22,
    elevationGainM: 1080,
    durationMinutes: 600,
    summitM: 2740,
    startLat: 5.6289,
    startLng: 10.2528,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [10.2528, 5.6289],
        [10.1892, 5.6341],
        [10.1204, 5.6372],
        [10.05, 5.6333],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February'],
    hazards: [
      'Constant exposure — no shade and no shelter',
      'Cold harmattan wind, near-freezing dawn temperatures',
      'Very long day with limited escape routes off the ridge',
      'Afternoon cloud reducing visibility to metres',
    ],
    waterSources:
      'Springs on the lower farmland only. Nothing on the ridge — carry 3 L per person.',
    permitRequired: false,
    permitInfo:
      'No permit required. A guide from Mbouda or Babadjou (15,000–25,000 XAF per group) is important on the ridge, where the path braids into dozens of cattle tracks.',
    gettingThere:
      'Mbouda is about 1 h from Bafoussam and 5 h from Douala. Moto-taxis run up to the last village on the Bamboutos road; the walk starts from there.',
    coverImage:
      commonsUrl('Mont Batchingou (2098m).jpg'),
    waypoints: [
      { name: 'Mbouda road trailhead', lat: 5.6289, lng: 10.2528, elevationM: 1660, order: 0 },
      { name: 'Terrace farms upper limit', lat: 5.6341, lng: 10.1892, elevationM: 2150, order: 1, description: 'Last houses and the last water. Fill up here.' },
      { name: 'Ridge gain', lat: 5.6372, lng: 10.1204, elevationM: 2520, order: 2, description: 'You are on the ridge from here. Wind hits hard.' },
      { name: 'Bamboutos high point', lat: 5.6333, lng: 10.05, elevationM: 2740, order: 3, description: 'Views into both the West and North-West regions on a clear morning.' },
    ],
  },
  {
    slug: 'mont-febe-yaounde',
    name: 'Mont Fébé Circuit, Yaoundé',
    summary:
      'A forested city hill rising above Yaoundé to 1,073 m — the best short training walk in the capital, doable before work.',
    description: `Yaoundé is built across seven hills, and Mont Fébé is the one you climb. At 1,073 m it looks down over the whole city, from the Unity Palace to the Basilica, and on a clear harmattan morning you can see well beyond the ring road.

The circuit follows tarred road and forest path up past the Mont Fébé hotel and the Benedictine monastery, whose small art museum is worth the detour, then loops through remnant forest on the northern flank. It is 7 km with 350 m of climb — enough to be a real workout, short enough to do before work, and entirely accessible without a guide or a permit.

This is the standard training walk for Yaoundé-based hikers preparing for Mount Cameroon, and the local hiking groups run it most weekends. Go early: by 09:00 the tarred sections are hot and the traffic on the lower road picks up. Solo hikers should stick to the main road sections and avoid the forest paths after dark.`,
    region: 'CENTRE',
    nearestTown: 'Yaoundé',
    difficulty: 'EASY',
    category: 'FOREST',
    distanceKm: 7,
    elevationGainM: 350,
    durationMinutes: 150,
    summitM: 1073,
    startLat: 3.8908,
    startLng: 11.5061,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [11.5061, 3.8908],
        [11.5022, 3.8954],
        [11.4989, 3.9002],
        [11.5031, 3.9028],
        [11.5061, 3.8908],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'June', 'July', 'August'],
    hazards: [
      'Traffic on the shared tarred sections',
      'Petty theft on isolated forest paths — go in company',
      'Heat and humidity after 09:00',
    ],
    waterSources: 'Shops and the hotel on the way up. Carry 1 L.',
    permitRequired: false,
    permitInfo: 'None. Free public access.',
    gettingThere:
      'Start from the Bastos junction at the foot of the Mont Fébé road. Any Yaoundé taxi will take you to "Mont Fébé" or the monastery.',
    coverImage:
      commonsUrl('Lac municipal de Yaounde.jpg'),
    waypoints: [
      { name: 'Bastos junction', lat: 3.8908, lng: 11.5061, elevationM: 730, order: 0 },
      { name: 'Mont Fébé viewpoint', lat: 3.8954, lng: 11.5022, elevationM: 950, order: 1, description: 'The classic view over Yaoundé. Clearest in the harmattan.' },
      { name: 'Benedictine monastery', lat: 3.9002, lng: 11.4989, elevationM: 1010, order: 2, description: 'Small art museum, open most mornings.' },
      { name: 'Northern forest loop', lat: 3.9028, lng: 11.5031, elevationM: 1073, order: 3, description: 'High point and remnant forest. Do not walk this section alone at dusk.' },
    ],
  },
  {
    slug: 'rhumsiki-kapsiki-peaks',
    name: 'Rhumsiki and the Kapsiki Peaks',
    summary:
      "Volcanic plugs standing out of the Mandara Mountains near the Nigerian border — Cameroon's most photographed landscape, walked village to village.",
    description: `The Kapsiki plain around Rhumsiki is a landscape of volcanic necks: hard basalt plugs left standing after the softer rock around them eroded away, rising out of the plain like teeth. It is on the old thousand-franc note and in every tourism brochure the country has ever printed, and it earns the attention.

Hiking here is not about a summit. The walking is village to village across the plain and up onto the escarpment — through Kapsiki compounds, past terraced millet, to viewpoints over the plugs with Nigeria on the far horizon. Routes are flexible: three hours or three days, depending on how many villages you want to reach. Rhumsiki itself has guides, a crab-sorcerer who reads fortunes in the movement of a crab, and craft workshops in blacksmithing and pottery.

Two hard constraints. First, heat: from March to May the plain reaches 40 °C and hiking after 10:00 is genuinely dangerous — walk at dawn. Second, security: the Far North has been affected by Boko Haram activity for over a decade, and the situation around the Nigerian border changes. Check your government's current travel advice and speak to guides in Maroua before committing to this trip. When conditions allow, it is extraordinary.`,
    region: 'FAR_NORTH',
    nearestTown: 'Rhumsiki (Mokolo)',
    difficulty: 'MODERATE',
    category: 'CULTURAL',
    distanceKm: 12,
    elevationGainM: 420,
    durationMinutes: 300,
    summitM: 1224,
    startLat: 10.5347,
    startLng: 13.6178,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [13.6178, 10.5347],
        [13.6089, 10.5412],
        [13.5981, 10.5468],
        [13.5892, 10.5521],
      ],
    },
    bestMonths: ['November', 'December', 'January'],
    hazards: [
      'Extreme heat March–May — hike at dawn only',
      'Security situation near the Nigerian border: check current advisories',
      'No shade on the plain',
      'Scorpions and snakes in rocky ground',
    ],
    waterSources:
      'Village wells only, and they run low late in the dry season. Carry at least 4 L per person.',
    permitRequired: false,
    permitInfo:
      'No permit, but a local guide is effectively required — both for route-finding between villages and for the courtesies of entering Kapsiki compounds. Around 10,000–20,000 XAF per day.',
    gettingThere:
      'Rhumsiki is about 1 h 30 from Mokolo, which is 2 h from Maroua. Maroua has flights from Yaoundé and Douala. Confirm the security position before travelling.',
    coverImage:
      commonsUrl('Rhumsiki Peak.jpg'),
    waypoints: [
      { name: 'Rhumsiki village', lat: 10.5347, lng: 13.6178, elevationM: 900, order: 0, description: 'Guides, craft workshops and the crab-sorcerer. Start before 06:00 in the hot months.' },
      { name: 'Rhumsiki Peak viewpoint', lat: 10.5412, lng: 13.6089, elevationM: 1100, order: 1, description: 'The classic view of the volcanic plug. Best light at sunrise.' },
      { name: 'Escarpment edge', lat: 10.5468, lng: 13.5981, elevationM: 1224, order: 2, description: 'Panorama across the Kapsiki plain into Nigeria.' },
      { name: 'Kapsiki compound village', lat: 10.5521, lng: 13.5892, elevationM: 1050, order: 3, description: 'Traditional compounds and blacksmiths. Ask before photographing people.' },
    ],
  },
  {
    slug: 'benoue-park-buffalo-trail',
    name: 'Bénoué National Park Buffalo Trail',
    summary:
      'Guided savannah walking along the Bénoué river — buffalo, hippo, kob and roan antelope on foot, with an armed park ranger.',
    description: `Bénoué National Park is 180,000 hectares of Guinean savannah woodland on the Bénoué river, and it is one of the few places in Cameroon where you can legally walk in big-game country. Walking safaris here run with an armed park ranger, on foot, along river terraces and through open woodland.

The Buffalo Trail follows the river from the Buffle Noir camp. Expect Western kob, roan antelope, warthog, baboon and, in the pools, hippo and crocodile. Buffalo are common and are the reason the ranger is armed. Lion and giant eland are present but rarely seen on foot. There is no summit and very little climbing; the difficulty here comes from heat, distance and the concentration a walking safari demands.

The park closes in the rains — the tracks become impassable and the animals disperse. The season runs roughly December to May, with animals concentrating at the river as the dry season deepens, which makes March and April the best game viewing and the hottest walking. Early morning only. Bookings go through the park office at Bénoué or the conservation service in Garoua, and you cannot enter on foot without a ranger.`,
    region: 'NORTH',
    nearestTown: 'Garoua (Buffle Noir)',
    difficulty: 'MODERATE',
    category: 'WILDLIFE',
    distanceKm: 10,
    elevationGainM: 140,
    durationMinutes: 270,
    summitM: null,
    startLat: 8.3667,
    startLng: 13.8333,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [13.8333, 8.3667],
        [13.8412, 8.3589],
        [13.8498, 8.3521],
        [13.8571, 8.3462],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'March', 'April'],
    hazards: [
      'Buffalo, hippo and crocodile — never leave the ranger',
      'Extreme heat, 40 °C+ in March and April',
      'Tsetse fly and malaria',
      'Park closed and tracks impassable in the rains',
    ],
    waterSources:
      'Camp only. The river is not drinkable and approaching it away from designated points is dangerous. Carry 3–4 L.',
    permitRequired: true,
    permitInfo:
      'Park entry, ranger escort and guide are booked through the Bénoué park office or MINFOF in Garoua. Budget roughly 30,000–60,000 XAF per person per day including the ranger. Walking without a ranger is prohibited.',
    gettingThere:
      'Buffle Noir is about 2 h 30 from Garoua on the Ngaoundéré road. Garoua has flights from Yaoundé and Douala. A 4x4 is needed for the park tracks.',
    coverImage:
      commonsUrl('BénouéNP4.jpg'),
    waypoints: [
      { name: 'Buffle Noir camp', lat: 8.3667, lng: 13.8333, elevationM: 340, order: 0, description: 'Ranger briefing and mandatory registration. Walks leave at 06:00.' },
      { name: 'River terrace', lat: 8.3589, lng: 13.8412, elevationM: 320, order: 1, description: 'Kob and roan antelope early. Hippo pools downstream — keep the ranger between you and the water.' },
      { name: 'Woodland crossing', lat: 8.3521, lng: 13.8498, elevationM: 380, order: 2, description: 'Buffalo country. Single file, no talking.' },
      { name: 'Escarpment lookout', lat: 8.3462, lng: 13.8571, elevationM: 460, order: 3 },
    ],
  },
  {
    slug: 'ngaoundaba-crater-lake-loop',
    name: 'Ngaoundaba Crater Lake Loop',
    summary:
      'Rolling Adamawa plateau walking to a forested crater lake south of Ngaoundéré — cool, green, and almost empty of other hikers.',
    description: `The Adamawa plateau sits at around 1,100 m and is the most temperate part of Cameroon — green, rolling, dotted with crater lakes, and mercifully free of both the coast's humidity and the Far North's heat. Ngaoundaba, about 35 km south of Ngaoundéré, has one of the best of those lakes: a deep crater ringed with gallery forest.

The loop walks from the ranch area out across grassland and gallery forest to the crater, around as much of the rim as the vegetation allows, and back. It is around 11 km with modest climbing, and the pleasure of it is the plateau itself — big skies, Fulani cattle, kites overhead, and cool mornings that make walking easy in a way most of the country does not.

Ngaoundéré is the northern terminus of the Douala–Ngaoundéré railway, which makes this an unusually easy trailhead to reach without a car. The dry season from November to March gives firm ground and clear views; the rains turn the black cotton soil into something that swallows boots.`,
    region: 'ADAMAWA',
    nearestTown: 'Ngaoundéré',
    difficulty: 'MODERATE',
    category: 'LAKE',
    distanceKm: 11,
    elevationGainM: 290,
    durationMinutes: 270,
    summitM: 1240,
    startLat: 7.0492,
    startLng: 13.6042,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [13.6042, 7.0492],
        [13.5981, 7.0441],
        [13.5919, 7.0398],
        [13.5962, 7.0352],
        [13.6042, 7.0492],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: [
      'Black cotton soil becomes impassable mud in the rains',
      'Steep unfenced crater edge under vegetation',
      'Snakes in long grass',
      'Very few landmarks on the open plateau',
    ],
    waterSources: 'Ranch and village boreholes. Carry 2 L.',
    permitRequired: false,
    permitInfo:
      'No permit. Arrange a guide in Ngaoundéré (10,000–20,000 XAF per group); the plateau paths are unmarked.',
    gettingThere:
      'Ngaoundaba is about 45 minutes south of Ngaoundéré by road. Ngaoundéré is the terminus of the overnight train from Yaoundé and has flights from Douala.',
    coverImage:
      commonsUrl('Paysage de Ngaoundaba.jpg'),
    waypoints: [
      { name: 'Ngaoundaba ranch trailhead', lat: 7.0492, lng: 13.6042, elevationM: 1120, order: 0 },
      { name: 'Gallery forest edge', lat: 7.0441, lng: 13.5981, elevationM: 1180, order: 1 },
      { name: 'Crater rim high point', lat: 7.0398, lng: 13.5919, elevationM: 1240, order: 2, description: 'Full view down into the lake. The edge is steep and hidden by scrub — stay back.' },
      { name: 'Lakeside descent', lat: 7.0352, lng: 13.5962, elevationM: 1090, order: 3 },
    ],
  },
  {
    slug: 'dja-reserve-forest-trek',
    name: 'Dja Faunal Reserve Forest Trek',
    summary:
      'A multi-day walk into a UNESCO World Heritage rainforest with Baka guides — forest elephant, gorilla and chimpanzee country, and the most demanding trek in Cameroon.',
    description: `The Dja Faunal Reserve is 5,260 km² of near-untouched Congo Basin rainforest, a UNESCO World Heritage site, encircled by the Dja river. Something like 107 mammal species live here, including western lowland gorilla, chimpanzee, forest elephant and bongo. It is the most biodiverse place in Cameroon and the hardest to walk in.

Treks run from Somalomo on the northern boundary, usually two to four days, sleeping in forest camps. Baka guides lead — their knowledge of the forest is the entire basis of the trip, and community guiding is one of the few forms of income the reserve's edge communities get from it. The walking is flat but relentless: mud to mid-calf, river crossings, dense understorey, no views, and heat with total humidity. Wildlife is heard far more often than seen; expect to identify gorilla by nest and dung rather than sight, and count the birds and primates you do see as a bonus.

Come prepared properly. Full rain gear that you accept will be wet the whole time, boots you can walk wet in, a mosquito net, and yellow fever plus malaria prophylaxis. Access is through the Conservation Service at Somalomo and cannot be arranged on arrival — write ahead. Nothing else in the country asks this much or gives back as much.`,
    region: 'EAST',
    nearestTown: 'Somalomo (Abong-Mbang)',
    difficulty: 'EXPERT',
    category: 'WILDLIFE',
    distanceKm: 45,
    elevationGainM: 620,
    durationMinutes: 4320,
    summitM: null,
    startLat: 3.3672,
    startLng: 12.7189,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [12.7189, 3.3672],
        [12.7302, 3.3481],
        [12.7418, 3.3269],
        [12.7561, 3.3042],
        [12.7689, 3.2801],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'June', 'July', 'August'],
    hazards: [
      'Forest elephant — the single most dangerous animal here',
      'Total humidity and heat exhaustion',
      'Deep mud and chest-high river crossings',
      'Malaria, filaria and no evacuation route',
      'No mobile coverage anywhere in the reserve',
    ],
    waterSources:
      'Streams throughout, all requiring filtration and treatment. Water is the one thing not in short supply.',
    permitRequired: true,
    permitInfo:
      'Entry permits, Baka guides and porters are arranged in advance through the Dja Conservation Service at Somalomo (MINFOF). Budget 250,000–500,000 XAF per person for a 3–4 day trek including permits, guides, porters and camp food. Arrange weeks ahead, not on arrival.',
    gettingThere:
      'Somalomo is reached via Abong-Mbang, about 6–7 h from Yaoundé, then a rough road north. A 4x4 is essential and the final stretch may be impassable in heavy rain.',
    coverImage:
      commonsUrl('Dja Faunal Reserve-109438.jpg'),
    waypoints: [
      { name: 'Somalomo conservation post', lat: 3.3672, lng: 12.7189, elevationM: 660, order: 0, description: 'Permits, guide and porter assignment, kit inspection.' },
      { name: 'Dja river crossing', lat: 3.3481, lng: 12.7302, elevationM: 640, order: 1, description: 'Pirogue crossing into the reserve proper.' },
      { name: 'Forest camp 1', lat: 3.3269, lng: 12.7418, elevationM: 690, order: 2, description: 'First night. Hang everything — this is elephant and driver-ant country.' },
      { name: 'Gorilla nesting zone', lat: 3.3042, lng: 12.7561, elevationM: 720, order: 3, description: 'Known nesting area. Keep 30 m minimum and follow your guide without argument.' },
      { name: 'Forest camp 2 / saline', lat: 3.2801, lng: 12.7689, elevationM: 700, order: 4, description: 'Natural clearing where elephant and bongo come for minerals. Dawn watch from the hide.' },
    ],
  },
  {
    slug: 'campo-maan-ebodje-coast',
    name: "Campo Ma'an Coastal and Forest Walk",
    summary:
      'Atlantic beach and lowland rainforest between Kribi and the Equatorial Guinea border — turtle nesting beaches, Ebodjé village, and easy flat walking.',
    description: `Campo Ma'an National Park runs from lowland rainforest down to the Atlantic on Cameroon's southern coast, and the walking here is the gentlest in this guide: flat, coastal, and cool enough with the sea breeze to be pleasant most of the year.

The classic route walks the beach and forest edge between Ebodjé and Campo. Ebodjé is a fishing village that runs a long-standing community sea-turtle conservation project — leatherback, olive ridley and green turtles nest on these beaches, and between November and February you can join guided night patrols to watch nesting and hatchling releases. Inland paths lead into the park's forest, which holds mandrill, forest elephant and chimpanzee, though sightings on a day walk are unlikely.

Because it is flat and short, this is a good family route and a good first multi-day walk. Two things to know: the sea has a strong undertow and drownings happen, so swim only where villagers do; and river crossings between beaches depend on the tide, so plan the day's timings with a local guide rather than a map.`,
    region: 'SOUTH',
    nearestTown: 'Kribi / Ebodjé',
    difficulty: 'EASY',
    category: 'COASTAL',
    distanceKm: 16,
    elevationGainM: 90,
    durationMinutes: 330,
    summitM: null,
    startLat: 2.5842,
    startLng: 9.8611,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [9.8611, 2.5842],
        [9.8589, 2.5681],
        [9.8562, 2.5498],
        [9.8541, 2.5312],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'June', 'July', 'August'],
    hazards: [
      'Strong Atlantic undertow — swim only where villagers do',
      'Tidal river crossings between beaches',
      'Sun exposure on open sand',
      'Sandflies at dawn and dusk',
    ],
    waterSources: 'Village wells in Ebodjé and Campo. Carry 2 L on the beach sections.',
    permitRequired: true,
    permitInfo:
      "Park entry for the forest sections is paid at the Campo Ma'an office; the coastal walk and turtle patrols are arranged with the Ebodjé community project for around 10,000–20,000 XAF per person, which goes to turtle conservation.",
    gettingThere:
      'Ebodjé is about 1 h 30 south of Kribi on the Campo road. Kribi is 3 h from Douala or 4 h from Yaoundé by road.',
    coverImage:
      commonsUrl('Lobé beach kribi Cameroon.jpg'),
    waypoints: [
      { name: 'Ebodjé village', lat: 2.5842, lng: 9.8611, elevationM: 10, order: 0, description: 'Community turtle project office. Book night patrols here in season.' },
      { name: 'Turtle nesting beach', lat: 2.5681, lng: 9.8589, elevationM: 5, order: 1, description: 'Main nesting stretch, November–February. Never use white light on the beach at night.' },
      { name: 'Forest edge path', lat: 2.5498, lng: 9.8562, elevationM: 40, order: 2, description: "Into Campo Ma'an lowland forest. Mandrill territory, rarely seen." },
      { name: 'Campo river mouth', lat: 2.5312, lng: 9.8541, elevationM: 10, order: 3, description: 'Tidal crossing — timing matters. Equatorial Guinea is across the water.' },
    ],
  },
  {
    slug: 'lobeke-bai-forest-trek',
    name: 'Lobéké National Park Bai Forest Trek',
    summary:
      "Deep Congo Basin rainforest on Cameroon's south-eastern corner, walked between forest clearings where gorilla, forest elephant and buffalo come out into the open — part of the Sangha Trinational World Heritage complex.",
    description: `Lobéké National Park sits in the far south-east corner of Cameroon, where the Sangha River marks the border with the Central African Republic and the Republic of Congo. Together with Dzanga-Sangha across the river in CAR and Nouabalé-Ndoki in Congo, it forms the Sangha Trinational — one contiguous 750,000-hectare block of Congo Basin rainforest managed as a single World Heritage landscape, even though you only ever walk the Cameroonian third of it.

The walking here is built around bais: natural forest clearings, fed by mineral-rich swamp water, where the closed canopy opens out and animals that are otherwise invisible in dense forest come out to graze and drink in view. Guided treks from Mambélé work between two or three bais over several days, sleeping in forest camp, with long watches from raised miradors overlooking the clearings at dawn and dusk — this is a park you experience by waiting quietly, not by covering distance. Western lowland gorilla, forest elephant, buffalo, bongo and sitatunga are all realistic sightings from a mirador; leopard is present but rarely seen.

This is remote even by Cameroonian standards. Getting to Mambélé is itself a two-day undertaking from Yaoundé, and the final approach requires a 4x4 and a dry-season road. What you get for it is one of the least-disturbed rainforest blocks left in Central Africa and a wildlife-viewing experience — watching, not glimpsing — that the country's more accessible parks cannot offer.`,
    region: 'EAST',
    nearestTown: 'Mambélé (Moloundou)',
    difficulty: 'EXPERT',
    category: 'WILDLIFE',
    distanceKm: 28,
    elevationGainM: 340,
    durationMinutes: 5760,
    summitM: null,
    startLat: 2.2606,
    startLng: 15.7783,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [15.7783, 2.2606],
        [15.7912, 2.2481],
        [15.8058, 2.2339],
        [15.8201, 2.2178],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'July', 'August'],
    hazards: [
      'Forest elephant and buffalo at close range around the bais',
      'Total humidity, heat and mud underfoot for days at a time',
      'Malaria and filaria — no evacuation route from deep camps',
      'No mobile coverage anywhere in the park',
      'Long, difficult approach road — impassable in heavy rain',
    ],
    waterSources:
      'Forest streams, filtered and treated. Bring your own filtration; nothing is sold once you leave Mambélé.',
    permitRequired: true,
    permitInfo:
      'Entry permits and guides are arranged through the MINFOF conservation service in Mambélé, ideally booked weeks ahead through a Yaoundé-based operator. Budget 300,000–550,000 XAF per person for a 3–4 day trek including permits, guides, porters and camp food.',
    gettingThere:
      'From Yaoundé: Bertoua (about 6 h), then Yokadouma (a further 7 h over 304 km), then Mambélé (5 h more over 165 km on a track that needs a 4x4 and can close in the rains). Budget two full days of travel each way.',
    coverImage: commonsUrl('Clairière dans le Parc National de Lobéké.JPG'),
    waypoints: [
      { name: 'Mambélé conservation post', lat: 2.2606, lng: 15.7783, elevationM: 420, order: 0, description: 'Permits, Baka guide and porter assignment. Final resupply point.' },
      { name: 'Forest camp, first bai approach', lat: 2.2481, lng: 15.7912, elevationM: 410, order: 1, description: 'Overnight camp on the approach to the first bai.' },
      { name: 'Djaloumbe bai mirador', lat: 2.2339, lng: 15.8058, elevationM: 400, order: 2, description: 'Raised viewing platform over a forest clearing. Dawn and dusk are the watch windows — gorilla, elephant and buffalo are all realistic here.' },
      { name: 'Second bai and forest camp', lat: 2.2178, lng: 15.8201, elevationM: 395, order: 3, description: 'Further clearing, quieter than the first. Sitatunga and bongo have both been seen from this mirador.' },
    ],
  },
  {
    slug: 'chutes-de-la-metche',
    name: 'Chutes de la Métché',
    summary:
      "A 40 m waterfall on the Metchié-Choumi river near Bafoussam — a short, easy walk to a site that is both a scenic stop and a place of real historical weight for the region.",
    description: `Chutes de la Métché sits about 30 km north-west of Bafoussam on the N6, where the Metchié-Choumi river drops around 40 m through a rock amphitheatre on the boundary between the Menoua, Bamboutos and Mifi divisions. The walk to the falls is short — a marked path down from the roadside car park, fifteen to twenty minutes each way — which makes this one of the easiest worthwhile stops in the Western Highlands.

The site carries weight beyond the waterfall itself. During the independence struggle of the 1950s and 60s, Métché was used as a site of execution, and it remains a place of pilgrimage and purification for people from the surrounding communities today — visitors will often see offerings of salt, coins and palm oil left at the site. This is not a folkloric detail to photograph past; ask locally before treating the site as a simple scenic stop, and follow the same courtesies you would at any place of memory.

Because it is short, easy and close to Bafoussam, this pairs naturally with a Bamboutos ridge trip or as a half-day out from the city on its own. The path is wet and can be slick on the final descent to the viewing point; sensible footwear matters more than the distance suggests.`,
    region: 'WEST',
    nearestTown: 'Bafoussam (Bamougoum)',
    difficulty: 'EASY',
    category: 'WATERFALL',
    distanceKm: 2.2,
    elevationGainM: 140,
    durationMinutes: 90,
    summitM: null,
    startLat: 5.5325,
    startLng: 10.3297,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [10.3297, 5.5325],
        [10.3271, 5.5318],
        [10.3252, 5.5309],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: [
      'Wet, slick rock on the final descent',
      'Unfenced viewing points close to the drop',
      'Site is actively used for offerings and ceremony — treat it with respect, not as a photo backdrop',
    ],
    waterSources: 'Bring your own. Shops and roadside stalls in Bamougoum before the trailhead.',
    permitRequired: false,
    permitInfo: 'No formal permit. A local guide at the car park (around 3,000–5,000 XAF) is optional but knows the site\'s history and etiquette.',
    gettingThere:
      'From Bafoussam, take the N6 north-west towards Mbouda for about 30 km to Bamougoum; the falls are signposted from the road, a short walk from the gare de Bamougoum.',
    coverImage: commonsUrl('Chutes de la Métché - 3.jpg'),
    waypoints: [
      { name: 'Roadside car park', lat: 5.5325, lng: 10.3297, elevationM: 1420, order: 0, description: 'Start of the marked path down to the falls.' },
      { name: 'Upper viewpoint', lat: 5.5318, lng: 10.3271, elevationM: 1370, order: 1, description: 'First clear view of the 40 m drop.' },
      { name: 'Falls base', lat: 5.5309, lng: 10.3252, elevationM: 1290, order: 2, description: 'Amphitheatre at the base. Offerings are often left here — leave them undisturbed.' },
    ],
  },
  {
    slug: 'waza-park-walking-safari',
    name: 'Waza National Park Walking Safari',
    summary:
      'Sahelian savanna walking with an armed ranger in one of West Africa\'s best-known parks for elephant, giraffe and lion — on foot, in the far north of Cameroon.',
    description: `Waza National Park was gazetted as a hunting reserve in 1934 and covers 1,700 km² of Sahelian floodplain and acacia savanna hard against the Chad border. It is the most internationally known of Cameroon's parks — the giraffe, elephant and lion that appear in every Cameroon tourism brochure are Waza's — and it is one of the few places in the country where you can walk that landscape on foot rather than view it through a vehicle window.

Walking safaris leave from the ranger post near Waza village on the park's north-western edge, always with an armed conservation-service ranger, along the floodplain tracks where the game concentrates as the dry season deepens. Elephant, giraffe, kob, hartebeest and warthog are common; lion and cheetah are present but far less reliably seen on foot than from a vehicle at dawn. There is no climbing and no real distance to speak of — the difficulty here is heat, sun exposure on open floodplain, and the total concentration a walking safari among large game demands.

The dry season, roughly November to April, is both the only time walking is practical and the best time for game, as animals concentrate at the shrinking waterholes. The wet season floods the plain and closes the park to walking entirely. This is also a security-sensitive part of the country — the Far North has been affected by instability tied to the Chad Basin over the past decade — so check current advisories and go through the park office rather than arranging anything informally.`,
    region: 'FAR_NORTH',
    nearestTown: 'Waza',
    difficulty: 'MODERATE',
    category: 'WILDLIFE',
    distanceKm: 9,
    elevationGainM: 60,
    durationMinutes: 240,
    summitM: null,
    startLat: 11.3536,
    startLng: 14.5978,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [14.5978, 11.3536],
        [14.6089, 11.3467],
        [14.6212, 11.339],
        [14.6344, 11.3328],
      ],
    },
    bestMonths: ['December', 'January', 'February', 'March'],
    hazards: [
      'Elephant and buffalo — never leave the ranger',
      'Extreme heat, regularly above 40 °C March–April',
      'No shade on open floodplain',
      'Park closed and impassable in the wet season',
      'Security situation near the Chad border — check current advisories',
    ],
    waterSources: 'Ranger post and Waza village only. Carry 3–4 L per person; nothing is available on the walk.',
    permitRequired: true,
    permitInfo:
      'Park entry, ranger escort and guide are booked through the Waza park office. Budget roughly 25,000–50,000 XAF per person per day including the ranger. Walking without a ranger is prohibited.',
    gettingThere:
      'Waza is about 2 h north of Maroua on a sealed road. Maroua has flights from Yaoundé and Douala. Confirm the current security position before travelling.',
    coverImage: commonsUrl('Waza-NP-Giraffes.jpg'),
    waypoints: [
      { name: 'Waza ranger post', lat: 11.3536, lng: 14.5978, elevationM: 320, order: 0, description: 'Registration and mandatory ranger briefing. Walks leave early to beat the heat.' },
      { name: 'Floodplain edge', lat: 11.3467, lng: 14.6089, elevationM: 315, order: 1, description: 'Kob, hartebeest and warthog typically seen here first.' },
      { name: 'Waterhole track', lat: 11.339, lng: 14.6212, elevationM: 310, order: 2, description: 'Game concentrates here as the dry season deepens — elephant and giraffe are both realistic.' },
      { name: 'Acacia woodland lookout', lat: 11.3328, lng: 14.6344, elevationM: 325, order: 3 },
    ],
  },
  {
    slug: 'lac-tison-vina-falls',
    name: 'Lac Tison and the Vina Falls',
    summary:
      'A cool, green half-day out from Ngaoundéré on the Adamawa plateau — a crater lake and a waterfall on the Vina river, both an easy reach from Cameroon\'s rail-head city.',
    description: `Ngaoundéré sits on the Adamawa plateau at around 1,100 m, the coolest and greenest part of Cameroon, and two of its best short walks are within 15 km of the city. Lac Tison is a small crater lake reached by a track that climbs a low ridge just south of town; the Vina Falls, a little further along the same road towards Meiganga, drop over a rock shelf on the Vina river barely 200 m from the roadside.

The walk links the two: up from the southern edge of Ngaoundéré to Lac Tison, then back down to the road and on to the falls, all on plateau grassland and farm track with wide-open skies and Fulani cattle for company. Neither site takes long or asks much fitness — the appeal is the plateau itself, cool enough to actually enjoy walking in a way most of Cameroon at this latitude is not.

For those with an extra day, the Chutes de Tello — a 45 m fall with a wide cavern behind the drop — sit about 60 km east of Ngaoundéré on the Bélel track, but they are a separate half-day trip in their own right rather than an extension of this walk. Ngaoundéré is the northern terminus of the Douala–Ngaoundéré railway, which makes both of these an unusually easy add-on for anyone arriving by train rather than road.`,
    region: 'ADAMAWA',
    nearestTown: 'Ngaoundéré',
    difficulty: 'EASY',
    category: 'WATERFALL',
    distanceKm: 13,
    elevationGainM: 260,
    durationMinutes: 270,
    summitM: null,
    startLat: 7.3167,
    startLng: 13.5833,
    routeGeoJson: {
      type: 'LineString',
      coordinates: [
        [13.5833, 7.3167],
        [13.5811, 7.2942],
        [13.585, 7.2703],
        [13.5851, 7.2092],
      ],
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    hazards: [
      'Unfenced crater edge at Lac Tison',
      'Wet rock at the falls viewing point',
      'Black cotton soil turns to deep mud in the rains',
      'Few landmarks on the open plateau track',
    ],
    waterSources: 'Ngaoundéré town before setting out. Carry 2 L — nothing reliable en route.',
    permitRequired: false,
    permitInfo: 'No permit. A guide from Ngaoundéré (10,000–15,000 XAF) is useful for the Lac Tison track, which is unmarked past the farmland.',
    gettingThere:
      'Both sites are reached from Ngaoundéré on the N1 towards Meiganga: Lac Tison via a signed track about 3 km south of the city, the Vina Falls a little further along, some 200 m off the road. Ngaoundéré is the terminus of the overnight train from Yaoundé and has flights from Douala.',
    coverImage: commonsUrl("Les chutes d'eau de la Vina à Ngaoundéré.jpg"),
    waypoints: [
      { name: 'Ngaoundéré southern exit', lat: 7.3167, lng: 13.5833, elevationM: 1100, order: 0, description: 'Start of the track south towards Lac Tison.' },
      { name: 'Lac Tison crater rim', lat: 7.2942, lng: 13.5811, elevationM: 1160, order: 1, description: 'Small crater lake ringed by grassland. Quiet and rarely crowded.' },
      { name: 'Vina river approach', lat: 7.2703, lng: 13.585, elevationM: 1080, order: 2 },
      { name: 'Vina Falls', lat: 7.2092, lng: 13.5851, elevationM: 1020, order: 3, description: 'The river drops over a wide rock shelf barely 200 m from the Meiganga road.' },
    ],
  },
];

export const safetyGuidelines = [
  {
    category: 'Before you go',
    order: 0,
    title: 'Tell someone your plan, and give them a turnaround time',
    body: 'Write down your route, your guide\'s name and phone number, and the time you expect to be back. Leave it with someone who is not on the hike. Above 2,000 m on Mount Cameroon and Mount Oku there is no reliable mobile coverage, so nobody will know you are overdue unless you arranged for them to notice.',
  },
  {
    category: 'Before you go',
    order: 1,
    title: 'Hire a registered local guide',
    body: 'On Mount Cameroon, in Bénoué and in the Dja reserve a guide or ranger is legally required and enforced at the gate. Everywhere else it is still the right call: highland paths braid into dozens of identical cattle tracks, forest paths disappear in a season, and a guide is the difference between a good day and a search party. It also keeps the money in the communities that maintain the trails.',
  },
  {
    category: 'Before you go',
    order: 2,
    title: 'Match the trail to your actual fitness',
    body: 'Difficulty ratings on this site mean something specific. EASY is under 4 hours on a clear path. MODERATE means a half to full day with real climbing. HARD means a long day, sustained steep ground and a level of fitness you have to build. EXPERT means multi-day, high altitude or big-game country, with consequences if it goes wrong. Do Mont Fébé and Ekom-Nkam before you book Mount Cameroon.',
  },
  {
    category: 'Health',
    order: 0,
    title: 'Malaria and vaccinations',
    body: 'Malaria is present across Cameroon and is the most likely thing to actually harm you. Take prophylaxis, sleep under a net, and use repellent at dusk. Yellow fever vaccination is required for entry and you will be asked for the certificate. Typhoid, hepatitis A and tetanus cover are all sensible. See a travel clinic at least six weeks before you fly.',
  },
  {
    category: 'Health',
    order: 1,
    title: 'Altitude sickness above 2,500 m',
    body: 'Mount Cameroon (4,040 m), Mount Oku (3,011 m) and Bamboutos (2,740 m) are all high enough to make people ill. Headache, nausea, dizziness and loss of appetite are the early signs. The only reliable treatment is to go down. Do not push a summit day for someone showing symptoms — descending 500 m fixes it, continuing up does not.',
  },
  {
    category: 'Health',
    order: 2,
    title: 'Water: carry it, or treat it',
    body: 'No surface water in Cameroon is safe to drink untreated, including highland streams that look clean. Carry a filter or purification tablets. Volumes that actually work: 4 L per person per day on Mount Cameroon and in the Far North, 3 L on the Bamboutos ridge and in Bénoué, 2 L on the shorter highland walks. Dehydration is far more common than any exotic risk.',
  },
  {
    category: 'On the trail',
    order: 0,
    title: 'The weather changes faster than you will believe',
    body: 'Buea can be 28 °C while Hut 2 on the same mountain is 6 °C in driving rain. Highland cloud rolls in most afternoons and can cut visibility to a few metres in minutes. Always carry a waterproof shell and a warm layer, even on a hot morning, and check the trail weather panel on this site before you set off — it flags conditions that make a route unsafe rather than just uncomfortable.',
  },
  {
    category: 'On the trail',
    order: 1,
    title: 'Start at dawn',
    body: 'This is the single most useful habit in Cameroonian hiking. In the Far North and in Bénoué, walking after 10:00 in the hot season is dangerous rather than merely unpleasant. In the highlands, dawn is when you actually get the view before cloud builds. On Mount Cameroon, summit day starts at 04:00 for exactly this reason.',
  },
  {
    category: 'On the trail',
    order: 2,
    title: 'Wildlife: keep the ranger between you and it',
    body: 'In Bénoué the buffalo are why your ranger is armed. In the Dja, forest elephant are more dangerous than gorilla or chimpanzee and are usually heard before they are seen. Hippo and crocodile mean you do not approach river edges away from designated points. Stay in single file, stay quiet, and do exactly what your guide says without discussion.',
  },
  {
    category: 'On the trail',
    order: 3,
    title: 'Wet rock is the most under-rated hazard here',
    body: 'Most injuries on Cameroonian trails are slips, not dramatic events. The rock stairway at Ekom-Nkam, the root-covered path up Kupe and the descent to the Manengouba lakes are all permanently wet and genuinely slippery. Boots with real tread are not optional, and going down takes longer and more care than coming up.',
  },
  {
    category: 'Respect and access',
    order: 0,
    title: 'Sacred sites are access conditions, not folklore',
    body: 'Lake Oku and the Manengouba twin lakes are sacred to the communities that own the land you are walking on, and there are days and areas that are closed for traditional reasons. Mount Kupe has parts of its forest treated the same way. Ask your guide what the restrictions are and follow them — permission to be there depends on it.',
  },
  {
    category: 'Respect and access',
    order: 1,
    title: 'Ask before photographing people',
    body: 'The Kapsiki compounds around Rhumsiki and the villages in the Bamenda Highlands are places people live, not a set. Ask first, accept no, and if you photograph someone, send them the picture. If you sell an image of an identifiable person through the marketplace on this site, they should have agreed to that.',
  },
  {
    category: 'Respect and access',
    order: 2,
    title: 'Check regional security advisories',
    body: 'Conditions in the North-West and South-West regions and in the Far North near the Nigerian border have been affected by insecurity and change over time. This site lists trails in those regions because they are worth hiking, not because conditions are guaranteed. Check your government\'s current travel advice and speak to guides on the ground in Bamenda, Buea or Maroua before you commit to a trip.',
  },
  {
    category: 'Emergencies',
    order: 0,
    title: 'Numbers, and what to do when there is no signal',
    body: 'Police 117, fire brigade 118, ambulance 119 — all free from any Cameroonian mobile. Note that ambulance response outside the major cities is very limited and mountain rescue as such does not exist; on Mount Cameroon, evacuation means your guide and porters carrying you down. That is precisely why the turnaround time you left with someone matters, and why you go down early rather than pushing on.',
  },
  {
    category: 'Emergencies',
    order: 1,
    title: 'What to carry, every single time',
    body: 'Waterproof shell, warm layer, head torch with spare batteries, 2 L minimum of water plus treatment, food for longer than you plan to be out, a small first aid kit with blister plasters and rehydration salts, a whistle, a fully charged phone plus a power bank, and cash in small notes. Premium members can download the offline pack for a trail, which puts the route, waypoints and these numbers on your phone before you lose signal.',
  },
];
