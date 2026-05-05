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

const PEXELS_QS = '?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop';

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

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg${PEXELS_QS}`;
}

export const mockDestinations: MockDestination[] = [
  // ── Regional plans ──────────────────────────────────────────────
  dest(1, 'Europe', 'europe', 'EU', 'europe-wide', pexels(417074), 0),
  dest(2, 'Asia', 'asia', 'AS', 'asia-wide', pexels(2070033), 0),
  dest(3, 'Global', 'global', 'GL', 'global', pexels(220201), 0),

  // ── Europe ──────────────────────────────────────────────────────
  // All hero photos sourced from Pexels, hand-picked iconic landmark/scenery for each country.
  dest(10, 'France', 'france', 'FR', 'europe', pexels(31682150), 1),
  dest(11, 'Spain', 'spain', 'ES', 'europe', pexels(18506425), 2),
  dest(12, 'Italy', 'italy', 'IT', 'europe', pexels(36581134), 3),
  dest(13, 'Germany', 'germany', 'DE', 'europe', pexels(37120347), 4),
  dest(14, 'Portugal', 'portugal', 'PT', 'europe', pexels(30709376), 5),
  dest(15, 'Netherlands', 'netherlands', 'NL', 'europe', pexels(29351196), 6),
  dest(16, 'United Kingdom', 'united-kingdom', 'GB', 'europe', pexels(17974005), 7),
  dest(17, 'Greece', 'greece', 'GR', 'europe', pexels(15532995), 8),
  dest(18, 'Turkey', 'turkey', 'TR', 'europe', pexels(28836256), 9),
  dest(19, 'Poland', 'poland', 'PL', 'europe', pexels(30369048), 10),
  dest(20, 'Czech Republic', 'czech-republic', 'CZ', 'europe', pexels(16945287), 11),
  dest(21, 'Austria', 'austria', 'AT', 'europe', pexels(16848650), 12),
  dest(22, 'Albania', 'albania', 'AL', 'europe', pexels(34092374), 13),
  dest(23, 'Andorra', 'andorra', 'AD', 'europe', pexels(26558343), 14),
  dest(24, 'Armenia', 'armenia', 'AM', 'europe', pexels(34823956), 15),
  dest(25, 'Azerbaijan', 'azerbaijan', 'AZ', 'europe', pexels(27289324), 16),
  dest(26, 'Belgium', 'belgium', 'BE', 'europe', pexels(33624323), 17),
  dest(27, 'Bulgaria', 'bulgaria', 'BG', 'europe', pexels(16983460), 18),
  dest(28, 'Croatia', 'croatia', 'HR', 'europe', pexels(29175634), 19),
  dest(29, 'Cyprus', 'cyprus', 'CY', 'europe', pexels(34672073), 20),
  dest(100, 'Denmark', 'denmark', 'DK', 'europe', pexels(11064476), 21),
  dest(101, 'Estonia', 'estonia', 'EE', 'europe', pexels(35838020), 22),
  dest(102, 'Finland', 'finland', 'FI', 'europe', pexels(23227693), 23),
  dest(103, 'Georgia', 'georgia', 'GE', 'europe', pexels(34954527), 24),
  dest(104, 'Hungary', 'hungary', 'HU', 'europe', pexels(11653323), 25),
  dest(105, 'Iceland', 'iceland', 'IS', 'europe', pexels(29018986), 26),
  dest(106, 'Ireland', 'ireland', 'IE', 'europe', pexels(36826097), 27),
  dest(107, 'Latvia', 'latvia', 'LV', 'europe', pexels(20265417), 28),
  dest(108, 'Liechtenstein', 'liechtenstein', 'LI', 'europe', pexels(35412085), 29),
  dest(109, 'Lithuania', 'lithuania', 'LT', 'europe', pexels(20303298), 30),
  dest(110, 'Luxembourg', 'luxembourg', 'LU', 'europe', pexels(34161153), 31),
  dest(111, 'Malta', 'malta', 'MT', 'europe', pexels(29130433), 32),
  dest(112, 'Moldova', 'moldova', 'MD', 'europe', pexels(10299006), 33),
  dest(113, 'Montenegro', 'montenegro', 'ME', 'europe', pexels(27821458), 34),
  dest(114, 'North Macedonia', 'north-macedonia', 'MK', 'europe', pexels(31727773), 35),
  dest(115, 'Norway', 'norway', 'NO', 'europe', pexels(33548617), 36),
  dest(116, 'Romania', 'romania', 'RO', 'europe', pexels(12092584), 37),
  dest(117, 'San Marino', 'san-marino', 'SM', 'europe', pexels(21316205), 38),
  dest(118, 'Serbia', 'serbia', 'RS', 'europe', pexels(28385207), 39),
  dest(119, 'Slovakia', 'slovakia', 'SK', 'europe', pexels(31810185), 40),
  dest(120, 'Slovenia', 'slovenia', 'SI', 'europe', pexels(36551983), 41),
  dest(121, 'Sweden', 'sweden', 'SE', 'europe', pexels(36934342), 42),
  dest(122, 'Switzerland', 'switzerland', 'CH', 'europe', pexels(28732868), 43),
  dest(123, 'Ukraine', 'ukraine', 'UA', 'europe', pexels(11756413), 44),
  dest(124, 'Vatican City', 'vatican-city', 'VA', 'europe', pexels(18696486), 45),

  // ── Asia ────────────────────────────────────────────────────────
  dest(30, 'Japan', 'japan', 'JP', 'asia', pexels(30961538), 1),
  dest(31, 'South Korea', 'south-korea', 'KR', 'asia', pexels(2246790), 2),
  dest(32, 'Thailand', 'thailand', 'TH', 'asia', pexels(31609232), 3),
  dest(33, 'Indonesia', 'indonesia', 'ID', 'asia', pexels(28154007), 4),
  dest(34, 'Vietnam', 'vietnam', 'VN', 'asia', pexels(30667662), 5),
  dest(35, 'Malaysia', 'malaysia', 'MY', 'asia', pexels(32725124), 6),
  dest(36, 'Singapore', 'singapore', 'SG', 'asia', pexels(31949002), 7),
  dest(37, 'India', 'india', 'IN', 'asia', pexels(28749616), 8),
  dest(38, 'Philippines', 'philippines', 'PH', 'asia', pexels(11283650), 9),
  dest(39, 'China', 'china', 'CN', 'asia', pexels(37325723), 10),

  // ── North America ────────────────────────────────────────────────
  dest(50, 'United States', 'united-states', 'US', 'north-america', pexels(29028365), 1),
  dest(51, 'Canada', 'canada', 'CA', 'north-america', pexels(35303512), 2),
  dest(52, 'Mexico', 'mexico', 'MX', 'north-america', pexels(11150876), 3),

  // ── South America ──────────────────────────────────────────────
  dest(53, 'Brazil', 'brazil', 'BR', 'south-america', pexels(27914780), 1),
  dest(55, 'Argentina', 'argentina', 'AR', 'south-america', pexels(29714312), 3),

  // ── Middle East ─────────────────────────────────────────────────
  dest(61, 'Saudi Arabia', 'saudi-arabia', 'SA', 'middle-east', pexels(35332378), 2),
  dest(62, 'Qatar', 'qatar', 'QA', 'middle-east', pexels(31583097), 3),
  dest(63, 'Egypt', 'egypt', 'EG', 'middle-east', pexels(10124763), 4),

  // ── Oceania ─────────────────────────────────────────────────────
  dest(70, 'Australia', 'australia', 'AU', 'oceania', pexels(36983171), 1),
  dest(71, 'New Zealand', 'new-zealand', 'NZ', 'oceania', pexels(36620444), 2),

  // ── Africa ──────────────────────────────────────────────────────
  dest(81, 'Morocco', 'morocco', 'MA', 'africa', pexels(32013465), 2),
];
