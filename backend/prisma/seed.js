import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { config } from '../src/config.js';
import { safetyGuidelines, trails } from './trails.data.js';
import { trailTranslations } from './trail-translations.data.js';

const prisma = new PrismaClient();

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(6, 0, 0, 0);
  return d;
};

const ref = (prefix) => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

async function main() {
  console.log('Seeding Travesía Cameroon…\n');

  // ---------------------------------------------------------------- users
  const hash = (pw) => bcrypt.hash(pw, config.bcryptRounds);
  const demoPassword = await hash('Hike@12345');

  const admin = await prisma.user.upsert({
    where: { email: config.seed.adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: config.seed.adminEmail,
      name: 'Platform Administrator',
      passwordHash: await hash(config.seed.adminPassword),
      role: 'ADMIN',
      region: 'CENTRE',
    },
  });
  console.log(`  admin      ${admin.email}`);

  const hiker = await prisma.user.upsert({
    where: { email: 'hiker@example.cm' },
    update: {},
    create: {
      email: 'hiker@example.cm',
      name: 'Awa Ndifor',
      passwordHash: demoPassword,
      role: 'USER',
      region: 'LITTORAL',
      bio: 'Weekend hiker based in Douala. Working up to Mount Cameroon.',
      phone: '+237 6 55 00 11 22',
    },
  });

  const premiumHiker = await prisma.user.upsert({
    where: { email: 'premium@example.cm' },
    update: {},
    create: {
      email: 'premium@example.cm',
      name: 'Thomas Mbarga',
      passwordHash: demoPassword,
      role: 'USER',
      tier: 'PREMIUM',
      tierExpires: daysFromNow(300),
      region: 'CENTRE',
      bio: 'Trail runner and photographer. Yaoundé.',
    },
  });

  const guideSeeds = [
    {
      email: 'guide.buea@example.cm',
      name: 'Emmanuel Etonde',
      headline: 'Mount CEO registered guide — 14 years on Mount Cameroon',
      bio: 'I have guided the Guinness Route since 2011 and hold Mount Cameroon Ecotourism Organisation registration. I run two-day summit climbs and three-day crossings over the 1999 lava flows, with porters from Buea. I brief every group properly on altitude before we leave the office, and I will turn a party around if someone is unwell — the mountain is not going anywhere.',
      yearsExperience: 14,
      languages: ['English', 'French', 'Bakweri', 'Pidgin'],
      certifications: ['Mount CEO registered guide', 'Wilderness First Aid (2024)'],
      regions: ['SOUTH_WEST', 'LITTORAL'],
      dayRateXAF: 35000,
      status: 'APPROVED',
      plan: 'PRO',
      ratingAvg: 4.9,
      ratingCount: 63,
      phone: '+237 6 77 00 22 33',
      whatsapp: '+237 6 77 00 22 33',
    },
    {
      email: 'guide.bamenda@example.cm',
      name: 'Blaise Fondzenyuy',
      headline: 'Bamenda Highlands and Kilum-Ijim birding specialist',
      bio: "I work with the Kilum-Ijim community forest project and guide on Mount Oku, Lake Awing and across the Bamenda Highlands. My speciality is birding — Bannerman's Turaco, Banded Wattle-eye and the other Cameroon endemics — but I also run straightforward summit days on Oku for people who just want the walk. I know which days Lake Oku is accessible and I will tell you before you travel.",
      yearsExperience: 11,
      languages: ['English', 'French', 'Lamnso', 'Pidgin'],
      certifications: ['Kilum-Ijim community guide', 'Ornithology field certificate'],
      regions: ['NORTH_WEST', 'WEST'],
      dayRateXAF: 28000,
      status: 'APPROVED',
      plan: 'BASIC',
      ratingAvg: 4.8,
      ratingCount: 37,
      phone: '+237 6 70 44 55 66',
    },
    {
      email: 'guide.maroua@example.cm',
      name: 'Aïssatou Bakari',
      headline: 'Mandara Mountains and Kapsiki plain — village-to-village treks',
      bio: 'Based in Maroua, guiding on the Kapsiki plain around Rhumsiki and across the Mandara Mountains for nine years. I walk village to village, arrange the courtesies for entering Kapsiki compounds, and organise blacksmith and pottery visits. I only run trips when the security position on the border allows it, and I will say so plainly if it does not.',
      yearsExperience: 9,
      languages: ['French', 'Fulfulde', 'English', 'Kapsiki'],
      certifications: ['MINTOUL regional guide licence'],
      regions: ['FAR_NORTH', 'NORTH'],
      dayRateXAF: 25000,
      status: 'APPROVED',
      plan: 'BASIC',
      ratingAvg: 4.7,
      ratingCount: 24,
      phone: '+237 6 99 11 22 33',
    },
    {
      email: 'guide.pending@example.cm',
      name: 'Serge Ateba',
      headline: 'Dja reserve forest treks with Baka guides from Somalomo',
      bio: 'I organise three and four day treks into the Dja Faunal Reserve working with Baka guides from the villages on the northern boundary. Permits through the Somalomo conservation service, porters and camp food included. I am applying for verification on this platform now that I have my MINFOF paperwork renewed for 2026.',
      yearsExperience: 6,
      languages: ['French', 'English', 'Baka'],
      certifications: ['MINFOF ecotourism operator (pending renewal)'],
      regions: ['EAST', 'SOUTH'],
      dayRateXAF: 45000,
      status: 'PENDING',
      plan: 'NONE',
      phone: '+237 6 94 77 88 99',
    },
  ];

  const guides = [];
  for (const g of guideSeeds) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        name: g.name,
        passwordHash: demoPassword,
        role: 'GUIDE',
        phone: g.phone,
        region: g.regions[0],
      },
    });

    const profile = await prisma.guideProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        headline: g.headline,
        bio: g.bio,
        yearsExperience: g.yearsExperience,
        languages: g.languages,
        certifications: g.certifications,
        regions: g.regions,
        dayRateXAF: g.dayRateXAF,
        status: g.status,
        plan: g.plan,
        planExpires: g.plan === 'NONE' ? null : daysFromNow(180),
        ratingAvg: g.ratingAvg ?? 0,
        ratingCount: g.ratingCount ?? 0,
        phone: g.phone,
        whatsapp: g.whatsapp,
        reviewedAt: g.status === 'PENDING' ? null : new Date(),
      },
    });
    guides.push({ user, profile });
    console.log(`  guide      ${user.name} (${g.status})`);
  }

  // ---------------------------------------------------------------- trails
  const trailBySlug = {};
  for (const { waypoints, ...trail } of trails) {
    const record = await prisma.trail.upsert({
      where: { slug: trail.slug },
      update: trail,
      create: trail,
    });

    await prisma.waypoint.deleteMany({ where: { trailId: record.id } });
    await prisma.waypoint.createMany({
      data: waypoints.map((w) => ({ ...w, trailId: record.id })),
    });

    trailBySlug[trail.slug] = record;
  }
  console.log(`\n  trails     ${trails.length} destinations across all 10 regions`);

  // ---------------------------------------------------------------- trail translations
  for (const { slug, locale, ...fields } of trailTranslations) {
    const trail = trailBySlug[slug];
    if (!trail) continue;
    await prisma.trailTranslation.upsert({
      where: { trailId_locale: { trailId: trail.id, locale } },
      update: fields,
      create: { trailId: trail.id, locale, ...fields },
    });
  }
  console.log(`  translate  ${trailTranslations.length} trails in FR`);

  // ---------------------------------------------------------------- safety CMS
  const existingSafety = await prisma.safetyGuideline.count();
  if (existingSafety === 0) {
    await prisma.safetyGuideline.createMany({ data: safetyGuidelines });
  }
  console.log(`  safety     ${safetyGuidelines.length} guidelines`);

  // ---------------------------------------------------------------- reviews
  const reviewSeeds = [
    {
      userId: hiker.id,
      slug: 'ekom-nkam-falls-trail',
      rating: 5,
      title: 'Do this one first',
      body: 'Went on a Saturday from Douala and was back the same evening. The descent to the base is much steeper and wetter than I expected from the photos — I would not attempt it in trainers. The guide at the gate was 5,000 XAF for our group of four and pointed out the forest loop above the falls which nobody else was on. Standing at the bottom with 80 metres of water coming down in front of you is worth the wet feet.',
      hikedOn: daysFromNow(-46),
    },
    {
      userId: premiumHiker.id,
      slug: 'mount-cameroon-guinness-route',
      rating: 5,
      title: 'Two hard days, and the altitude is real',
      body: 'Climbed with a Mount CEO guide in January. Hut 1 to Hut 2 is where it stops being a walk. Two of our group of six had headaches at Hut 2 and one turned back at the Magic Tree the next morning, which was the right call. It was 6 °C and raining at Hut 2 while Buea was in the high twenties — take the warm layer seriously, and take a sleeping bag that actually works. Summit at 07:20 with a clear view out to Bioko before the cloud came up.',
      hikedOn: daysFromNow(-120),
    },
    {
      userId: premiumHiker.id,
      slug: 'mont-febe-yaounde',
      rating: 4,
      title: 'The best training loop in Yaoundé',
      body: 'I run this two or three mornings a week. 350 m of climb is enough to build the legs for something bigger, and the view over the city in harmattan season is genuinely good. Marked down only because the lower tarred section has real traffic and you are sharing it with cars. Go before 07:00 and it is quiet.',
      hikedOn: daysFromNow(-9),
    },
    {
      userId: hiker.id,
      slug: 'manengouba-twin-lakes',
      rating: 5,
      title: 'Gentle high country, and almost nobody there',
      body: 'This was my first walk above 2,000 m and it was the right choice — the gradient is kind, the crater is enormous, and you can see for ever. We hired a guide in Bangem for 15,000 for the group which was money well spent because the grass tracks all look identical once the cloud came in around 14:00. Cold wind on the rim the whole time. The descent to the female lake is loose and steep; take your time.',
      hikedOn: daysFromNow(-73),
    },
  ];

  for (const r of reviewSeeds) {
    const trail = trailBySlug[r.slug];
    if (!trail) continue;
    await prisma.review.upsert({
      where: { userId_trailId: { userId: r.userId, trailId: trail.id } },
      update: {},
      create: {
        userId: r.userId,
        trailId: trail.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        hikedOn: r.hikedOn,
        status: 'APPROVED',
      },
    });
  }

  // Recompute cached ratings from what we just inserted.
  for (const trail of Object.values(trailBySlug)) {
    const agg = await prisma.review.aggregate({
      where: { trailId: trail.id, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.trail.update({
      where: { id: trail.id },
      data: {
        ratingAvg: Number((agg._avg.rating ?? 0).toFixed(2)),
        ratingCount: agg._count,
        // A little variety so "popular" sorting is not arbitrary in the demo.
        viewCount: Math.floor(Math.random() * 900) + 60,
      },
    });
  }
  console.log(`  reviews    ${reviewSeeds.length}`);

  // ---------------------------------------------------------------- gallery
  // Real phone photos, not stock — hosted from /public/gallery rather than
  // Cloudinary, since these are curated seed content, not a user upload.
  const photoSeeds = [
    {
      publicId: 'seed/hotel-seme-beach-coconut',
      url: '/gallery/hotel-seme-beach-coconut.jpg',
      width: 1242,
      height: 2208,
      caption:
        'Fresh coconut at Hotel Seme Beach Resort & Spa, Mile 11 Route D, Idenau — the coastal stretch below Mount Cameroon’s western slopes, a common stop before or after a Buea climb.',
    },
    {
      publicId: 'seed/idenau-coast-wading',
      url: '/gallery/idenau-coast-wading.jpg',
      width: 1242,
      height: 2208,
      caption: 'Wading in on the Idenau coast, South-West Region.',
    },
  ];

  for (const p of photoSeeds) {
    const existing = await prisma.photo.findFirst({ where: { publicId: p.publicId } });
    if (!existing) {
      await prisma.photo.create({
        data: {
          userId: premiumHiker.id,
          url: p.url,
          publicId: p.publicId,
          width: p.width,
          height: p.height,
          caption: p.caption,
          status: 'APPROVED',
        },
      });
    }
  }
  console.log(`  photos     ${photoSeeds.length}`);

  // ---------------------------------------------------------------- favorites
  for (const slug of ['mount-cameroon-guinness-route', 'manengouba-twin-lakes', 'mount-oku-kilum-ijim']) {
    const trail = trailBySlug[slug];
    await prisma.favorite.upsert({
      where: { userId_trailId: { userId: hiker.id, trailId: trail.id } },
      update: {},
      create: { userId: hiker.id, trailId: trail.id },
    });
  }

  // ---------------------------------------------------------------- tours
  const tourSeeds = [
    {
      guideEmail: 'guide.buea@example.cm',
      trailSlug: 'mount-cameroon-guinness-route',
      title: 'Mount Cameroon Summit — 2 days, Guinness Route',
      description:
        'The classic two-day ascent of Fako summit from Buea. Day one climbs to Hut 2 at 2,850 m through rainforest and montane grassland; day two is a 04:00 start for the summit cone and descent back to Buea. Includes Mount CEO park fees, one porter per two climbers, hut fees, and a full altitude and kit briefing the afternoon before. Group size capped at 8 so nobody gets left behind on summit day.',
      priceXAF: 165000,
      maxGroupSize: 8,
      durationDays: 2,
      includes: [
        'Mount CEO park entry and hut fees',
        'Registered guide',
        'One porter per two climbers',
        'Pre-climb kit and altitude briefing',
        'Hot meals on the mountain',
        'Drinking water resupply at Hut 1',
      ],
      excludes: ['Transport to Buea', 'Accommodation in Buea', 'Sleeping bag hire', 'Personal insurance'],
      meetingPoint: 'Mount CEO office, Buea Town — 16:00 the day before for the briefing',
      schedules: [
        { start: 14, days: 2, capacity: 8 },
        { start: 28, days: 2, capacity: 8 },
        { start: 45, days: 2, capacity: 6 },
      ],
    },
    {
      guideEmail: 'guide.buea@example.cm',
      trailSlug: 'mount-kupe-nyasoso',
      title: 'Mount Kupe Birding Day from Nyasoso',
      description:
        "A dawn start on Max's Trail with a birding focus: Mount Kupe Bushshrike, Grey-necked Picathartes at the known nesting rock, and Green-breasted Bushshrike in the mid-forest. Steep going — 1,200 m of climb in 5 km — but we move slowly and stop often, which suits birding and suits your legs. Includes the Nyasoso village guide fee and a packed lunch.",
      priceXAF: 55000,
      maxGroupSize: 6,
      durationDays: 1,
      includes: ['Village guide association fee', 'Birding guide', 'Packed lunch', 'Shared spotting scope'],
      excludes: ['Transport to Nyasoso', 'Binoculars', 'Accommodation'],
      meetingPoint: 'Nyasoso mission, 05:30',
      schedules: [
        { start: 10, days: 1, capacity: 6 },
        { start: 24, days: 1, capacity: 6 },
      ],
    },
    {
      guideEmail: 'guide.bamenda@example.cm',
      trailSlug: 'mount-oku-kilum-ijim',
      title: 'Mount Oku Summit and Kilum-Ijim Forest — 2 days',
      description:
        "Day one walks into the Kilum-Ijim community forest for the endemics — Bannerman's Turaco and Banded Wattle-eye are both realistic — with a night in Elak-Oku. Day two is the summit push to 3,011 m and, if access is open on the day, a walk to Lake Oku. Includes community forest fees, which go directly into the conservation project. I confirm Lake Oku access before you travel, not after.",
      priceXAF: 98000,
      maxGroupSize: 8,
      durationDays: 2,
      includes: [
        'Kilum-Ijim community forest fees',
        'Guide and local birding guide',
        'One night guesthouse in Elak-Oku',
        'Two lunches',
        "Courtesy visit to the Fon's palace",
      ],
      excludes: ['Transport to Elak-Oku', 'Dinner', 'Binoculars'],
      meetingPoint: "Fon's palace, Elak-Oku, 07:00",
      schedules: [
        { start: 18, days: 2, capacity: 8 },
        { start: 40, days: 2, capacity: 8 },
      ],
    },
    {
      guideEmail: 'guide.bamenda@example.cm',
      trailSlug: 'mount-bamboutos-ridge',
      title: 'Bamboutos Ridge Traverse — full day',
      description:
        'The long ridge day above Mbouda: 22 km, 1,080 m of climb, and the widest views in the country. We leave at first light because the cloud takes the views by early afternoon. Flexible turnaround — if the group wants to stop at the high point and come back the same way, that works. Windproof layer is mandatory, not advisory.',
      priceXAF: 42000,
      maxGroupSize: 10,
      durationDays: 1,
      includes: ['Guide', 'Packed lunch and 3 L water per person', 'Moto transfer to the trailhead'],
      excludes: ['Transport to Mbouda', 'Accommodation'],
      meetingPoint: 'Mbouda motor park, 05:30',
      schedules: [
        { start: 12, days: 1, capacity: 10 },
        { start: 33, days: 1, capacity: 10 },
      ],
    },
    {
      guideEmail: 'guide.maroua@example.cm',
      trailSlug: 'rhumsiki-kapsiki-peaks',
      title: 'Rhumsiki and the Kapsiki Plain — 3 days village to village',
      description:
        'Three days walking the Kapsiki plain between villages, sleeping in community guesthouses. Dawn starts every day because of the heat. Includes the Rhumsiki Peak viewpoint at sunrise, blacksmith and pottery workshops, the crab-sorcerer if you want him, and the escarpment panorama into Nigeria. I run this only when the security position allows and will refund in full if I judge that it does not.',
      priceXAF: 145000,
      maxGroupSize: 8,
      durationDays: 3,
      includes: [
        'Guide and village courtesies',
        'Two nights community guesthouse',
        'All meals',
        'Craft workshop visits',
        'Moto transfers between villages where needed',
      ],
      excludes: ['Transport to Mokolo', 'Personal insurance', 'Drinks'],
      meetingPoint: 'Rhumsiki village centre, 05:30',
      schedules: [
        { start: 21, days: 3, capacity: 8 },
        { start: 52, days: 3, capacity: 8 },
      ],
    },
  ];

  const tours = [];
  for (const t of tourSeeds) {
    const guide = guides.find((g) => g.user.email === t.guideEmail);
    const trail = trailBySlug[t.trailSlug];
    if (!guide || !trail) continue;

    // Idempotent on (guide, title) — seed can be re-run without duplicating.
    const existing = await prisma.tour.findFirst({
      where: { guideId: guide.profile.id, title: t.title },
    });

    const tour =
      existing ??
      (await prisma.tour.create({
        data: {
          guideId: guide.profile.id,
          trailId: trail.id,
          title: t.title,
          description: t.description,
          priceXAF: t.priceXAF,
          maxGroupSize: t.maxGroupSize,
          durationDays: t.durationDays,
          includes: t.includes,
          excludes: t.excludes,
          meetingPoint: t.meetingPoint,
        },
      }));

    if (!existing) {
      for (const s of t.schedules) {
        await prisma.tourSchedule.create({
          data: {
            tourId: tour.id,
            startDate: daysFromNow(s.start),
            endDate: daysFromNow(s.start + s.days - 1),
            capacity: s.capacity,
          },
        });
      }
    }
    tours.push(tour);
  }
  console.log(`  tours      ${tours.length} with upcoming departure dates`);

  // ---------------------------------------------------------------- a booking
  const firstTour = tours[0];
  if (firstTour) {
    const schedule = await prisma.tourSchedule.findFirst({
      where: { tourId: firstTour.id },
      orderBy: { startDate: 'asc' },
    });
    const alreadyBooked = await prisma.booking.findFirst({
      where: { userId: hiker.id, tourId: firstTour.id },
    });

    if (schedule && !alreadyBooked) {
      const subtotal = firstTour.priceXAF * 2;
      const commission = Math.round((subtotal * config.commission.booking) / 100);
      await prisma.booking.create({
        data: {
          reference: ref('TRK'),
          userId: hiker.id,
          tourId: firstTour.id,
          scheduleId: schedule.id,
          participants: 2,
          subtotalXAF: subtotal,
          commissionXAF: commission,
          totalXAF: subtotal,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          contactPhone: '+237 6 55 00 11 22',
          notes: 'First time above 2,000 m — happy to go slow on summit day.',
        },
      });
      await prisma.tourSchedule.update({
        where: { id: schedule.id },
        data: { seatsBooked: { increment: 2 } },
      });
      console.log('  booking    1 confirmed demo booking');
    }
  }

  // ---------------------------------------------------------------- groups
  const groupSeeds = [
    {
      slug: 'douala-weekend-hikers',
      name: 'Douala Weekend Hikers',
      description:
        'We leave Douala early most Saturdays for something within three hours of the city — Ekom-Nkam, Manengouba, the Kupe forest. Mixed ability, nobody gets dropped, and we always take a local guide. Post in the group by Wednesday if you want a seat in a car.',
      region: 'LITTORAL',
      ownerId: hiker.id,
    },
    {
      slug: 'yaounde-trail-runners',
      name: 'Yaoundé Trail Runners',
      description:
        'Mont Fébé loops on Tuesday and Thursday mornings at 05:45, longer runs on the Nkolbisson hills at the weekend. We also use Fébé as the training base for anyone building towards Mount Cameroon or the Race of Hope.',
      region: 'CENTRE',
      ownerId: premiumHiker.id,
    },
    {
      slug: 'cameroon-summit-club',
      name: 'Cameroon Summit Club',
      description:
        'For people working through the high peaks: Fako, Oku, Bamboutos, Manengouba. We plan trips together, share guide contacts and kit, and pool transport costs. Read the safety pages before you post a trip here.',
      region: null,
      ownerId: premiumHiker.id,
    },
  ];

  for (const g of groupSeeds) {
    const existing = await prisma.hikingGroup.findUnique({ where: { slug: g.slug } });
    if (existing) continue;

    await prisma.hikingGroup.create({
      data: {
        ...g,
        members: {
          create: [
            { userId: g.ownerId, role: 'OWNER' },
            ...(g.ownerId === hiker.id ? [{ userId: premiumHiker.id }] : [{ userId: hiker.id }]),
          ],
        },
      },
    });
  }
  console.log(`  groups     ${groupSeeds.length}`);

  // ---------------------------------------------------------------- monetization content
  const listingSeeds = [
    {
      kind: 'ACCOMMODATION',
      accommodationType: 'GUESTHOUSE',
      name: 'Presbyterian Guest House, Buea',
      description:
        'The standard pre-climb base in Buea Town, ten minutes from the Mount CEO office. Simple, clean, hot water, and used to hikers checking out at 05:00. Sleeping bags can be hired next door.',
      region: 'SOUTH_WEST',
      town: 'Buea',
      priceFromXAF: 15000,
      affiliateUrl: 'https://example.com/partners/buea-guest-house',
      partnerName: 'Buea Hospitality Partners',
      commissionPct: 12,
      featured: true,
    },
    {
      kind: 'ACCOMMODATION',
      accommodationType: 'HOTEL',
      name: 'Hotel Seme Beach Resort & Spa, Idenau',
      description:
        'Beachfront resort on the coast road below Mount Cameroon\'s western slopes, about 45 minutes from Limbe. A comfortable coastal base before or after a Buea climb, or its own trip — the coconuts are straight off the property.',
      region: 'SOUTH_WEST',
      town: 'Idenau',
      priceFromXAF: 35000,
      affiliateUrl: 'https://example.com/partners/hotel-seme-beach',
      partnerName: 'Seme Beach Resort & Spa',
      commissionPct: 10,
    },
    {
      kind: 'ACCOMMODATION',
      accommodationType: 'LODGE',
      name: 'Ngaoundaba Ranch, Adamawa',
      description:
        'Lodge and campsite on the plateau 45 minutes south of Ngaoundéré, right at the crater lake trailhead. Cool nights, horses, and the only comfortable base for the Adamawa walks.',
      region: 'ADAMAWA',
      town: 'Ngaoundaba',
      priceFromXAF: 28000,
      affiliateUrl: 'https://example.com/partners/ngaoundaba-ranch',
      partnerName: 'Adamawa Lodges',
      commissionPct: 10,
    },
    {
      kind: 'ACCOMMODATION',
      accommodationType: 'HOMESTAY',
      name: 'Ebodjé Community Homestays',
      description:
        'Village homestays on the Campo Ma\'an coast, run by the same community that operates the turtle conservation project. Booking here funds the night patrols directly.',
      region: 'SOUTH',
      town: 'Ebodjé',
      priceFromXAF: 12000,
      affiliateUrl: 'https://example.com/partners/ebodje-homestays',
      partnerName: 'Ebodjé Turtle Project',
      commissionPct: 8,
      featured: true,
    },
    {
      kind: 'ACCOMMODATION',
      accommodationType: 'CAMPSITE',
      name: 'Buffle Noir Camp, Bénoué',
      description:
        'The park\'s own tented camp on the river, and the mandatory check-in point for the Buffalo Trail walking safari — rangers, guides and the only accommodation actually inside the park brief and lead from here.',
      region: 'NORTH',
      town: 'Garoua',
      priceFromXAF: 20000,
      affiliateUrl: 'https://example.com/partners/buffle-noir-camp',
      partnerName: 'Bénoué National Park',
      commissionPct: 5,
    },
    {
      kind: 'EQUIPMENT',
      name: '45 L Trekking Backpack',
      description:
        'The right size for a two-day Mount Cameroon climb with a porter carrying the rest. Rain cover included — you will need it.',
      priceFromXAF: 42000,
      affiliateUrl: 'https://example.com/gear/backpack-45l',
      partnerName: 'Outdoor Cameroon',
      commissionPct: 15,
      featured: true,
    },
    {
      kind: 'EQUIPMENT',
      name: 'Waterproof Mid-Cut Hiking Boots',
      description:
        'Aggressive tread and a waterproof membrane. The single most important thing you will buy — wet rock on Kupe and at Ekom-Nkam is what actually injures people.',
      priceFromXAF: 68000,
      affiliateUrl: 'https://example.com/gear/hiking-boots',
      partnerName: 'Outdoor Cameroon',
      commissionPct: 15,
    },
    {
      kind: 'EQUIPMENT',
      name: 'Water Filter Bottle, 1 L',
      description:
        'Filters to 0.1 micron. Highland streams look clean and are not. Cheaper over one trip than buying bottled water at the trailhead.',
      priceFromXAF: 24000,
      affiliateUrl: 'https://example.com/gear/filter-bottle',
      partnerName: 'Trek Supply CM',
      commissionPct: 18,
    },
    {
      kind: 'EQUIPMENT',
      name: 'Comfort-Rated 0 °C Sleeping Bag',
      description:
        'Hut 2 on Mount Cameroon gets to around 5 °C with wind. A summer bag will not do, and this is the most common kit mistake we see.',
      priceFromXAF: 55000,
      affiliateUrl: 'https://example.com/gear/sleeping-bag',
      partnerName: 'Outdoor Cameroon',
      commissionPct: 15,
    },
    {
      kind: 'EQUIPMENT',
      name: 'Trekking Poles, Pair',
      description:
        'Saves your knees on the Ekom-Nkam stairway and the loose descent to the Manengouba lakes. Collapsible, so they fit a daypack.',
      priceFromXAF: 21000,
      affiliateUrl: 'https://example.com/gear/trekking-poles',
      partnerName: 'Trek Supply CM',
      commissionPct: 18,
    },
  ];

  for (const l of listingSeeds) {
    const existing = await prisma.listing.findFirst({ where: { name: l.name } });
    if (!existing) await prisma.listing.create({ data: l });
  }
  console.log(`  listings   ${listingSeeds.length} partner / gear listings`);

  const eventSeeds = [
    {
      slug: 'manengouba-camping-weekend',
      title: 'Manengouba Crater Camping Weekend',
      description:
        'Two nights camping on the Manengouba rim with a guided walk to both lakes, a night-sky session at 2,400 m, and Saturday dinner cooked at camp. Transport from Douala included. Bring a bag rated to 5 °C — the wind on the rim does not stop.',
      region: 'LITTORAL',
      location: 'Manengouba crater rim, via Bangem',
      startDate: daysFromNow(35),
      endDate: daysFromNow(37),
      priceXAF: 75000,
      capacity: 30,
      ticketsSold: 11,
    },
    {
      slug: 'buea-summit-training-day',
      title: 'Mount Cameroon Summit Training Day',
      description:
        'A one-day Hut 1 and back session in Buea for anyone booked on a summit climb: pace, altitude briefing, kit check on your actual gear, and an honest assessment of whether you are ready. Run by Mount CEO registered guides.',
      region: 'SOUTH_WEST',
      location: 'Mount CEO office, Buea Town',
      startDate: daysFromNow(20),
      endDate: daysFromNow(20),
      priceXAF: 18000,
      capacity: 40,
      ticketsSold: 27,
    },
    {
      slug: 'kribi-coastal-nature-festival',
      title: 'Kribi Coastal Nature Festival',
      description:
        'Three days on the southern coast: guided walks on the Campo Ma\'an forest edge, turtle nesting night patrols with the Ebodjé project, landscape photography workshops, and a market of Cameroonian outdoor makers.',
      region: 'SOUTH',
      location: 'Kribi and Ebodjé',
      startDate: daysFromNow(64),
      endDate: daysFromNow(66),
      priceXAF: 45000,
      capacity: 200,
      ticketsSold: 58,
    },
  ];

  for (const e of eventSeeds) {
    await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: e });
  }
  console.log(`  events     ${eventSeeds.length} with ticket sales`);

  const adSeeds = [
    {
      placement: 'home-hero',
      advertiser: 'Outdoor Cameroon',
      imageUrl: 'https://placehold.co/1200x180/0f3d2e/ffffff?text=Outdoor+Cameroon+-+Boots+%26+Packs',
      targetUrl: 'https://example.com/ads/outdoor-cameroon',
      weight: 3,
    },
    {
      placement: 'home-hero',
      advertiser: 'Cameroon Tourism Board',
      imageUrl: 'https://placehold.co/1200x180/1d4ed8/ffffff?text=Visit+Cameroon+-+All+of+Africa+in+One+Country',
      targetUrl: 'https://example.com/ads/tourism-board',
      weight: 2,
    },
    {
      placement: 'trail-sidebar',
      advertiser: 'Sanlam Travel Insurance',
      imageUrl: 'https://placehold.co/400x400/7c2d12/ffffff?text=Trek+Insurance+-+Cover+to+4%2C100+m',
      targetUrl: 'https://example.com/ads/trek-insurance',
      weight: 1,
    },
  ];

  for (const a of adSeeds) {
    const existing = await prisma.adSlot.findFirst({
      where: { placement: a.placement, advertiser: a.advertiser },
    });
    if (!existing) await prisma.adSlot.create({ data: a });
  }
  console.log(`  ads        ${adSeeds.length} slots`);

  console.log('\nDone.\n');
  console.log('  Sign in with:');
  console.log(`    admin    ${config.seed.adminEmail} / ${config.seed.adminPassword}`);
  console.log('    hiker    hiker@example.cm / Hike@12345');
  console.log('    premium  premium@example.cm / Hike@12345');
  console.log('    guide    guide.buea@example.cm / Hike@12345\n');
}

main()
  .catch((e) => {
    console.error('\nSeed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
