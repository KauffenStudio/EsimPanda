export interface MockDestination {
  id: string;
  name: string;
  slug: string;
  iso_code: string;
  region: string;
  image_url: string;
  is_active: boolean;
  popularity_rank: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

const now = '2026-04-01T00:00:00Z';

function dest(
  seq: number,
  name: string,
  slug: string,
  iso_code: string,
  region: string,
  image_url: string,
  popularity_rank: number
): MockDestination {
  return {
    id: `a1b2c3d4-${String(seq).padStart(4, '0')}-4000-8000-000000000000`,
    name,
    slug,
    iso_code,
    region,
    image_url,
    is_active: true,
    popularity_rank,
    synced_at: now,
    created_at: now,
    updated_at: now,
  };
}

export const mockDestinations: MockDestination[] = [
  // ── Regional plans ──────────────────────────────────────────────
  dest(1, 'Europe', 'europe', 'EU', 'europe-wide', 'https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?w=600&h=450&fit=crop', 0),
  dest(2, 'Asia', 'asia', 'AS', 'asia-wide', 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=450&fit=crop', 0),
  dest(3, 'Global', 'global', 'GL', 'global', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=450&fit=crop', 0),

  // ── Europe ──────────────────────────────────────────────────────
  // Each image is the lead photograph of an iconic landmark from the country, sourced from Wikimedia Commons (verified country-correct).
  dest(10, 'France', 'france', 'FR', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg', 1),
  dest(11, 'Spain', 'spain', 'ES', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/2/26/%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg', 2),
  dest(12, 'Italy', 'italy', 'IT', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1600px-Colosseo_2020.jpg', 3),
  dest(13, 'Germany', 'germany', 'DE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg', 4),
  dest(14, 'Portugal', 'portugal', 'PT', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/1600px-Torre_Bel%C3%A9m_April_2009-4a.jpg', 5),
  dest(15, 'Netherlands', 'netherlands', 'NL', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png', 6),
  dest(16, 'United Kingdom', 'united-kingdom', 'GB', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/4/43/Elizabeth_Tower%2C_June_2022.jpg', 7),
  dest(17, 'Greece', 'greece', 'GR', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/d/da/The_Parthenon_in_Athens.jpg', 8),
  dest(18, 'Turkey', 'turkey', 'TR', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Hagia_Sophia_%28228968325%29.jpeg', 9),
  dest(19, 'Poland', 'poland', 'PL', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/1600px-Wawel_%284%29.jpg', 10),
  dest(20, 'Czech Republic', 'czech-republic', 'CZ', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg/1600px-Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg', 11),
  dest(21, 'Austria', 'austria', 'AT', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Wien_-_Schloss_Sch%C3%B6nbrunn.JPG/1600px-Wien_-_Schloss_Sch%C3%B6nbrunn.JPG', 12),
  dest(22, 'Albania', 'albania', 'AL', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Berat_57.jpg/1600px-Berat_57.jpg', 13),
  dest(23, 'Andorra', 'andorra', 'AD', 'europe', 'https://upload.wikimedia.org/wikipedia/en/d/da/Casa_de_la_Vall_4.JPG', 14),
  dest(24, 'Armenia', 'armenia', 'AM', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Mount_Ararat_and_the_Yerevan_skyline_%28June_2018%29.jpg/1600px-Mount_Ararat_and_the_Yerevan_skyline_%28June_2018%29.jpg', 15),
  dest(25, 'Azerbaijan', 'azerbaijan', 'AZ', 'europe', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Flame_towers_baku.jpg/1600px-Flame_towers_baku.jpg', 16),
  dest(26, 'Belgium', 'belgium', 'BE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Grand-Place%2C_Brussels_-_panorama%2C_June_2018.jpg/1600px-Grand-Place%2C_Brussels_-_panorama%2C_June_2018.jpg', 17),
  dest(27, 'Bulgaria', 'bulgaria', 'BG', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/4/46/Rila_Monastery%2C_August_2013.jpg', 18),
  dest(28, 'Croatia', 'croatia', 'HR', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg', 19),
  dest(29, 'Cyprus', 'cyprus', 'CY', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Roca_de_Afrodita%2C_Chipre%2C_2021-12-10%2C_DD_65.jpg/1600px-Roca_de_Afrodita%2C_Chipre%2C_2021-12-10%2C_DD_65.jpg', 20),
  dest(100, 'Denmark', 'denmark', 'DK', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/The_Nyhavn_Canal_3.jpg/1600px-The_Nyhavn_Canal_3.jpg', 21),
  dest(101, 'Estonia', 'estonia', 'EE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Raekoja_plats_at_night.jpg/1600px-Raekoja_plats_at_night.jpg', 22),
  dest(102, 'Finland', 'finland', 'FI', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Kirkko3.png', 23),
  dest(103, 'Georgia', 'georgia', 'GE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg/1600px-View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg', 24),
  dest(104, 'Hungary', 'hungary', 'HU', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Budapest_Orsz%C3%A1gh%C3%A1z_%2831355012995%29.jpg', 25),
  dest(105, 'Iceland', 'iceland', 'IS', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Leifur_Eir%C3%ADksson_and_Hallgr%C3%ADmskirkja_%2814527191932%29.jpg', 26),
  dest(106, 'Ireland', 'ireland', 'IE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Cliffs-Of-Moher-OBriens-From-South.JPG/1600px-Cliffs-Of-Moher-OBriens-From-South.JPG', 27),
  dest(107, 'Latvia', 'latvia', 'LV', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Riga_%2833844464828%29.jpg/1600px-Riga_%2833844464828%29.jpg', 28),
  dest(108, 'Liechtenstein', 'liechtenstein', 'LI', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Liechtenstein_asv2022-10_img22_Vaduz_Schloss.jpg/1600px-Liechtenstein_asv2022-10_img22_Vaduz_Schloss.jpg', 29),
  dest(109, 'Lithuania', 'lithuania', 'LT', 'europe', 'https://upload.wikimedia.org/wikipedia/en/8/84/The_White_Bridge_and_%C5%A0nipi%C5%A1k%C4%97s_district_in_Vilnius_in_2023_by_Augustas_Did%C5%BEgalvis.jpg', 30),
  dest(110, 'Luxembourg', 'luxembourg', 'LU', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Luxembourg_Grand_Ducal_Palace_01.jpg/1600px-Luxembourg_Grand_Ducal_Palace_01.jpg', 31),
  dest(111, 'Malta', 'malta', 'MT', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/St_Sebastian_Curtain_%28cropped%29.jpg/1600px-St_Sebastian_Curtain_%28cropped%29.jpg', 32),
  dest(112, 'Moldova', 'moldova', 'MD', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Consiliul_Municipal_Chi%C8%99in%C4%83u_%28cropped%29.jpg', 33),
  dest(113, 'Montenegro', 'montenegro', 'ME', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/20090719_Crkva_Gospa_od_Zdravlja_Kotor_Bay_Montenegro.jpg/1600px-20090719_Crkva_Gospa_od_Zdravlja_Kotor_Bay_Montenegro.jpg', 34),
  dest(114, 'North Macedonia', 'north-macedonia', 'MK', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Lake_Ohrid%2C_Macedonia-Albania_viewed_from_a_NASA_satellite.jpg', 35),
  dest(115, 'Norway', 'norway', 'NO', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/1600px-Geirangerfjord_.jpg', 36),
  dest(116, 'Romania', 'romania', 'RO', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/1/17/Castelul_Bran2.jpg', 37),
  dest(117, 'San Marino', 'san-marino', 'SM', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/View_of_Mount_Titano_-_San_Marino.jpg/1600px-View_of_Mount_Titano_-_San_Marino.jpg', 38),
  dest(118, 'Serbia', 'serbia', 'RS', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/%D0%9A%D0%B0%D0%BB%D0%B5%D0%BC%D0%B5%D0%B3%D0%B4%D0%B0%D0%BD%2C_%D1%81%D0%BF%D0%BE%D0%BC%D0%B5%D0%BD%D0%B8%D0%BA_%D0%9F%D0%BE%D0%B1%D1%98%D0%B5%D0%B4%D0%BD%D0%B8%D0%BA%2C_%D0%91%D0%B8%D0%BE%D0%B3%D1%80%D0%B0%D0%B4.jpg', 39),
  dest(119, 'Slovakia', 'slovakia', 'SK', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bratislava_-_Burg_%28b%29.JPG/1600px-Bratislava_-_Burg_%28b%29.JPG', 40),
  dest(120, 'Slovenia', 'slovenia', 'SI', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Lake_Bled_from_the_Mountain.jpg/1600px-Lake_Bled_from_the_Mountain.jpg', 41),
  dest(121, 'Sweden', 'sweden', 'SE', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Royal_Dramatic_Theatre_Stockholm.jpg/1600px-Royal_Dramatic_Theatre_Stockholm.jpg', 42),
  dest(122, 'Switzerland', 'switzerland', 'CH', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg', 43),
  dest(123, 'Ukraine', 'ukraine', 'UA', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/80-391-0151_Kyiv_St.Sophia%27s_Cathedral_RB_18_2_%28cropped%29.jpg/1600px-80-391-0151_Kyiv_St.Sophia%27s_Cathedral_RB_18_2_%28cropped%29.jpg', 44),
  dest(124, 'Vatican City', 'vatican-city', 'VA', 'europe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1600px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg', 45),

  // ── Asia ────────────────────────────────────────────────────────
  dest(30, 'Japan', 'japan', 'JP', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1600px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg', 1),
  dest(31, 'South Korea', 'south-korea', 'KR', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/1600px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg', 2),
  dest(32, 'Thailand', 'thailand', 'TH', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/1600px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg', 3),
  dest(33, 'Indonesia', 'indonesia', 'ID', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/1600px-Pradaksina.jpg', 4),
  dest(34, 'Vietnam', 'vietnam', 'VN', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Ha_Long_Bay_in_2019.jpg', 5),
  dest(35, 'Malaysia', 'malaysia', 'MY', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bukit_Bintang_junction_in_2024_2.jpg/1600px-Bukit_Bintang_junction_in_2024_2.jpg', 6),
  dest(36, 'Singapore', 'singapore', 'SG', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/1600px-Marina_Bay_Sands_%28I%29.jpg', 7),
  dest(37, 'India', 'india', 'IN', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg', 8),
  dest(38, 'Philippines', 'philippines', 'PH', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Banaue-terrace.JPG/1600px-Banaue-terrace.JPG', 9),
  dest(39, 'China', 'china', 'CN', 'asia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1600px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg', 10),

  // ── North America ────────────────────────────────────────────────
  dest(50, 'United States', 'united-states', 'US', 'north-america', 'https://upload.wikimedia.org/wikipedia/commons/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg', 1),
  dest(51, 'Canada', 'canada', 'CA', 'north-america', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Toronto_Skyline_from_Snake_Island%2C_February_28_2026_%2808%29.jpg/1600px-Toronto_Skyline_from_Snake_Island%2C_February_28_2026_%2808%29.jpg', 2),
  dest(52, 'Mexico', 'mexico', 'MX', 'north-america', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/1600px-Chichen_Itza_3.jpg', 3),

  // ── South America ──────────────────────────────────────────────
  dest(53, 'Brazil', 'brazil', 'BR', 'south-america', 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg', 1),
  dest(55, 'Argentina', 'argentina', 'AR', 'south-america', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Iguazu_Cataratas2.jpg/1600px-Iguazu_Cataratas2.jpg', 3),

  // ── Middle East ─────────────────────────────────────────────────
  dest(61, 'Saudi Arabia', 'saudi-arabia', 'SA', 'middle-east', 'https://upload.wikimedia.org/wikipedia/en/b/b2/Kingdom_Centre_Riyadh_2024.jpeg', 2),
  dest(62, 'Qatar', 'qatar', 'QA', 'middle-east', 'https://upload.wikimedia.org/wikipedia/commons/2/26/The_Pearl_Marina_in_Nov_2013.jpg', 3),
  dest(63, 'Egypt', 'egypt', 'EG', 'middle-east', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Pyramids_of_the_Giza_Necropolis.jpg/1600px-Pyramids_of_the_Giza_Necropolis.jpg', 4),

  // ── Oceania ─────────────────────────────────────────────────────
  dest(70, 'Australia', 'australia', 'AU', 'oceania', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Sydney_Australia._%2821339175489%29.jpg', 1),
  dest(71, 'New Zealand', 'new-zealand', 'NZ', 'oceania', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Milford_Sound_%28New_Zealand%29.JPG/1600px-Milford_Sound_%28New_Zealand%29.JPG', 2),

  // ── Africa ──────────────────────────────────────────────────────
  dest(81, 'Morocco', 'morocco', 'MA', 'africa', 'https://upload.wikimedia.org/wikipedia/commons/4/49/Marokko0112_%28retouched%29.jpg', 2),
];
