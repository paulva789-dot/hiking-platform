/**
 * French translations of trail content, keyed by trail slug. Each field
 * mirrors a Trail field and falls back to English independently when absent
 * — see TrailTranslation in schema.prisma. Spanish and Portuguese are a
 * follow-up pass on the same infrastructure once this is validated.
 */

export const trailTranslations = [
  {
    slug: 'mount-cameroon-guinness-route',
    locale: 'FR',
    summary:
      "Le plus haut sommet d'Afrique de l'Ouest et volcan actif : 4 040 m de forêt tropicale, de prairie montagnarde et de lave noire, gravis depuis Buea en deux jours exigeants.",
    description: `Le mont Cameroun — Mongo ma Ndemi, « Montagne de la Grandeur » — s'élève directement depuis l'Atlantique jusqu'à 4 040 m, ce qui en fait le point culminant d'Afrique de l'Ouest et d'Afrique centrale, et l'un des rares endroits au monde où l'on peut prendre son petit-déjeuner en forêt tropicale humide et se retrouver, à la tombée de la nuit, sur des cendres volcaniques à nu.

L'ascension classique emprunte la Guinness Route, qui débute au bureau du Mount Cameroon Ecotourism Organisation (Mount CEO) à Buea. Le sentier grimpe à travers des terres cultivées jusqu'à la Hutte 1 (1 850 m), sort peu après de la limite forestière, puis atteint la Hutte 2 (2 850 m) où la quasi-totalité des groupes passe la nuit. Le jour du sommet commence à 4 h 00 pour les 1 200 derniers mètres sur scories meubles jusqu'au sommet du Fako, avant de redescendre par le même chemin ou de continuer par les coulées de lave de 1999 et 2000 en direction de Mann's Spring.

C'est une véritable montagne, pas une simple promenade. On la gravit toute l'année, mais le sommet reste souvent noyé dans les nuages pendant la saison des pluies, et la température peut descendre sous 5 °C avec vent et pluie, alors qu'à Buea, trois heures plus bas, il fait 28 °C. Le mal aigu des montagnes est fréquent au-dessus de la Hutte 2. Un guide agréé et au moins un porteur sont obligatoires — cette règle est appliquée à l'entrée du parc, et c'est aussi ce qui maintient l'économie de la montagne entre des mains locales.

La Mount Cameroon Race of Hope, organisée chaque année en février, voit des coureurs relier Buea au sommet et revenir en moins de cinq heures. Ce n'est une référence pour personne d'autre.`,
    hazards: [
      'Mal aigu des montagnes au-dessus de 2 800 m',
      "Volcan actif — vérifiez les alertes d'éruption",
      'Scories et cendres meubles sur le cône sommital',
      'Chute rapide des températures et nuages formant un white-out',
      'Pas de couverture mobile fiable au-dessus de la Hutte 2',
    ],
    waterSources:
      "De l'eau traitée est vendue à Buea et au bureau du Mount CEO. Il existe une source près de la Hutte 1 et une autre, peu fiable, à la Hutte 2 — prévoyez 4 L par personne et par jour, et ne comptez pas sur des points de ravitaillement au-dessus de la limite forestière.",
    permitInfo:
      "L'entrée du parc et un guide agréé se réservent auprès du Mount Cameroon Ecotourism Organisation (Mount CEO) à Buea. Comptez environ 45 000 à 70 000 XAF par personne pour une ascension de deux jours, guide, porteur et frais de huttes inclus. Inscrivez-vous au bureau l'après-midi précédant le départ.",
    gettingThere:
      "Buea est à environ 1 h 15 de route de Douala via Mutengene. Des taxis collectifs partent de Douala Bonabéri et de Limbé. Le point de départ se trouve au bureau du Mount CEO, dans Buea Town, à distance de marche de la gare routière de Buea.",
  },
  {
    slug: 'mount-kupe-nyasoso',
    locale: 'FR',
    summary:
      'Un sommet forestier abrupt de 2 064 m dominant Nyasoso, réputé chez les ornithologues pour le gladiateur du mont Kupé et chargé de légendes locales.',
    description: `Le mont Kupé se dresse, isolé, au-dessus du village de Nyasoso : un dôme granitique enveloppé de l'une des forêts submontagnardes les mieux préservées d'Afrique centrale. Des ornithologues viennent du monde entier pour observer le gladiateur du mont Kupé, le picatharte à cou gris et le gladiateur à poitrine verte ; la plupart des autres visiteurs viennent pour l'ascension elle-même, courte en distance mais d'une pente brutale.

L'itinéraire du Max's Trail part de Nyasoso et grimpe d'environ 1 200 m sur près de 5 km. Les lacets dignes de ce nom sont quasi inexistants : le sentier monte tout droit, sur des racines et des rochers humides, sous un couvert forestier ininterrompu. Six à huit heures aller-retour est la norme. Le sommet n'offre que des vues limitées à cause de la canopée, si bien que la récompense ici, c'est la forêt et la faune, plus qu'un panorama.

Le Kupé porte un poids culturel considérable pour les populations locales : la tradition bakossi en fait un lieu associé aux esprits ancestraux et, historiquement, à des récits de personnes emmenées travailler sur des plantations invisibles à flanc de montagne. Les guides de Nyasoso vous indiqueront quelles parties de la forêt sont considérées comme sacrées. Respectez-le : c'est une condition d'accès, pas un détail folklorique.`,
    hazards: [
      'Sentier extrêmement raide, envahi de racines',
      'Rochers en permanence humides — très glissants',
      'Sangsues et fourmis piqueuses pendant la saison des pluies',
      'Facile de perdre le sentier dans la forêt dense sans guide',
    ],
    waterSources:
      'Les cours d\'eau de la forêt basse sont fiables mais doivent être traités. Rien de fiable dans les 400 derniers mètres de l\'ascension.',
    permitInfo:
      "Les guides s'organisent via l'association des guides du village de Nyasoso ou le bureau de conservation Kupé-Muanenguba. Comptez environ 15 000 à 25 000 XAF par groupe et par jour. Les guides spécialisés en ornithologie coûtent plus cher, mais cela en vaut la peine.",
    gettingThere:
      'Nyasoso se rejoint depuis Kumba via Tombel, ou depuis Bafoussam via Bangem — environ 3 h depuis Kumba sur une route difficile. Les véhicules sont moins fréquents pendant la saison des pluies.',
  },
  {
    slug: 'manengouba-twin-lakes',
    locale: 'FR',
    summary:
      "Une caldeira herbeuse culminant à 2 411 m au-dessus de Bangem, abritant le lac mâle et le lac femelle — un ciel immense, des troupeaux peuls et la randonnée d'altitude la plus douce du Cameroun.",
    description: `Le massif du Manengouba forme une caldeira vaste et douce sur la ligne volcanique du Cameroun, et constitue la meilleure introduction à la randonnée d'altitude dans le pays. Là où le mont Cameroun punit et le Kupé étouffe, le Manengouba s'ouvre : de vastes hauts plateaux d'herbe rase, des pistes à bétail, et un fond de cratère abritant deux lacs que la tradition bakossi et mbo nomme le lac de l'Homme et le lac de la Femme.

La plupart des marcheurs partent de Bangem ou du côté de Melong, atteignent le bord du cratère, descendent jusqu'aux lacs et reviennent le jour même. Le circuit du rebord ajoute quelques heures et vaut le détour pour ses vues : par un matin clair, on distingue le mont Cameroun au sud-ouest et la crête des Bamboutos au nord-est.

À 2 400 m, il fait vraiment froid la nuit et le vent ne cesse presque jamais. Les lacs sont considérés comme spirituellement importants, et la baignade y est soumise à des restrictions locales — demandez à votre guide plutôt que de présumer. C'est aussi un pâturage en activité : attendez-vous à partager le sentier avec des éleveurs mbororo et leur bétail ; cédez le passage aux animaux.`,
    hazards: [
      'Vent froid et exposition sur le rebord — aucun abri',
      'Nuages épais l\'après-midi qui masquent le sentier',
      'Bétail et chiens de troupeau au fond du cratère',
      'Descente raide et meuble vers les lacs',
    ],
    waterSources: 'Cours d\'eau sur l\'approche. Ne buvez pas l\'eau des lacs. Prévoyez 2 à 3 L.',
    permitInfo:
      'Aucun permis formel, mais un guide local de Bangem est vivement recommandé (10 000 à 20 000 XAF par groupe) — les sentiers de prairie se ressemblent tous dans le brouillard.',
    gettingThere:
      'Melong se trouve sur l\'axe Douala–Bafoussam, à environ 3 h de Douala. Depuis Melong, comptez 1 à 2 h de moto ou de 4x4 pour rejoindre la route du rebord. Bangem est accessible depuis Nyasoso ou Bafoussam.',
  },
  {
    slug: 'ekom-nkam-falls-trail',
    locale: 'FR',
    summary:
      'Une descente courte, humide et spectaculaire en forêt tropicale jusqu\'à une chute de 80 m sur la rivière Nkam — la randonnée la plus accessible du Cameroun pour un résultat aussi impressionnant.',
    description: `Ekom-Nkam est la chute d'eau à laquelle pense la plupart des Camerounais quand on évoque une cascade : la rivière Nkam plonge d'environ 80 m en un seul rideau dans un amphithéâtre forestier près de Nkongsamba. Elle a servi de décor de jungle pour le film Greystoke en 1984, et l'aire d'observation a à peine changé depuis.

La randonnée elle-même est modeste — moins de 3 km aller-retour — mais la descente jusqu'au pied de la chute est raide, en permanence humide et glissante à cause des embruns, sur des marches taillées dans la roche et consolidées par des racines. La descente prend 30 à 45 minutes ; la remontée prend plus longtemps qu'on ne l'imagine. Courte et accessible en une journée depuis Douala, c'est la randonnée par laquelle commencer si vous n'avez jamais marché au Cameroun.

Le débit est énorme entre juillet et octobre, période où les embruns vous trempent depuis le point de vue et où le sentier inférieur peut être fermé. De décembre à mars, la chute est plus faible mais l'accès à sa base est sûr, avec un bassin baignable en aval. Les guides locaux présents à l'entrée vous conduisent jusqu'à la base et, sur demande, sur la boucle forestière plus longue au-dessus des chutes.`,
    hazards: [
      "Marches de pierre humides bordées d'un à-pic important",
      'Les embruns rendent le sentier inférieur glissant toute l\'année',
      'Accès inférieur souvent fermé de juillet à octobre en cas de fort débit',
      'Fort courant de fond dans le bassin sous la chute',
    ],
    waterSources: "Apportez votre propre eau. L'eau de la rivière n'est pas potable sans traitement.",
    permitInfo:
      "Un petit droit d'entrée sur le site (environ 2 000 à 5 000 XAF pour les non-résidents) est perçu à l'entrée, où des guides sont également disponibles pour environ 5 000 XAF par groupe.",
    gettingThere:
      'Nkongsamba est à environ 2 h 30 de Douala sur la route de Bafoussam. Les chutes se trouvent environ 20 km plus loin en direction de Melong, puis sur une piste signalée — n\'importe quel moto-taxi de Nkongsamba connaît Ekom.',
  },
  {
    slug: 'mount-oku-kilum-ijim',
    locale: 'FR',
    summary:
      'Le deuxième plus haut sommet du Cameroun, à 3 011 m, ceint par la plus grande forêt montagnarde encore intacte d\'Afrique de l\'Ouest et par un lac de cratère sacré pour le peuple Oku.',
    description: `Le mont Oku est le point culminant des hautes terres de Bamenda, à 3 011 m — juste derrière le mont Cameroun —, et la forêt de Kilum-Ijim, sur ses flancs, est le plus grand vestige de forêt afromontagnarde d'Afrique de l'Ouest. C'est le seul endroit au monde où observer le touraco de Bannerman et le gobemouche à barbillons ; le programme de gestion forestière communautaire qui la protège est l'une des véritables réussites camerounaises en matière de conservation.

L'ascension part d'Elak-Oku et traverse d'abord des terres cultivées, puis la ceinture forestière avec ses arbres couverts de mousse et ses oiseaux endémiques, avant de déboucher sur une prairie ouverte pour la crête finale menant au sommet. Comptez sept à neuf heures aller-retour. C'est moins raide que le Kupé et moins éprouvant que le mont Cameroun, mais l'altitude est bien réelle et le temps, sur les hauts plateaux, change sans prévenir.

Le lac Oku occupe un cratère sur le versant sud de la montagne, entouré de forêt, et abrite le xénope du lac Oku, une espèce que l'on ne trouve nulle part ailleurs. Il est sacré pour le peuple Oku : baignade et pêche y sont interdites, et certains jours l'accès est restreint pour des raisons traditionnelles. Votre guide le saura. Le palais du Fon à Elak mérite une visite avant ou après l'ascension.`,
    hazards: [
      'Altitude au-dessus de 2 500 m',
      "Pluie froide et grêle sur les hauts plateaux, à tout moment de l'année",
      'Forêt dense avec des sentiers secondaires trompeurs',
      "Journées d'accès restreint autour du lac Oku",
    ],
    waterSources:
      'Cours d\'eau forestiers pendant l\'ascension, à traiter avant de boire. Ne prélevez pas d\'eau dans le lac Oku.',
    permitInfo:
      'Organisez un guide via le projet forestier communautaire de Kilum-Ijim ou le conseil Oku à Elak. Comptez environ 15 000 à 25 000 XAF par groupe. Renseignez-vous spécifiquement sur l\'accès au lac Oku le jour de votre visite.',
    gettingThere:
      'Elak-Oku est à environ 1 h 30 de Kumbo, elle-même à 3 h de Bamenda. Vérifiez les recommandations de sécurité en vigueur pour la région du Nord-Ouest avant de voyager.',
  },
  {
    slug: 'lake-awing-crater-walk',
    locale: 'FR',
    summary:
      'Une boucle d\'une demi-journée sur les hauts plateaux, autour d\'un lac de cratère volcanique paisible entre Bamenda et Santa, à travers des pâturages peuls et des eucalyptus.',
    description: `Le lac Awing est un lac de cratère des hautes terres de Bamenda, situé à environ 1 750 m dans les collines entre Bamenda et Santa. Il reçoit une fraction seulement des visiteurs de l'Oku ou du Manengouba, ce qui fait précisément son charme : une marche paisible, vallonnée, largement dégagée, avec un lac en son centre.

La boucle depuis le village d'Awing suit des pistes agricoles et des chemins de pâturage autour du cratère, avec deux ou trois courtes montées jusqu'au rebord pour profiter de la vue. Elle se boucle sans difficulté en quatre heures à un rythme tranquille, ce qui en fait une véritable option pour un randonneur débutant ou une famille. Le village est de langue ngemba, et le lac occupe une place dans la tradition locale ; comme pour l'Oku, demandez l'autorisation avant d'entrer dans l'eau.

Les meilleures heures sont matinales : les hauts plateaux se couvrent de nuages en milieu d'après-midi et la lumière sur l'eau devient terne. Prévoyez une couche coupe-vent même en saison sèche.`,
    hazards: ['Nuages l\'après-midi et vent froid', 'Bords de cratère escarpés et non clôturés', 'Pistes agricoles boueuses après la pluie'],
    waterSources: 'Forages du village à Awing. Prévoyez 1,5 à 2 L.',
    permitInfo:
      'Aucun permis. Un guide du village coûte environ 10 000 XAF par groupe et facilite le passage à travers les terres cultivées.',
    gettingThere:
      'Awing est à environ 45 minutes de Bamenda via Santa, en taxi collectif ou en moto. Vérifiez les recommandations de sécurité en vigueur pour la région du Nord-Ouest.',
  },
  {
    slug: 'mount-bamboutos-ridge',
    locale: 'FR',
    summary:
      'Une randonnée de crête à 2 740 m sur le toit des hautes terres de l\'Ouest, au-dessus de Mbouda — longue, dégagée, froide, et offrant les plus belles vues d\'altitude du Cameroun.',
    description: `Le massif des Bamboutos est le troisième point culminant du Cameroun, à 2 740 m, et forme la ligne de partage des eaux entre les régions de l'Ouest et du Nord-Ouest. La traversée de sa crête est ce qui se rapproche le plus, au Cameroun, de la randonnée de crête classique en haute altitude : prairies ouvertes, horizons vastes, et presque aucune ombre pendant des heures d'affilée.

Les itinéraires partent du côté de Mbouda ou de Babadjou, grimpant régulièrement à travers des terrasses agricoles jusqu'à la crête, qu'ils suivent ensuite. Une traversée complète représente une longue journée — huit à dix heures —, mais on peut faire demi-tour depuis le point culminant à tout moment, ce qui rend la sortie flexible pour des groupes de niveaux variés. Les pentes supérieures sont fortement pâturées et, de plus en plus, fortement cultivées ; l'érosion est visible, et c'est un enjeu de conservation bien réel localement.

Prévoyez une véritable couche coupe-vent. À 2 700 m, pendant l'harmattan, le vent est constant et cinglant, et il n'y a nulle part où s'abriter. Partez au lever du jour, car les nuages s'accumulent sur la crête la plupart des après-midi et emportent les vues avec eux.`,
    hazards: [
      'Exposition constante — ni ombre ni abri',
      "Vent froid de l'harmattan, températures proches de zéro à l'aube",
      'Journée très longue avec peu d\'échappatoires depuis la crête',
      "Nuages l'après-midi réduisant la visibilité à quelques mètres",
    ],
    waterSources: 'Sources uniquement sur les terres cultivées en contrebas. Rien sur la crête — prévoyez 3 L par personne.',
    permitInfo:
      'Aucun permis requis. Un guide de Mbouda ou de Babadjou (15 000 à 25 000 XAF par groupe) est important sur la crête, où le sentier se divise en dizaines de pistes à bétail.',
    gettingThere:
      'Mbouda est à environ 1 h de Bafoussam et 5 h de Douala. Des moto-taxis desservent le dernier village sur la route des Bamboutos ; la marche commence à partir de là.',
  },
  {
    slug: 'mont-febe-yaounde',
    locale: 'FR',
    summary:
      'Une colline boisée dominant Yaoundé à 1 073 m — la meilleure sortie d\'entraînement courte de la capitale, réalisable avant le travail.',
    description: `Yaoundé s'étend sur sept collines, et le Mont Fébé est celle que l'on gravit. À 1 073 m, elle domine toute la ville, du Palais de l'Unité à la Basilique, et par un matin clair d'harmattan, la vue porte bien au-delà du boulevard circulaire.

Le circuit suit route goudronnée et sentier forestier en passant devant l'hôtel Mont Fébé et le monastère bénédictin, dont le petit musée d'art mérite le détour, puis boucle à travers un reste de forêt sur le flanc nord. Il fait 7 km pour 350 m de dénivelé — suffisant pour un vrai entraînement, assez court pour être fait avant le travail, et entièrement accessible sans guide ni permis.

C'est la sortie d'entraînement classique des randonneurs de Yaoundé qui se préparent pour le mont Cameroun, et les groupes de randonnée locaux l'organisent la plupart des week-ends. Partez tôt : dès 9 h, les tronçons goudronnés chauffent et la circulation s'intensifie sur la route basse. Les randonneurs solitaires devraient s'en tenir aux sections de route principale et éviter les sentiers forestiers après la tombée de la nuit.`,
    hazards: [
      'Circulation sur les tronçons goudronnés partagés',
      'Petits vols sur les sentiers forestiers isolés — marchez accompagné',
      'Chaleur et humidité après 9 h',
    ],
    waterSources: 'Boutiques et hôtel sur le chemin. Prévoyez 1 L.',
    permitInfo: 'Aucun. Accès public libre.',
    gettingThere:
      'Départ depuis le carrefour de Bastos, au pied de la route du Mont Fébé. N\'importe quel taxi de Yaoundé vous conduira au « Mont Fébé » ou au monastère.',
  },
  {
    slug: 'rhumsiki-kapsiki-peaks',
    locale: 'FR',
    summary:
      "Des pitons volcaniques se dressant dans les monts Mandara, près de la frontière nigériane — le paysage le plus photographié du Cameroun, parcouru de village en village.",
    description: `La plaine kapsiki autour de Rhumsiki est un paysage de pitons volcaniques : des culots de basalte dur, restés debout après l'érosion des roches plus tendres qui les entouraient, dressés au-dessus de la plaine comme des dents. On les trouvait sur l'ancien billet de mille francs et dans toutes les brochures touristiques que le pays ait jamais imprimées — et l'attention qu'ils suscitent est méritée.

Ici, la randonnée ne vise pas un sommet. On marche de village en village à travers la plaine puis sur l'escarpement — à travers les concessions kapsiki, le long de terrasses de mil, jusqu'à des points de vue sur les pitons avec le Nigeria à l'horizon lointain. Les itinéraires sont flexibles : trois heures ou trois jours, selon le nombre de villages que l'on souhaite atteindre. Rhumsiki compte des guides, un sorcier-crabe qui lit l'avenir dans les déplacements d'un crabe, et des ateliers artisanaux de forge et de poterie.

Deux contraintes fortes. D'abord la chaleur : de mars à mai, la plaine atteint 40 °C, et randonner après 10 h est réellement dangereux — marchez à l'aube. Ensuite la sécurité : l'Extrême-Nord est touché depuis plus d'une décennie par l'activité de Boko Haram, et la situation près de la frontière nigériane évolue. Vérifiez les recommandations officielles de voyage de votre pays et consultez les guides de Maroua avant de vous engager dans ce voyage. Quand les conditions le permettent, c'est extraordinaire.`,
    hazards: [
      'Chaleur extrême de mars à mai — randonnez uniquement à l\'aube',
      'Situation sécuritaire près de la frontière nigériane : vérifiez les recommandations en vigueur',
      'Aucune ombre dans la plaine',
      'Scorpions et serpents sur terrain rocheux',
    ],
    waterSources:
      'Uniquement des puits villageois, dont le niveau baisse en fin de saison sèche. Prévoyez au moins 4 L par personne.',
    permitInfo:
      "Aucun permis, mais un guide local est en pratique indispensable — à la fois pour s'orienter entre les villages et pour respecter les usages lors de l'entrée dans les concessions kapsiki. Comptez environ 10 000 à 20 000 XAF par jour.",
    gettingThere:
      'Rhumsiki est à environ 1 h 30 de Mokolo, elle-même à 2 h de Maroua. Maroua est desservie par des vols depuis Yaoundé et Douala. Confirmez la situation sécuritaire avant de voyager.',
  },
  {
    slug: 'benoue-park-buffalo-trail',
    locale: 'FR',
    summary:
      'Une marche guidée en savane le long de la rivière Bénoué — buffles, hippopotames, cobs et hippotragues à pied, accompagnés d\'un garde armé du parc.',
    description: `Le parc national de la Bénoué s'étend sur 180 000 hectares de savane arborée guinéenne le long de la rivière Bénoué, et c'est l'un des rares endroits du Cameroun où l'on peut légalement marcher en territoire de grand gibier. Les safaris à pied s'y déroulent avec un garde armé du parc, le long des terrasses de la rivière et à travers des zones boisées dégagées.

Le Buffalo Trail longe la rivière depuis le camp de Buffle Noir. Attendez-vous à croiser cobs de Buffon, hippotragues, phacochères, babouins et, dans les mares, hippopotames et crocodiles. Les buffles sont fréquents, et c'est pour cela que le garde est armé. Lions et élands de Derby sont présents mais rarement observés à pied. Il n'y a ni sommet ni réel dénivelé ; la difficulté vient ici de la chaleur, de la distance et de la concentration qu'exige un safari à pied.

Le parc ferme pendant les pluies : les pistes deviennent impraticables et les animaux se dispersent. La saison s'étend approximativement de décembre à mai, avec une concentration croissante des animaux près de la rivière à mesure que la saison sèche s'installe, ce qui fait de mars et avril la meilleure période d'observation — et la plus chaude pour marcher. Uniquement en début de matinée. Les réservations passent par le bureau du parc à Bénoué ou par le service de conservation à Garoua, et l'entrée à pied sans garde est impossible.`,
    hazards: [
      'Buffles, hippopotames et crocodiles — ne quittez jamais le garde',
      'Chaleur extrême, plus de 40 °C en mars et avril',
      'Mouches tsé-tsé et paludisme',
      'Parc fermé et pistes impraticables pendant les pluies',
    ],
    waterSources:
      "Uniquement au camp. L'eau de la rivière n'est pas potable, et s'en approcher en dehors des points désignés est dangereux. Prévoyez 3 à 4 L.",
    permitInfo:
      "L'entrée du parc, l'escorte du garde et le guide se réservent auprès du bureau du parc de la Bénoué ou du MINFOF à Garoua. Prévoyez un budget d'environ 30 000 à 60 000 XAF par personne et par jour, garde inclus. Marcher sans garde est interdit.",
    gettingThere:
      'Buffle Noir est à environ 2 h 30 de Garoua sur la route de Ngaoundéré. Garoua est desservie par des vols depuis Yaoundé et Douala. Un 4x4 est nécessaire pour les pistes du parc.',
  },
  {
    slug: 'ngaoundaba-crater-lake-loop',
    locale: 'FR',
    summary:
      "Une marche sur les plateaux vallonnés de l'Adamaoua jusqu'à un lac de cratère boisé au sud de Ngaoundéré — fraîche, verdoyante, et presque sans autre randonneur.",
    description: `Le plateau de l'Adamaoua se situe à environ 1 100 m et constitue la région la plus tempérée du Cameroun — verte, vallonnée, parsemée de lacs de cratère, et heureusement épargnée à la fois par l'humidité de la côte et la chaleur de l'Extrême-Nord. Ngaoundaba, à environ 35 km au sud de Ngaoundéré, abrite l'un des plus beaux de ces lacs : un cratère profond ceint d'une forêt-galerie.

La boucle part de la zone du ranch, traverse prairies et forêt-galerie jusqu'au cratère, longe le rebord autant que la végétation le permet, puis revient. Elle fait environ 11 km avec un dénivelé modeste, et son plaisir tient au plateau lui-même : un ciel immense, du bétail peul, des milans dans les airs, et des matinées fraîches qui rendent la marche agréable comme rarement ailleurs dans le pays.

Ngaoundéré est le terminus nord de la ligne ferroviaire Douala–Ngaoundéré, ce qui rend ce point de départ inhabituellement facile à rejoindre sans voiture. La saison sèche, de novembre à mars, offre un sol ferme et des vues dégagées ; les pluies transforment les terres argileuses noires en un piège à bottes.`,
    hazards: [
      'Le sol argileux noir devient une boue impraticable pendant les pluies',
      'Bord de cratère escarpé, non clôturé et masqué par la végétation',
      'Serpents dans les hautes herbes',
      'Très peu de repères sur le plateau dégagé',
    ],
    waterSources: 'Forages du ranch et du village. Prévoyez 2 L.',
    permitInfo:
      'Aucun permis. Organisez un guide à Ngaoundéré (10 000 à 20 000 XAF par groupe) ; les sentiers du plateau ne sont pas balisés.',
    gettingThere:
      'Ngaoundaba se trouve à environ 45 minutes au sud de Ngaoundéré par la route. Ngaoundéré est le terminus du train de nuit depuis Yaoundé et est desservie par des vols depuis Douala.',
  },
  {
    slug: 'dja-reserve-forest-trek',
    locale: 'FR',
    summary:
      "Une randonnée de plusieurs jours dans une forêt tropicale classée au patrimoine mondial de l'UNESCO, avec des guides baka — territoire des éléphants de forêt, des gorilles et des chimpanzés, et le trek le plus exigeant du Cameroun.",
    description: `La réserve de faune du Dja couvre 5 260 km² de forêt tropicale du bassin du Congo quasiment intacte, classée au patrimoine mondial de l'UNESCO et encerclée par la rivière Dja. Quelque 107 espèces de mammifères y vivent, dont le gorille des plaines de l'Ouest, le chimpanzé, l'éléphant de forêt et le bongo. C'est l'endroit le plus riche en biodiversité du Cameroun, et le plus difficile à parcourir à pied.

Les treks partent de Somalomo, à la lisière nord, et durent en général deux à quatre jours, avec des nuits en camps forestiers. Ce sont des guides baka qui mènent la marche — leur connaissance de la forêt est le fondement même du voyage, et le guidage communautaire constitue l'une des rares sources de revenus que les communautés en périphérie de la réserve en tirent. La marche est plate mais sans répit : boue jusqu'à mi-mollet, traversées de rivières, sous-bois dense, aucune vue dégagée, et une chaleur associée à une humidité totale. La faune s'entend bien plus souvent qu'elle ne se voit ; attendez-vous à identifier les gorilles par leurs nids et leurs excréments plutôt qu'en les apercevant, et considérez les oiseaux et primates réellement observés comme un bonus.

Préparez-vous correctement. Un équipement de pluie complet, en acceptant qu'il reste mouillé en permanence, des bottes utilisables trempées, une moustiquaire, ainsi qu'une prophylaxie contre la fièvre jaune et le paludisme. L'accès passe par le Service de conservation à Somalomo et ne peut pas s'organiser sur place à l'arrivée — écrivez à l'avance. Rien d'autre dans le pays n'exige autant, ni ne donne autant en retour.`,
    hazards: [
      "Éléphant de forêt — l'animal le plus dangereux ici",
      'Humidité totale et risque de coup de chaleur',
      'Boue profonde et traversées de rivières jusqu\'à la poitrine',
      "Paludisme, filariose et aucune voie d'évacuation",
      'Aucune couverture mobile dans toute la réserve',
    ],
    waterSources: "Cours d'eau tout au long du parcours, tous à filtrer et traiter. L'eau est la seule chose qui ne manque pas.",
    permitInfo:
      'Les permis d\'entrée, les guides baka et les porteurs s\'organisent à l\'avance auprès du Service de conservation du Dja à Somalomo (MINFOF). Prévoyez un budget de 250 000 à 500 000 XAF par personne pour un trek de 3 à 4 jours, permis, guides, porteurs et nourriture de camp inclus. Organisez cela plusieurs semaines à l\'avance, pas à l\'arrivée.',
    gettingThere:
      'Somalomo se rejoint via Abong-Mbang, à environ 6 à 7 h de Yaoundé, puis par une route difficile vers le nord. Un 4x4 est indispensable, et le dernier tronçon peut devenir impraticable en cas de fortes pluies.',
  },
  {
    slug: 'campo-maan-ebodje-coast',
    locale: 'FR',
    summary:
      "Plage atlantique et forêt tropicale de basse altitude entre Kribi et la frontière avec la Guinée équatoriale — plages de ponte des tortues, village d'Ebodjé, et marche facile sur terrain plat.",
    description: `Le parc national de Campo Ma'an s'étend de la forêt tropicale de basse altitude jusqu'à l'Atlantique, sur la côte sud du Cameroun, et la marche y est la plus douce de ce guide : plate, côtière, et rafraîchie par la brise marine, agréable presque toute l'année.

L'itinéraire classique longe la plage et la lisière forestière entre Ebodjé et Campo. Ebodjé est un village de pêcheurs qui porte un projet communautaire de conservation des tortues marines de longue date — tortues luths, olivâtres et vertes viennent pondre sur ces plages, et entre novembre et février, vous pouvez participer à des patrouilles nocturnes guidées pour observer les pontes et les lâchers de nouveau-nés. Des sentiers vers l'intérieur mènent dans la forêt du parc, qui abrite mandrills, éléphants de forêt et chimpanzés, bien que les observer lors d'une simple sortie à la journée soit peu probable.

Plate et courte, c'est une bonne randonnée familiale et une bonne première sortie de plusieurs jours. Deux choses à savoir : la mer a un fort courant de fond et des noyades surviennent, donc ne vous baignez que là où le font les villageois ; et les traversées de rivières entre les plages dépendent de la marée, donc planifiez les horaires de la journée avec un guide local plutôt qu'avec une carte.`,
    hazards: [
      'Fort courant de fond atlantique — ne vous baignez que là où le font les villageois',
      'Traversées de rivières soumises aux marées entre les plages',
      'Exposition au soleil sur le sable dégagé',
      'Moucherons des sables à l\'aube et au crépuscule',
    ],
    waterSources: 'Puits villageois à Ebodjé et à Campo. Prévoyez 2 L pour les sections de plage.',
    permitInfo:
      "L'entrée du parc pour les sections forestières se paie au bureau de Campo Ma'an ; la marche côtière et les patrouilles tortues s'organisent avec le projet communautaire d'Ebodjé, pour environ 10 000 à 20 000 XAF par personne, une somme reversée à la conservation des tortues.",
    gettingThere:
      'Ebodjé se trouve à environ 1 h 30 au sud de Kribi sur la route de Campo. Kribi est à 3 h de Douala ou 4 h de Yaoundé par la route.',
  },
  {
    slug: 'lobeke-bai-forest-trek',
    locale: 'FR',
    summary:
      "Une forêt tropicale profonde du bassin du Congo, à l'extrême sud-est du Cameroun, parcourue entre des clairières forestières où gorilles, éléphants de forêt et buffles sortent à découvert — un site du complexe transfrontalier du patrimoine mondial du Sangha.",
    description: `Le parc national de Lobéké se situe à l'extrême sud-est du Cameroun, là où la rivière Sangha marque la frontière avec la République centrafricaine et la République du Congo. Avec Dzanga-Sangha, de l'autre côté de la rivière en RCA, et Nouabalé-Ndoki au Congo, il forme le Sangha Trinational — un bloc continu de 750 000 hectares de forêt tropicale du bassin du Congo géré comme un seul paysage classé au patrimoine mondial, bien que l'on ne marche jamais que dans le tiers camerounais.

La marche ici s'organise autour des baïs : des clairières forestières naturelles, alimentées par des eaux marécageuses riches en minéraux, où la canopée fermée s'ouvre et où des animaux autrement invisibles dans la forêt dense sortent brouter et boire à découvert. Les treks guidés depuis Mambélé relient deux ou trois baïs sur plusieurs jours, avec des nuits en camp forestier et de longues veilles depuis des miradors surélevés surplombant les clairières, à l'aube et au crépuscule — c'est un parc que l'on découvre en attendant en silence, pas en couvrant de la distance. Gorille des plaines de l'Ouest, éléphant de forêt, buffle, bongo et sitatunga sont tous des observations réalistes depuis un mirador ; la panthère est présente mais rarement aperçue.

C'est un lieu isolé, même selon les standards camerounais. Rejoindre Mambélé depuis Yaoundé représente déjà un voyage de deux jours, et l'approche finale exige un 4x4 et une route de saison sèche. En échange, on découvre l'un des derniers blocs de forêt tropicale les moins perturbés d'Afrique centrale, et une expérience d'observation de la faune — regarder vraiment, pas simplement entrapercevoir — que les parcs plus accessibles du pays ne peuvent offrir.`,
    hazards: [
      'Éléphants de forêt et buffles à proximité immédiate autour des baïs',
      "Humidité totale, chaleur et boue sous les pieds pendant plusieurs jours d'affilée",
      "Paludisme et filariose — aucune voie d'évacuation depuis les camps les plus reculés",
      'Aucune couverture mobile dans tout le parc',
      'Route d\'approche longue et difficile — impraticable en cas de fortes pluies',
    ],
    waterSources: "Cours d'eau forestiers, à filtrer et traiter. Apportez votre propre système de filtration ; rien n'est en vente une fois quitté Mambélé.",
    permitInfo:
      'Les permis d\'entrée et les guides s\'organisent via le service de conservation du MINFOF à Mambélé, idéalement réservés plusieurs semaines à l\'avance par l\'intermédiaire d\'un opérateur basé à Yaoundé. Prévoyez un budget de 300 000 à 550 000 XAF par personne pour un trek de 3 à 4 jours, permis, guides, porteurs et nourriture de camp inclus.',
    gettingThere:
      'Depuis Yaoundé : Bertoua (environ 6 h), puis Yokadouma (7 h supplémentaires sur 304 km), puis Mambélé (5 h de plus sur 165 km, sur une piste nécessitant un 4x4 et pouvant se fermer pendant les pluies). Prévoyez deux journées complètes de trajet dans chaque sens.',
  },
  {
    slug: 'chutes-de-la-metche',
    locale: 'FR',
    summary:
      'Une chute de 40 m sur la rivière Metchié-Choumi près de Bafoussam — une marche courte et facile jusqu\'à un site à la fois pittoresque et chargé d\'une véritable importance historique pour la région.',
    description: `Les chutes de la Métché se trouvent à environ 30 km au nord-ouest de Bafoussam sur la N6, là où la rivière Metchié-Choumi chute d'environ 40 m dans un amphithéâtre rocheux, à la frontière des départements de la Menoua, des Bamboutos et de la Mifi. La marche jusqu'aux chutes est courte — un sentier balisé descendant depuis le parking en bord de route, quinze à vingt minutes dans chaque sens —, ce qui en fait l'une des haltes les plus faciles et les plus intéressantes des hautes terres de l'Ouest.

Le site porte un poids qui dépasse la seule cascade. Pendant la lutte pour l'indépendance des années 1950 et 1960, Métché a servi de lieu d'exécution, et il reste aujourd'hui un lieu de pèlerinage et de purification pour les communautés environnantes — les visiteurs y voient souvent des offrandes de sel, de pièces de monnaie et d'huile de palme. Ce n'est pas un détail folklorique à photographier en passant ; renseignez-vous localement avant de traiter le site comme une simple halte pittoresque, et respectez les mêmes égards que dans tout lieu de mémoire.

Courte, facile et proche de Bafoussam, cette sortie se combine naturellement avec une randonnée sur la crête des Bamboutos, ou peut se faire seule en demi-journée depuis la ville. Le sentier est humide et peut être glissant sur la dernière descente jusqu'au point d'observation ; des chaussures adaptées comptent plus que ne le laisse penser la distance.`,
    hazards: [
      'Rochers humides et glissants sur la dernière descente',
      'Points de vue non clôturés, proches du vide',
      'Le site est activement utilisé pour des offrandes et des cérémonies — traitez-le avec respect, pas comme un simple décor de photo',
    ],
    waterSources: 'Apportez votre propre eau. Boutiques et étals en bord de route à Bamougoum avant le départ du sentier.',
    permitInfo:
      "Aucun permis formel. Un guide local au parking (environ 3 000 à 5 000 XAF) est facultatif, mais connaît l'histoire et les usages du site.",
    gettingThere:
      'Depuis Bafoussam, prenez la N6 en direction du nord-ouest vers Mbouda sur environ 30 km jusqu\'à Bamougoum ; les chutes sont signalées depuis la route, à courte distance à pied de la gare de Bamougoum.',
  },
  {
    slug: 'waza-park-walking-safari',
    locale: 'FR',
    summary:
      "Une marche en savane sahélienne avec un garde armé, dans l'un des parcs les plus connus d'Afrique de l'Ouest pour ses éléphants, girafes et lions — à pied, à l'extrême nord du Cameroun.",
    description: `Le parc national de Waza a été classé réserve de chasse en 1934 et couvre 1 700 km² de plaine inondable sahélienne et de savane à acacias, tout contre la frontière tchadienne. C'est le parc camerounais le plus connu à l'international — les girafes, éléphants et lions qui figurent dans toutes les brochures touristiques du pays sont ceux de Waza — et c'est l'un des rares endroits du pays où l'on peut parcourir ce paysage à pied plutôt qu'à travers la vitre d'un véhicule.

Les safaris à pied partent du poste de garde près du village de Waza, à la lisière nord-ouest du parc, toujours accompagnés d'un garde armé du service de conservation, le long des pistes de la plaine inondable où le gibier se concentre à mesure que la saison sèche avance. Éléphants, girafes, cobs, bubales et phacochères sont fréquents ; lions et guépards sont présents mais bien moins souvent observés à pied qu'en véhicule à l'aube. Il n'y a ni dénivelé ni réelle distance à parcourir ; la difficulté ici tient à la chaleur, à l'exposition au soleil sur la plaine dégagée, et à la concentration totale qu'exige un safari à pied parmi le grand gibier.

La saison sèche, approximativement de novembre à avril, est à la fois la seule période où la marche est praticable et la meilleure pour observer le gibier, les animaux se concentrant autour des points d'eau qui rétrécissent. La saison des pluies inonde la plaine et ferme totalement le parc à la marche. C'est aussi une zone sensible sur le plan sécuritaire : l'Extrême-Nord est touché depuis une décennie par l'instabilité liée au bassin du Tchad — vérifiez donc les recommandations en vigueur et passez par le bureau du parc plutôt que d'organiser quoi que ce soit de manière informelle.`,
    hazards: [
      'Éléphants et buffles — ne quittez jamais le garde',
      'Chaleur extrême, régulièrement au-dessus de 40 °C en mars et avril',
      'Aucune ombre sur la plaine inondable dégagée',
      'Parc fermé et impraticable pendant la saison des pluies',
      'Situation sécuritaire près de la frontière tchadienne — vérifiez les recommandations en vigueur',
    ],
    waterSources: 'Uniquement au poste de garde et au village de Waza. Prévoyez 3 à 4 L par personne ; rien n\'est disponible pendant la marche.',
    permitInfo:
      "L'entrée du parc, l'escorte du garde et le guide se réservent auprès du bureau du parc de Waza. Prévoyez un budget d'environ 25 000 à 50 000 XAF par personne et par jour, garde inclus. Marcher sans garde est interdit.",
    gettingThere:
      'Waza se trouve à environ 2 h au nord de Maroua sur une route goudronnée. Maroua est desservie par des vols depuis Yaoundé et Douala. Confirmez la situation sécuritaire actuelle avant de voyager.',
  },
  {
    slug: 'lac-tison-vina-falls',
    locale: 'FR',
    summary:
      'Une demi-journée fraîche et verdoyante au départ de Ngaoundéré, sur le plateau de l\'Adamaoua — un lac de cratère et une chute sur la rivière Vina, tous deux facilement accessibles depuis la ville-terminus du rail camerounais.',
    description: `Ngaoundéré se situe sur le plateau de l'Adamaoua à environ 1 100 m, la région la plus fraîche et la plus verte du Cameroun, et deux de ses plus belles marches courtes se trouvent à moins de 15 km de la ville. Le lac Tison est un petit lac de cratère que l'on rejoint par une piste grimpant une crête basse juste au sud de la ville ; les chutes de la Vina, un peu plus loin sur la même route en direction de Meiganga, tombent sur un rebord rocheux de la rivière Vina, à peine à 200 m de la route.

La marche relie les deux sites : depuis la lisière sud de Ngaoundéré jusqu'au lac Tison, puis retour vers la route et poursuite jusqu'aux chutes, le tout sur prairie de plateau et pistes agricoles, sous un ciel immense, en compagnie du bétail peul. Aucun des deux sites ne demande beaucoup de temps ni de forme physique — l'attrait, c'est le plateau lui-même, assez frais pour véritablement apprécier la marche, ce qui n'est pas le cas de la majeure partie du Cameroun à cette latitude.

Pour qui dispose d'une journée supplémentaire, les chutes de Tello — une cascade de 45 m avec une large caverne derrière la chute — se trouvent à environ 60 km à l'est de Ngaoundéré sur la piste de Bélel, mais elles constituent une sortie distincte d'une demi-journée plutôt qu'un prolongement de cette marche. Ngaoundéré est le terminus nord de la ligne ferroviaire Douala–Ngaoundéré, ce qui rend ces deux sorties particulièrement faciles à ajouter au programme pour quiconque arrive en train plutôt que par la route.`,
    hazards: [
      'Bord de cratère non clôturé au lac Tison',
      'Rochers humides au point de vue des chutes',
      'Le sol argileux noir se transforme en boue profonde pendant les pluies',
      'Peu de repères sur la piste du plateau dégagé',
    ],
    waterSources: 'En ville à Ngaoundéré avant le départ. Prévoyez 2 L — rien de fiable en cours de route.',
    permitInfo:
      'Aucun permis. Un guide de Ngaoundéré (10 000 à 15 000 XAF) est utile pour la piste du lac Tison, non balisée au-delà des terres cultivées.',
    gettingThere:
      'Les deux sites se rejoignent depuis Ngaoundéré sur la N1 en direction de Meiganga : le lac Tison via une piste signalée à environ 3 km au sud de la ville, les chutes de la Vina un peu plus loin, à environ 200 m de la route. Ngaoundéré est le terminus du train de nuit depuis Yaoundé et est desservie par des vols depuis Douala.',
  },
];
