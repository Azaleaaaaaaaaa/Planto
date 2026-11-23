export interface PlantProduct {
  id: string;
  name: string;
  subtitle: string;
  category: 'Tanaman Indoor' | 'Tanaman Meja' | 'Tanaman O2' | 'Sukulen';
  price: number;
  priceFormatted: string;
  description: string;
  longDescription: string;
  image: string;
  careLevel: 'Mudah' | 'Sedang';
  light: string;
  water: string;
  oxygenBoost: string;
  featuredIn?: 'hero' | 'trendy-1' | 'trendy-2' | 'top-selling' | 'best-o2';
}

export const assets = {
  heroBg: '/assets/38635.png',
  logoPlant: '/assets/c5d10.png',
  searchIcon: '/assets/54665.png',
  bagIcon: '/assets/beac3.png',
  plantCalathea: '/assets/2c828.png',
  rightArrow: '/assets/2b07c.png',
  avatarAlinaPatel: '/assets/54211.png',
  plantDesk1: '/assets/3ac90.png',
  plantDesk2: '/assets/567a3.png',
  plantCal874: '/assets/f3c57.png',
  plantShow: '/assets/dc5b2.png',
  plantCalatheaAi: '/assets/56413.png',
  plantCalatO2: '/assets/5a7ab.png',
  avatarMalnJosi: '/assets/hadi.png',
  avatarAlinaThakur: '/assets/alfa.png',
  avatarMaxMakvana: '/assets/ais.png',
  navPolygon: '/assets/d568d.svg',
  menuHamburger: '/assets/65610.svg',
  cardFrameSvg: '/assets/b4a3c.svg',
  heroSliderDots: '/assets/6ab15.svg',
  playButtonSvg: '/assets/279c0.svg',
  starsSvg: '/assets/cf346.svg',
  trendyBracketRight: '/assets/63b15.svg',
  trendyBracketLeft: '/assets/e0090.svg',
  sectionBracketRight: '/assets/8491e.svg',
  sectionBracketLeft: '/assets/5c350.svg',
  reviewCardSvg: '/assets/d1da3.svg',
  o2SliderDots: '/assets/1dfcc.svg',
  footerPolygon: '/assets/e6a44.svg',
  subscribeBtnSvg: '/assets/54b4e.svg',
};

export const formatRupiah = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const products: PlantProduct[] = [
  {
    id: 'calathea-plant',
    name: 'Tanaman Calathea',
    subtitle: 'Tanaman Rumah Kekinian',
    category: 'Tanaman Indoor',
    price: 309000,
    priceFormatted: 'Rp 309.000',
    description:
      'Tanaman hias daun bercorak eksotis yang menyegarkan udara ruangan Anda.',
    longDescription:
      'Calathea memiliki corak daun artistik yang bergerak mengikuti cahaya sekaligus menyaring polutan udara di dalam ruangan.',
    image: assets.plantCalathea,
    careLevel: 'Mudah',
    light: 'Cahaya Teduh',
    water: '2x Seminggu',
    oxygenBoost: '+94% Udara Bersih',
    featuredIn: 'top-selling',
  },
  {
    id: 'desk-plant',
    name: 'Tanaman Meja Hijau',
    subtitle: 'Tanaman Meja Minimalis',
    category: 'Tanaman Meja',
    price: 359000,
    priceFormatted: 'Rp 359.000',
    description:
      'Tanaman meja mungil berdaun rimbun untuk menemani fokus kerja harian.',
    longDescription:
      'Tanaman meja ringkas dan tahan banting dalam pot keramik minimalis, cocok untuk meja kerja maupun meja belajar.',
    image: assets.plantDesk1,
    careLevel: 'Mudah',
    light: 'Cahaya Redup - Terang',
    water: '1x Seminggu',
    oxygenBoost: '+88% Udara Bersih',
    featuredIn: 'top-selling',
  },
  {
    id: 'calathea-ai-plant',
    name: 'Tanaman Sansivera',
    subtitle: 'Penyaring Udara Alami',
    category: 'Sukulen',
    price: 399000,
    priceFormatted: 'Rp 399.000',
    description:
      'Sukulen daun tegak minimalis yang aktif menghasilkan oksigen malam hari.',
    longDescription:
      'Berdaun tegak arsitektural dalam pot putih minimalis, efektif melepaskan oksigen bersih dengan penyiraman sangat hemat.',
    image: assets.plantCalatheaAi,
    careLevel: 'Mudah',
    light: 'Semua Cahaya Ruangan',
    water: 'Setiap 14 Hari',
    oxygenBoost: '+96% Udara Bersih',
    featuredIn: 'top-selling',
  },
  {
    id: 'cal-874-plant',
    name: 'Kaktus Terakota 874',
    subtitle: 'Koleksi Sukulen Gurun',
    category: 'Sukulen',
    price: 259000,
    priceFormatted: 'Rp 259.000',
    description:
      'Kaktus biru-hijau tangguh dalam pot terakota yang sangat hemat air.',
    longDescription:
      'Kaktus sukulen eksotis dengan pot terakota hangat yang sangat mudah dirawat dan tahan di area bercahaya terang.',
    image: assets.plantCal874,
    careLevel: 'Mudah',
    light: 'Cahaya Terang Langsung',
    water: 'Setiap 3 Minggu',
    oxygenBoost: '+82% Udara Bersih',
    featuredIn: 'top-selling',
  },
  {
    id: 'show-plant',
    name: 'Monstera Deliciosa',
    subtitle: 'Koleksi Tanaman Penghasil O2 Terbaik',
    category: 'Tanaman O2',
    price: 759000,
    priceFormatted: 'Rp 759.000',
    description:
      'Monstera tropis berdaun lebar sebagai penghasil oksigen alami terbaik ruangan.',
    longDescription:
      'Tanaman Monstera ikonik dengan pot hitam elegan di atas dudukan kayu, penghasil oksigen tertinggi untuk interior modern.',
    image: assets.plantShow,
    careLevel: 'Sedang',
    light: 'Cahaya Terang Tersaring',
    water: '1x Seminggu',
    oxygenBoost: '+99% Produksi O2',
    featuredIn: 'top-selling',
  },
  {
    id: 'calat-o2-plant',
    name: 'Palem Tropis O2',
    subtitle: 'Palem Oksigen Tropis',
    category: 'Tanaman O2',
    price: 659000,
    priceFormatted: 'Rp 659.000',
    description:
      'Palem hijau zamrud penyaring racun udara dan penjaga kelembapan alami.',
    longDescription:
      'Daun palem tropis lebar yang secara alami menyaring polusi udara serta menjaga kesejukan ruangan sepanjang hari.',
    image: assets.plantCalatO2,
    careLevel: 'Sedang',
    light: 'Cahaya Teduh',
    water: '2x Seminggu',
    oxygenBoost: '+97% Produksi O2',
    featuredIn: 'top-selling',
  },
  {
    id: 'trendy-desk-ai-1',
    name: 'Tanaman Hias Meja Kerja',
    subtitle: 'Koleksi Meja Kekinian',
    category: 'Tanaman Meja',
    price: 599000,
    priceFormatted: 'Rp 599.000',
    description:
      'Tanaman meja berdaun segar dalam pot keramik untuk suasana kerja tenang.',
    longDescription:
      'Tanaman meja pilihan dengan daun hijau berlapis dalam pot keramik organik untuk meningkatkan ketenangan ruang kerja.',
    image: assets.plantDesk1,
    careLevel: 'Mudah',
    light: 'Cahaya Redup - Terang',
    water: '1x Seminggu',
    oxygenBoost: '+92% Udara Bersih',
    featuredIn: 'trendy-1',
  },
  {
    id: 'trendy-desk-ai-2',
    name: 'Sukulen Meja Keramik Mint',
    subtitle: 'Sukulen Meja Segar',
    category: 'Tanaman Meja',
    price: 599000,
    priceFormatted: 'Rp 599.000',
    description:
      'Sukulen aloe modern dengan pot keramik mint untuk dekorasi meja.',
    longDescription:
      'Sukulen hibrida aloe artistik dalam pot keramik hijau mint lembut, dirancang khusus untuk rak dan meja modern.',
    image: assets.plantDesk2,
    careLevel: 'Mudah',
    light: 'Cahaya Terang Teduh',
    water: 'Setiap 10 Hari',
    oxygenBoost: '+91% Udara Bersih',
    featuredIn: 'trendy-2',
  },
];

export const o2Collections = [
  {
    id: 'show-plant',
    title: 'Koleksi Tanaman Penghasil O2 Terbaik Untuk Ruangan Anda',
    paragraph1:
      'Koleksi tanaman Monstera penghasil oksigen murni untuk menyegarkan udara rumah Anda.',
    paragraph2:
      'Mudah dirawat di dalam ruangan dengan tampilan pot kayu estetik.',
    image: assets.plantShow,
    productRefId: 'show-plant',
  },
  {
    id: 'calat-o2-plant',
    title: 'Oksigen Murni Di Dalam Rumah Dengan Seri Tanaman Tropis O2',
    paragraph1:
      'Tanaman tropis pilihan yang efektif menyerap karbon dioksida di ruangan tertutup.',
    paragraph2:
      'Lengkap dengan pot keramik artisan dan media tanam nutrisi organik.',
    image: assets.plantCalatO2,
    productRefId: 'calat-o2-plant',
  },
  {
    id: 'calathea-plant',
    title: 'Daun Bercorak Indah Yang Menghidupkan Setiap Sudut Ruangan',
    paragraph1:
      'Daun Calathea bercorak indah yang menyaring debu dan menenangkan mata.',
    paragraph2:
      'Aman bagi hewan peliharaan serta tumbuh subur di suhu ruangan.',
    image: assets.plantCalathea,
    productRefId: 'calathea-plant',
  },
  {
    id: 'desk-plant',
    title: 'Penambah Oksigen Ringkas Untuk Ruang Kerja & Studio',
    paragraph1:
      'Hadirkan kesegaran oksigen alami langsung di atas meja kerja Anda.',
    paragraph2:
      'Jadwal penyiraman praktis seminggu sekali dengan produksi oksigen tetap optimal.',
    image: assets.plantDesk1,
    productRefId: 'desk-plant',
  },
];

export const customerReviews = [
  {
    id: 'Hadi',
    name: 'Hadi DS',
    avatar: assets.avatarMalnJosi,
    comment: 'Keren Cik',
  },
  {
    id: 'Alfarabi',
    name: 'Alfarabi',
    avatar: assets.avatarAlinaThakur,
    comment: 'Terima kasih banyak cikkk..',
  },
  {
    id: 'Ais',
    name: 'Farisyi',
    avatar: assets.avatarMaxMakvana,
    comment: 'Mantap cik, tanaman hidup dan segar',
  },
];
