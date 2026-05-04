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
