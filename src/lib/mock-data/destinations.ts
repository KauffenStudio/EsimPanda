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
  dest(10, 'France', 'france', 'FR', 'europe', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=450&fit=crop', 1),
  dest(11, 'Spain', 'spain', 'ES', 'europe', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&h=450&fit=crop', 2),
  dest(12, 'Italy', 'italy', 'IT', 'europe', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=450&fit=crop', 3),
  dest(13, 'Germany', 'germany', 'DE', 'europe', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=450&fit=crop', 4),
  dest(14, 'Portugal', 'portugal', 'PT', 'europe', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=450&fit=crop', 5),
  dest(15, 'Netherlands', 'netherlands', 'NL', 'europe', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=450&fit=crop', 6),
  dest(16, 'United Kingdom', 'united-kingdom', 'GB', 'europe', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=450&fit=crop', 7),
  dest(17, 'Greece', 'greece', 'GR', 'europe', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&h=450&fit=crop', 8),
  dest(18, 'Turkey', 'turkey', 'TR', 'europe', 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&h=450&fit=crop', 9),
  dest(19, 'Poland', 'poland', 'PL', 'europe', 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=600&h=450&fit=crop', 10),
  dest(20, 'Czech Republic', 'czech-republic', 'CZ', 'europe', 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=450&fit=crop', 11),
  dest(21, 'Austria', 'austria', 'AT', 'europe', 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&h=450&fit=crop', 12),
  dest(22, 'Albania', 'albania', 'AL', 'europe', 'https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=600&h=450&fit=crop', 13),
  dest(23, 'Andorra', 'andorra', 'AD', 'europe', 'https://images.unsplash.com/photo-1502810190503-8303352d0dd1?w=600&h=450&fit=crop', 14),
  dest(24, 'Armenia', 'armenia', 'AM', 'europe', 'https://images.unsplash.com/photo-1599054735388-bcb07bdd3574?w=600&h=450&fit=crop', 15),
  dest(25, 'Azerbaijan', 'azerbaijan', 'AZ', 'europe', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=450&fit=crop', 16),
  dest(26, 'Belgium', 'belgium', 'BE', 'europe', 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&h=450&fit=crop', 17),
  dest(27, 'Bulgaria', 'bulgaria', 'BG', 'europe', 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&h=450&fit=crop', 18),
  dest(28, 'Croatia', 'croatia', 'HR', 'europe', 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&h=450&fit=crop', 19),
  dest(29, 'Cyprus', 'cyprus', 'CY', 'europe', 'https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=600&h=450&fit=crop', 20),
  dest(100, 'Denmark', 'denmark', 'DK', 'europe', 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&h=450&fit=crop', 21),
  dest(101, 'Estonia', 'estonia', 'EE', 'europe', 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=600&h=450&fit=crop', 22),
  dest(102, 'Finland', 'finland', 'FI', 'europe', 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&h=450&fit=crop', 23),
  dest(103, 'Georgia', 'georgia', 'GE', 'europe', 'https://images.unsplash.com/photo-1581873372796-635b67ca2008?w=600&h=450&fit=crop', 24),
  dest(104, 'Hungary', 'hungary', 'HU', 'europe', 'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=600&h=450&fit=crop', 25),
  dest(105, 'Iceland', 'iceland', 'IS', 'europe', 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&h=450&fit=crop', 26),
  dest(106, 'Ireland', 'ireland', 'IE', 'europe', 'https://images.unsplash.com/photo-1568827999250-3f6afff96e66?w=600&h=450&fit=crop', 27),
  dest(107, 'Latvia', 'latvia', 'LV', 'europe', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&h=450&fit=crop', 28),
  dest(108, 'Liechtenstein', 'liechtenstein', 'LI', 'europe', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&h=450&fit=crop', 29),
  dest(109, 'Lithuania', 'lithuania', 'LT', 'europe', 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=600&h=450&fit=crop', 30),
  dest(110, 'Luxembourg', 'luxembourg', 'LU', 'europe', 'https://images.unsplash.com/photo-1620207418302-439b387441b0?w=600&h=450&fit=crop', 31),
  dest(111, 'Malta', 'malta', 'MT', 'europe', 'https://images.unsplash.com/photo-1583265627959-fb7042f5133b?w=600&h=450&fit=crop', 32),
  dest(112, 'Moldova', 'moldova', 'MD', 'europe', 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&h=450&fit=crop', 33),
  dest(113, 'Montenegro', 'montenegro', 'ME', 'europe', 'https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=600&h=450&fit=crop', 34),
  dest(114, 'North Macedonia', 'north-macedonia', 'MK', 'europe', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=450&fit=crop', 35),
  dest(115, 'Norway', 'norway', 'NO', 'europe', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=450&fit=crop', 36),
  dest(116, 'Romania', 'romania', 'RO', 'europe', 'https://images.unsplash.com/photo-1583265627959-fb7042f5133b?w=600&h=450&fit=crop', 37),
  dest(117, 'San Marino', 'san-marino', 'SM', 'europe', 'https://images.unsplash.com/photo-1612278675615-7b093b07772d?w=600&h=450&fit=crop', 38),
  dest(118, 'Serbia', 'serbia', 'RS', 'europe', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=450&fit=crop', 39),
  dest(119, 'Slovakia', 'slovakia', 'SK', 'europe', 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=600&h=450&fit=crop', 40),
  dest(120, 'Slovenia', 'slovenia', 'SI', 'europe', 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&h=450&fit=crop', 41),
  dest(121, 'Sweden', 'sweden', 'SE', 'europe', 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&h=450&fit=crop', 42),
  dest(122, 'Switzerland', 'switzerland', 'CH', 'europe', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=450&fit=crop', 43),
  dest(123, 'Ukraine', 'ukraine', 'UA', 'europe', 'https://images.unsplash.com/photo-1561489396-888724a1543d?w=600&h=450&fit=crop', 44),
  dest(124, 'Vatican City', 'vatican-city', 'VA', 'europe', 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600&h=450&fit=crop', 45),

  // ── Asia ────────────────────────────────────────────────────────
  dest(30, 'Japan', 'japan', 'JP', 'asia', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=450&fit=crop', 1),
  dest(31, 'South Korea', 'south-korea', 'KR', 'asia', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=450&fit=crop', 2),
  dest(32, 'Thailand', 'thailand', 'TH', 'asia', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=450&fit=crop', 3),
  dest(33, 'Indonesia', 'indonesia', 'ID', 'asia', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=450&fit=crop', 4),
  dest(34, 'Vietnam', 'vietnam', 'VN', 'asia', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=450&fit=crop', 5),
  dest(35, 'Malaysia', 'malaysia', 'MY', 'asia', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=450&fit=crop', 6),
  dest(36, 'Singapore', 'singapore', 'SG', 'asia', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=450&fit=crop', 7),
  dest(37, 'India', 'india', 'IN', 'asia', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=450&fit=crop', 8),
  dest(38, 'Philippines', 'philippines', 'PH', 'asia', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&h=450&fit=crop', 9),
  dest(39, 'China', 'china', 'CN', 'asia', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=450&fit=crop', 10),

  // ── North America ────────────────────────────────────────────────
  dest(50, 'United States', 'united-states', 'US', 'north-america', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=450&fit=crop', 1),
  dest(51, 'Canada', 'canada', 'CA', 'north-america', 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=450&fit=crop', 2),
  dest(52, 'Mexico', 'mexico', 'MX', 'north-america', 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=450&fit=crop', 3),

  // ── South America ──────────────────────────────────────────────
  dest(53, 'Brazil', 'brazil', 'BR', 'south-america', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=450&fit=crop', 1),
  dest(55, 'Argentina', 'argentina', 'AR', 'south-america', 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&h=450&fit=crop', 3),

  // ── Middle East ─────────────────────────────────────────────────
  dest(61, 'Saudi Arabia', 'saudi-arabia', 'SA', 'middle-east', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&h=450&fit=crop', 2),
  dest(62, 'Qatar', 'qatar', 'QA', 'middle-east', 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&h=450&fit=crop', 3),
  dest(63, 'Egypt', 'egypt', 'EG', 'middle-east', 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=450&fit=crop', 4),

  // ── Oceania ─────────────────────────────────────────────────────
  dest(70, 'Australia', 'australia', 'AU', 'oceania', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=450&fit=crop', 1),
  dest(71, 'New Zealand', 'new-zealand', 'NZ', 'oceania', 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&h=450&fit=crop', 2),

  // ── Africa ──────────────────────────────────────────────────────
  dest(81, 'Morocco', 'morocco', 'MA', 'africa', 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=450&fit=crop', 2),
];
