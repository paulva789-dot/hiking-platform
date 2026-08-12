/**
 * English, French, Spanish and Portuguese — the four official languages
 * actually spoken across the CEMAC countries this platform covers (Cameroon
 * is EN/FR, Equatorial Guinea is Spanish, São Tomé & Príncipe is Portuguese).
 *
 * This is a client-side string dictionary, not full Next.js locale routing
 * (no /fr/... URLs, no per-locale SEO metadata). It covers the site chrome —
 * header, footer, homepage — that every visitor sees regardless of which
 * page they land on. Deeper page content (trail descriptions, guide bios,
 * site history) stays in its source language, since that's real researched
 * or user-submitted content, not UI copy.
 */

export const LOCALES = ['en', 'fr', 'es', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇬🇶',
  pt: '🇸🇹',
};

export type TranslationKey = keyof typeof en;

const en = {
  // header / nav
  'nav.trails': 'Trails',
  'nav.map': 'Map',
  'nav.sites': 'Cameroon Sites',
  'nav.guides': 'Guides',
  'nav.gallery': 'Gallery',
  'nav.events': 'Events',
  'nav.groups': 'Groups',
  'nav.safety': 'Safety',
  'nav.signIn': 'Sign in',
  'nav.joinFree': 'Join free',
  'nav.dashboard': 'My dashboard',
  'nav.savedTrails': 'Saved trails',
  'nav.myBookings': 'My bookings',
  'nav.myPhotos': 'My photos',
  'nav.guideWorkspace': 'Guide workspace',
  'nav.adminConsole': 'Admin console',
  'nav.goPremium': 'Go Premium',
  'nav.signOut': 'Sign out',

  // homepage hero
  'hero.badge': 'All ten regions of Cameroon',
  'hero.title': 'Hiking in Cameroon, with the information you actually need',
  'hero.body':
    'Most people who want to hike here never start, because what they can find is vague, wrong or missing. This is the fix: real distances and durations, difficulty ratings that mean something specific, live weather that tells you when not to go, permit rules, and registered local guides you can book directly.',
  'hero.stat.destinations': 'Destinations, all checked',
  'hero.stat.regions': 'Regions covered',
  'hero.stat.summit': 'Highest summit — Fako',
  'hero.stat.currency': 'Prices in local currency',

  // what is hiking
  'whatIsHiking.eyebrow': 'New to this?',
  'whatIsHiking.title': 'What hiking actually is, and what it takes',
  'whatIsHiking.body':
    "Hiking is walking a route on foot, usually outside a city, for long enough that it takes real planning rather than a stroll — anywhere from two hours to several days. You don't need to be an athlete. You do need the right expectations going in.",
  'whatIsHiking.route.title': 'A route, on foot, outdoors',
  'whatIsHiking.route.body':
    'Forest trails, volcanic slopes, savanna tracks or a coastal path — measured in distance and elevation gain, not just time. Easy routes run under 4 hours; summit attempts can run several days.',
  'whatIsHiking.fitness.title': 'Ordinary fitness, honestly rated',
  'whatIsHiking.fitness.body':
    'No special athleticism for an Easy or Moderate trail — a fit non-runner manages fine. Hard and Expert routes need real preparation: build up to them rather than starting there.',
  'whatIsHiking.gear.title': 'The right gear, not lots of it',
  'whatIsHiking.gear.body':
    'Boots, water, a rain layer and a charged phone cover most day hikes. Multi-day and summit trips add a sleeping bag, warm layers and food — the full checklist is on the safety page.',
  'whatIsHiking.guide.title': 'Usually with someone who knows the ground',
  'whatIsHiking.guide.body':
    'Registered local guides handle route-finding, weather calls and permits — required outright on some trails, strongly advised on the rest. Booking one is built into every trail page.',

  // trip picker
  'picker.eyebrow': 'Plan your visit — Cameroon only',
  'picker.title': 'Pick a region, then a place',
  'picker.body':
    "Choose one of Cameroon's ten regions, then a landmark inside it — trip planning stays limited to destinations within the country.",
  'picker.chooseRegion': 'Choose a region',
  'picker.selectRegionFirst': 'Select a region first',
  'picker.viewPlace': 'View place',

  // footer
  'footer.tagline':
    'Honest, checked information about hiking in Cameroon — real distances, real times, real hazards, and the local guides who know the ground. From Mont Mbankolo before work to four days in the Dja — and guided tours booked across the wider CEMAC region.',
  'footer.emergency': 'Emergency numbers in Cameroon — Police 117 · Fire 118 · Ambulance 119',
  'footer.explore': 'Explore',
  'footer.plan': 'Plan',
  'footer.community': 'Community',
  'footer.rights': 'Trail data is community-checked, not a guarantee of safety.',
  'footer.mapCredit': 'Maps © OpenStreetMap contributors · Weather by OpenWeather',

  // common
  'common.readMore': 'Read more',
  'common.viewTrail': 'View trail',
  'common.bookNow': 'Book now',
  'common.loading': 'Loading…',

  // page headers
  'page.trails.title': 'Hiking destinations',
  'page.trails.subtitle':
    "Seventeen destinations, at least one in each of Cameroon's ten regions. Every distance, ascent and duration below is for the standard route and a moderately fit hiker.",
  'page.sites.title': 'Cameroon sites & history',
  'page.map.subtitle':
    'Toggle Streets / Satellite in the top-right of the map, or use "Zoom to my location" to fly the satellite view in on wherever you are right now.',
  'page.map.title': 'Trail map',
  'page.guides.title': 'Registered guides',
  'page.safety.title': 'Safety guidelines for hiking in Cameroon',
};

const fr: Record<TranslationKey, string> = {
  'nav.trails': 'Sentiers',
  'nav.map': 'Carte',
  'nav.sites': 'Sites du Cameroun',
  'nav.guides': 'Guides',
  'nav.gallery': 'Galerie',
  'nav.events': 'Événements',
  'nav.groups': 'Groupes',
  'nav.safety': 'Sécurité',
  'nav.signIn': 'Se connecter',
  'nav.joinFree': "S'inscrire gratuitement",
  'nav.dashboard': 'Mon tableau de bord',
  'nav.savedTrails': 'Sentiers enregistrés',
  'nav.myBookings': 'Mes réservations',
  'nav.myPhotos': 'Mes photos',
  'nav.guideWorkspace': 'Espace guide',
  'nav.adminConsole': 'Console admin',
  'nav.goPremium': 'Passer Premium',
  'nav.signOut': 'Se déconnecter',

  'hero.badge': 'Les dix régions du Cameroun',
  'hero.title': "La randonnée au Cameroun, avec l'information dont vous avez vraiment besoin",
  'hero.body':
    "La plupart des gens qui veulent randonner ici ne commencent jamais, car ce qu'ils trouvent est vague, faux ou incomplet. Voici la solution : distances et durées réelles, niveaux de difficulté précis, météo en direct qui vous dit quand ne pas partir, règles de permis, et guides locaux enregistrés réservables directement.",
  'hero.stat.destinations': 'Destinations, toutes vérifiées',
  'hero.stat.regions': 'Régions couvertes',
  'hero.stat.summit': 'Sommet le plus haut — Fako',
  'hero.stat.currency': 'Prix en monnaie locale',

  'whatIsHiking.eyebrow': 'Nouveau ici ?',
  'whatIsHiking.title': "Ce qu'est vraiment la randonnée, et ce qu'elle demande",
  'whatIsHiking.body':
    "La randonnée, c'est parcourir un itinéraire à pied, généralement hors de la ville, assez longtemps pour que cela demande une vraie préparation — de deux heures à plusieurs jours. Pas besoin d'être un athlète. Il faut juste partir avec les bonnes attentes.",
  'whatIsHiking.route.title': 'Un itinéraire, à pied, en plein air',
  'whatIsHiking.route.body':
    'Sentiers forestiers, pentes volcaniques, pistes de savane ou chemin côtier — mesurés en distance et en dénivelé, pas seulement en temps. Les parcours faciles durent moins de 4 heures ; les tentatives de sommet peuvent durer plusieurs jours.',
  'whatIsHiking.fitness.title': 'Une condition physique ordinaire, honnêtement évaluée',
  'whatIsHiking.fitness.body':
    "Pas besoin d'être sportif pour un sentier Facile ou Modéré. Les parcours Difficile et Expert demandent une vraie préparation : progressez plutôt que de commencer par eux.",
  'whatIsHiking.gear.title': "Le bon équipement, pas beaucoup",
  'whatIsHiking.gear.body':
    'Bottes, eau, une couche imperméable et un téléphone chargé suffisent pour la plupart des randonnées d\'une journée. Les sorties de plusieurs jours ajoutent un sac de couchage, des couches chaudes et de la nourriture — la liste complète est sur la page sécurité.',
  'whatIsHiking.guide.title': 'Généralement avec quelqu\'un qui connaît le terrain',
  'whatIsHiking.guide.body':
    "Les guides locaux enregistrés s'occupent de l'itinéraire, de la météo et des permis — obligatoires sur certains sentiers, fortement conseillés sur les autres. La réservation est intégrée à chaque page de sentier.",

  'picker.eyebrow': 'Planifiez votre visite — Cameroun uniquement',
  'picker.title': "Choisissez une région, puis un lieu",
  'picker.body':
    "Choisissez l'une des dix régions du Cameroun, puis un site à l'intérieur — la planification reste limitée aux destinations du pays.",
  'picker.chooseRegion': 'Choisir une région',
  'picker.selectRegionFirst': "Sélectionnez d'abord une région",
  'picker.viewPlace': 'Voir le lieu',

  'footer.tagline':
    'Des informations honnêtes et vérifiées sur la randonnée au Cameroun — vraies distances, vrais temps, vrais dangers, et les guides locaux qui connaissent le terrain. Du Mont Mbankolo avant le travail à quatre jours dans la Dja — et des circuits guidés réservables dans toute la zone CEMAC.',
  'footer.emergency': 'Numéros d\'urgence au Cameroun — Police 117 · Pompiers 118 · Ambulance 119',
  'footer.explore': 'Explorer',
  'footer.plan': 'Planifier',
  'footer.community': 'Communauté',
  'footer.rights': "Les données des sentiers sont vérifiées par la communauté, sans garantie de sécurité.",
  'footer.mapCredit': 'Cartes © contributeurs OpenStreetMap · Météo par OpenWeather',

  'common.readMore': 'Lire plus',
  'common.viewTrail': 'Voir le sentier',
  'common.bookNow': 'Réserver',
  'common.loading': 'Chargement…',

  'page.trails.title': 'Destinations de randonnée',
  'page.trails.subtitle':
    "Dix-sept destinations, au moins une dans chacune des dix régions du Cameroun. Chaque distance, dénivelé et durée ci-dessous correspond à l'itinéraire standard pour un randonneur en forme moyenne.",
  'page.sites.title': 'Sites et histoire du Cameroun',
  'page.map.subtitle':
    'Basculez Rues / Satellite en haut à droite de la carte, ou utilisez « Zoomer sur ma position » pour centrer la vue satellite là où vous êtes.',
  'page.map.title': 'Carte des sentiers',
  'page.guides.title': 'Guides enregistrés',
  'page.safety.title': 'Consignes de sécurité pour la randonnée au Cameroun',
};

const es: Record<TranslationKey, string> = {
  'nav.trails': 'Senderos',
  'nav.map': 'Mapa',
  'nav.sites': 'Sitios de Camerún',
  'nav.guides': 'Guías',
  'nav.gallery': 'Galería',
  'nav.events': 'Eventos',
  'nav.groups': 'Grupos',
  'nav.safety': 'Seguridad',
  'nav.signIn': 'Iniciar sesión',
  'nav.joinFree': 'Únete gratis',
  'nav.dashboard': 'Mi panel',
  'nav.savedTrails': 'Senderos guardados',
  'nav.myBookings': 'Mis reservas',
  'nav.myPhotos': 'Mis fotos',
  'nav.guideWorkspace': 'Panel de guía',
  'nav.adminConsole': 'Consola de administración',
  'nav.goPremium': 'Hazte Premium',
  'nav.signOut': 'Cerrar sesión',

  'hero.badge': 'Las diez regiones de Camerún',
  'hero.title': 'Senderismo en Camerún, con la información que realmente necesitas',
  'hero.body':
    'La mayoría de quienes quieren hacer senderismo aquí nunca empiezan, porque lo que encuentran es vago, erróneo o incompleto. Esta es la solución: distancias y duraciones reales, niveles de dificultad claros, clima en vivo que te dice cuándo no salir, normas de permisos y guías locales registrados que puedes reservar directamente.',
  'hero.stat.destinations': 'Destinos, todos verificados',
  'hero.stat.regions': 'Regiones cubiertas',
  'hero.stat.summit': 'Cumbre más alta — Fako',
  'hero.stat.currency': 'Precios en moneda local',

  'whatIsHiking.eyebrow': '¿Nuevo en esto?',
  'whatIsHiking.title': 'Qué es realmente el senderismo y qué requiere',
  'whatIsHiking.body':
    'Hacer senderismo es caminar una ruta a pie, normalmente fuera de la ciudad, durante el tiempo suficiente para requerir planificación real — de dos horas a varios días. No necesitas ser atleta. Sí necesitas las expectativas correctas desde el inicio.',
  'whatIsHiking.route.title': 'Una ruta, a pie, al aire libre',
  'whatIsHiking.route.body':
    'Senderos boscosos, laderas volcánicas, pistas de sabana o un camino costero — medidos en distancia y desnivel, no solo en tiempo. Las rutas fáciles duran menos de 4 horas; los intentos de cumbre pueden durar varios días.',
  'whatIsHiking.fitness.title': 'Condición física normal, evaluada con honestidad',
  'whatIsHiking.fitness.body':
    'No se necesita ser atleta para un sendero Fácil o Moderado. Las rutas Difíciles y Expertas requieren preparación real: progresa hacia ellas en vez de empezar ahí.',
  'whatIsHiking.gear.title': 'El equipo adecuado, no mucho',
  'whatIsHiking.gear.body':
    'Botas, agua, una capa impermeable y un teléfono cargado cubren la mayoría de las caminatas de un día. Las salidas de varios días añaden saco de dormir, capas de abrigo y comida — la lista completa está en la página de seguridad.',
  'whatIsHiking.guide.title': 'Normalmente con alguien que conoce el terreno',
  'whatIsHiking.guide.body':
    'Los guías locales registrados se encargan de la orientación, las decisiones climáticas y los permisos — obligatorios en algunos senderos, muy recomendados en el resto. Reservar uno está integrado en cada página de sendero.',

  'picker.eyebrow': 'Planifica tu visita — solo Camerún',
  'picker.title': 'Elige una región y luego un lugar',
  'picker.body':
    'Elige una de las diez regiones de Camerún y luego un sitio dentro de ella — la planificación se limita a destinos dentro del país.',
  'picker.chooseRegion': 'Elegir una región',
  'picker.selectRegionFirst': 'Selecciona primero una región',
  'picker.viewPlace': 'Ver lugar',

  'footer.tagline':
    'Información honesta y verificada sobre el senderismo en Camerún — distancias reales, tiempos reales, peligros reales, y los guías locales que conocen el terreno. Desde el Mont Mbankolo antes del trabajo hasta cuatro días en la Dja — y tours guiados reservables en toda la región CEMAC.',
  'footer.emergency': 'Números de emergencia en Camerún — Policía 117 · Bomberos 118 · Ambulancia 119',
  'footer.explore': 'Explorar',
  'footer.plan': 'Planificar',
  'footer.community': 'Comunidad',
  'footer.rights': 'Los datos de los senderos están verificados por la comunidad, no son garantía de seguridad.',
  'footer.mapCredit': 'Mapas © colaboradores de OpenStreetMap · Clima por OpenWeather',

  'common.readMore': 'Leer más',
  'common.viewTrail': 'Ver sendero',
  'common.bookNow': 'Reservar ahora',
  'common.loading': 'Cargando…',

  'page.trails.title': 'Destinos de senderismo',
  'page.trails.subtitle':
    'Diecisiete destinos, al menos uno en cada una de las diez regiones de Camerún. Cada distancia, desnivel y duración a continuación corresponde a la ruta estándar para un senderista de forma física media.',
  'page.sites.title': 'Sitios e historia de Camerún',
  'page.map.subtitle':
    'Alterna Calles / Satélite en la esquina superior derecha del mapa, o usa "Ir a mi ubicación" para centrar la vista satelital donde te encuentras.',
  'page.map.title': 'Mapa de senderos',
  'page.guides.title': 'Guías registrados',
  'page.safety.title': 'Guía de seguridad para el senderismo en Camerún',
};

const pt: Record<TranslationKey, string> = {
  'nav.trails': 'Trilhas',
  'nav.map': 'Mapa',
  'nav.sites': 'Locais dos Camarões',
  'nav.guides': 'Guias',
  'nav.gallery': 'Galeria',
  'nav.events': 'Eventos',
  'nav.groups': 'Grupos',
  'nav.safety': 'Segurança',
  'nav.signIn': 'Entrar',
  'nav.joinFree': 'Inscreva-se grátis',
  'nav.dashboard': 'Meu painel',
  'nav.savedTrails': 'Trilhas salvas',
  'nav.myBookings': 'Minhas reservas',
  'nav.myPhotos': 'Minhas fotos',
  'nav.guideWorkspace': 'Painel do guia',
  'nav.adminConsole': 'Console de administração',
  'nav.goPremium': 'Assinar Premium',
  'nav.signOut': 'Sair',

  'hero.badge': 'As dez regiões dos Camarões',
  'hero.title': 'Caminhadas nos Camarões, com a informação que você realmente precisa',
  'hero.body':
    'A maioria das pessoas que querem caminhar aqui nunca começa, porque o que encontram é vago, errado ou incompleto. Esta é a solução: distâncias e durações reais, níveis de dificuldade claros, clima ao vivo que diz quando não ir, regras de licenças, e guias locais registrados que você pode reservar diretamente.',
  'hero.stat.destinations': 'Destinos, todos verificados',
  'hero.stat.regions': 'Regiões cobertas',
  'hero.stat.summit': 'Pico mais alto — Fako',
  'hero.stat.currency': 'Preços em moeda local',

  'whatIsHiking.eyebrow': 'Novo nisso?',
  'whatIsHiking.title': 'O que é realmente uma caminhada, e o que ela exige',
  'whatIsHiking.body':
    'Caminhada é percorrer uma rota a pé, geralmente fora da cidade, por tempo suficiente para exigir planejamento real — de duas horas a vários dias. Você não precisa ser atleta. Precisa sim das expectativas certas desde o início.',
  'whatIsHiking.route.title': 'Uma rota, a pé, ao ar livre',
  'whatIsHiking.route.body':
    'Trilhas florestais, encostas vulcânicas, savanas ou caminhos costeiros — medidos em distância e ganho de altitude, não só em tempo. Rotas fáceis levam menos de 4 horas; tentativas de cume podem levar vários dias.',
  'whatIsHiking.fitness.title': 'Condicionamento físico comum, avaliado com honestidade',
  'whatIsHiking.fitness.body':
    'Nenhum atletismo especial para uma trilha Fácil ou Moderada. Rotas Difíceis e Especialistas exigem preparação real: evolua até elas em vez de começar por ali.',
  'whatIsHiking.gear.title': 'O equipamento certo, não muito',
  'whatIsHiking.gear.body':
    'Botas, água, uma camada impermeável e um telefone carregado cobrem a maioria das caminhadas de um dia. Viagens de vários dias somam saco de dormir, camadas quentes e comida — a lista completa está na página de segurança.',
  'whatIsHiking.guide.title': 'Geralmente com alguém que conhece o terreno',
  'whatIsHiking.guide.body':
    'Guias locais registrados cuidam da orientação, decisões climáticas e licenças — obrigatórios em algumas trilhas, fortemente recomendados nas demais. A reserva já está integrada em cada página de trilha.',

  'picker.eyebrow': 'Planeje sua visita — apenas Camarões',
  'picker.title': 'Escolha uma região e depois um lugar',
  'picker.body':
    'Escolha uma das dez regiões dos Camarões e depois um marco dentro dela — o planejamento fica limitado a destinos dentro do país.',
  'picker.chooseRegion': 'Escolher uma região',
  'picker.selectRegionFirst': 'Selecione uma região primeiro',
  'picker.viewPlace': 'Ver local',

  'footer.tagline':
    'Informação honesta e verificada sobre caminhadas nos Camarões — distâncias reais, tempos reais, perigos reais, e os guias locais que conhecem o terreno. Do Monte Mbankolo antes do trabalho a quatro dias na Dja — e passeios guiados reserváveis em toda a região CEMAC.',
  'footer.emergency': 'Números de emergência nos Camarões — Polícia 117 · Bombeiros 118 · Ambulância 119',
  'footer.explore': 'Explorar',
  'footer.plan': 'Planejar',
  'footer.community': 'Comunidade',
  'footer.rights': 'Os dados das trilhas são verificados pela comunidade, sem garantia de segurança.',
  'footer.mapCredit': 'Mapas © colaboradores do OpenStreetMap · Clima por OpenWeather',

  'common.readMore': 'Leia mais',
  'common.viewTrail': 'Ver trilha',
  'common.bookNow': 'Reservar agora',
  'common.loading': 'Carregando…',

  'page.trails.title': 'Destinos de caminhada',
  'page.trails.subtitle':
    'Dezessete destinos, pelo menos um em cada uma das dez regiões dos Camarões. Cada distância, ganho de altitude e duração abaixo corresponde à rota padrão para um caminhante com condicionamento médio.',
  'page.sites.title': 'Locais e história dos Camarões',
  'page.map.subtitle':
    'Alterne Ruas / Satélite no canto superior direito do mapa, ou use "Ir para minha localização" para centralizar a vista de satélite onde você está.',
  'page.map.title': 'Mapa de trilhas',
  'page.guides.title': 'Guias registrados',
  'page.safety.title': 'Diretrizes de segurança para caminhadas nos Camarões',
};

export const TRANSLATIONS: Record<Locale, Record<TranslationKey, string>> = { en, fr, es, pt };
