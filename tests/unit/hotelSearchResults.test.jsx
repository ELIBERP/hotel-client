// tests/unit/hotelSearchResults.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HotelSearchResults from '../../src/pages/HotelSearchResults.jsx';

// --- mocks to avoid real network + keep unit-level determinism ---

// 1) mock destinations (ids must match what we put in the URL below)
jest.mock('../../src/assets/destinations.json', () => ([
  { uid: 'dest1', term: 'singapore' },
  { uid: 'dest2', term: 'bangkok' },
]));

// 2) mock star rating (keep dom simple)
jest.mock('../../src/components/StarRating.jsx', () => ({
  __esModule: true,
  default: ({ rating }) => <div data-testid="star-rating">{rating}</div>,
}));

// 3) mock amenities map used for labels
jest.mock('../../src/constants/amenities', () => ({
  AMENITY_MAP: {
    wifi: { icon: 'wifi', label: 'WiFi' },
    pool: { icon: 'pool', label: 'Pool' },
    gym:  { icon: 'exercise', label: 'Gym'  },
  },
}));

// 4) mock ApiService with controllable fns
import ApiService from '../../src/services/api';
jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    getHotels: jest.fn(),
    getHotelsPrice: jest.fn(),
  }
}));

// ---------- test helpers ----------

const DEFAULT_URL =
  '/results?destination_id=dest1&checkin=2025-09-01&checkout=2025-09-04&guests=2';
// 3 nights span → 09-01 to 09-04

const HOTELS = [
  {
    id: 'H1',
    name: 'orchard inn',
    address: '1 orchard rd',
    rating: 3.1,
    amenities: { wifi: true, pool: true },
    image_details: { prefix: 'https://img/', suffix: '.jpg' },
    hires_image_index: '3',
  },
  {
    id: 'H2',
    name: 'sunset resort',
    address: '2 beach ave',
    rating: 5.0,
    amenities: { wifi: true, gym: true },
    image_details: { prefix: 'https://img/', suffix: '.jpg' },
    hires_image_index: '0,7',
  },
  {
    id: 'H3',
    name: 'bay hotel',
    address: '3 bayfront',
    rating: 2.9,
    amenities: { pool: true },
    // no image_details → default dummy url inside component
  },
];

function setHotelsResolve(list = HOTELS) {
  ApiService.getHotels.mockResolvedValueOnce(list);
}
function setPricesResolve(prices) {
  ApiService.getHotelsPrice.mockResolvedValueOnce({ hotels: prices, completed: true });
}

const renderComponent = (url = DEFAULT_URL) => {
  // push URL so useLocation/searchParams work
  window.history.pushState({}, 'Test', url);
  return render(
    <BrowserRouter>
      <HotelSearchResults />
    </BrowserRouter>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  // default: hotels + prices both resolve quickly
  setHotelsResolve();
  setPricesResolve([
    { id: 'H1', price: 300, searchRank: 10 }, // → $100/night
    { id: 'H2', price: 240, searchRank:  5 }, // → $80/night
    { id: 'H3', price: 600, searchRank: 20 }, // → $200/night
  ]);
});

// =================== TESTS (14 unit items) ===================

describe('HotelSearchResults — unit tests', () => {
  test('1) Per Night Calculation', async () => {
    renderComponent();
    // wait for any card to appear
    await screen.findByRole('link', { name: /orchard inn/i });
    // $100/night and total for 3 nights (scoped to Orchard Inn card)
    const orchardCard = screen.getByRole('link', { name: /orchard inn/i });
    const nightMatches = within(orchardCard).getAllByText((_, node) =>
    !!node && /\$[\s\n]*100[\s\n]*\/night/i.test(node.textContent || '')
    );
    expect(nightMatches.length).toBeGreaterThan(0);
    expect(within(orchardCard).getByText(/Total \$300 for 3 nights/i)).toBeInTheDocument();
  });

  test('2) Price range filter', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    const min = screen.getByPlaceholderText(/min/i);
    const max = screen.getByPlaceholderText(/max/i);
    fireEvent.change(min, { target: { value: '100' } });
    fireEvent.change(max, { target: { value: '200' } });

    // in-range per-night: H1=100, H3=200. H2=80 filtered out
    expect(screen.getByRole('link', { name: /orchard inn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bay hotel/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sunset resort/i })).not.toBeInTheDocument();
  });

  test('3) Ignore loading prices in filter', async () => {
    // make H2 "loading" by omitting it from prices
    ApiService.getHotels.mockReset();
    ApiService.getHotelsPrice.mockReset();
    setHotelsResolve(HOTELS);
    setPricesResolve([
      { id: 'H1', price: 300, searchRank: 10 },
      { id: 'H3', price: 600, searchRank: 20 },
    ]);

    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    const min = screen.getByPlaceholderText(/min/i);
    const max = screen.getByPlaceholderText(/max/i);
    fireEvent.change(min, { target: { value: '100' } });
    fireEvent.change(max, { target: { value: '150' } });

    // H2 stays visible (loading price shouldn't be filtered)
    expect(screen.getByRole('link', { name: /sunset resort/i })).toBeInTheDocument();
  });

  test('4) Star bucket multi select', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    // select 3★ + 5★
    fireEvent.click(screen.getByLabelText(/3 stars/i));
    fireEvent.click(screen.getByLabelText(/5 stars/i));

    expect(screen.getByRole('link', { name: /orchard inn/i })).toBeInTheDocument();   // 3.1 → 3★
    expect(screen.getByRole('link', { name: /sunset resort/i })).toBeInTheDocument(); // 5.0 → 5★
    expect(screen.queryByRole('link', { name: /bay hotel/i })).not.toBeInTheDocument(); // 2.9 filtered
  });

  test('5) Clear star filters resets list', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    fireEvent.click(screen.getByLabelText(/3 stars/i));
    fireEvent.click(screen.getByLabelText(/5 stars/i));
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));

    // all 3 visible again
    expect(screen.getByRole('link', { name: /orchard inn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sunset resort/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bay hotel/i })).toBeInTheDocument();
  });

  test('6) amenity AND-filtering', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    // require WiFi + Pool (AND)
    const wifiCheckbox = screen.getAllByRole('checkbox', { name: /wifi/i })[0];
    const poolCheckbox = screen.getAllByRole('checkbox', { name: /pool/i })[0];
    fireEvent.click(wifiCheckbox);
    fireEvent.click(poolCheckbox);

    // only H1 has both
    expect(screen.getByRole('link', { name: /orchard inn/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sunset resort/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /bay hotel/i })).not.toBeInTheDocument();
  });

  test('7) clear amenities reset', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    const wifiCheckbox = screen.getAllByRole('checkbox', { name: /wifi/i })[0];
    fireEvent.click(wifiCheckbox);
    fireEvent.click(screen.getByRole('button', { name: /clear amenities/i }));

    // back to full list
    expect(screen.getByRole('link', { name: /orchard inn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sunset resort/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bay hotel/i })).toBeInTheDocument();
  });

  test('8) default relevance order (searchRank desc)', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    // expected order by searchRank desc: H3(20), H1(10), H2(5)
    const links = screen.getAllByRole('link').filter(a =>
      /orchard inn|sunset resort|bay hotel/i.test(a.textContent || '')
    );
    const names = links.map(a => (a.textContent || '').toLowerCase());
    expect(names[0]).toMatch(/bay hotel/);
    expect(names[1]).toMatch(/orchard inn/);
    expect(names[2]).toMatch(/sunset resort/);
  });

  test('9) price sort descending (only priced, high→low)', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'desc' } });
    await waitFor(() => {
      const links = screen.getAllByRole('link').filter(a =>
        /orchard inn|sunset resort|bay hotel/i.test(a.textContent || '')
      );
      const names = links.map(a => (a.textContent || '').toLowerCase());
      expect(names[0]).toMatch(/bay hotel/);   // 600
      expect(names[1]).toMatch(/orchard inn/); // 300
      expect(names[2]).toMatch(/sunset resort/); // 240
    });
  });

  test('10) image url builder', async () => {
    renderComponent();
    const img1 = await screen.findByAltText(/orchard inn/i);
    expect(img1).toHaveAttribute('src', 'https://img/3.jpg');

    const img2 = screen.getByAltText(/sunset resort/i);
    expect(img2).toHaveAttribute('src', 'https://img/0.jpg'); // first index from "0,7"
  });

  test('11) image onError fallback', async () => {
    renderComponent();
    const img = await screen.findByAltText(/orchard inn/i);
    // trigger onError -> component sets src to /hotel.svg
    fireEvent.error(img);
    expect(img.getAttribute('src')).toMatch(/\/hotel\.svg$/i);
  });

  test('12) price text fallback', async () => {
    // make H1 & H2 absent in prices so they show "Price unavailable"
    ApiService.getHotels.mockReset();
    ApiService.getHotelsPrice.mockReset();
    setHotelsResolve(HOTELS);
    setPricesResolve([{ id: 'H3', price: 600, searchRank: 20 }]);

    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    const sunsetCard = screen.getByRole('link', { name: /sunset resort/i });
    expect(within(sunsetCard).getByText(/loading price/i)).toBeInTheDocument();
  });

  test('13) card skeleton while polling (loading state)', async () => {
    // keep both calls pending so loading skeleton shows
    ApiService.getHotels.mockImplementation(() => new Promise(() => {}));
    ApiService.getHotelsPrice.mockImplementation(() => new Promise(() => {}));

    const { container } = renderComponent();
    // give react a tick
    await waitFor(() => {
      // skeleton blocks use 'animate-pulse' class; count > 0
      const pulses = container.querySelectorAll('.animate-pulse');
      expect(pulses.length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/no hotels found/i)).not.toBeInTheDocument();
  });

  test('14) price sort ascending (only priced, low→high)', async () => {
    renderComponent();
    await screen.findByRole('link', { name: /orchard inn/i });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'asc' } });
    await waitFor(() => {
      const links = screen.getAllByRole('link').filter(a =>
        /orchard inn|sunset resort|bay hotel/i.test(a.textContent || '')
      );
      const names = links.map(a => (a.textContent || '').toLowerCase());
      expect(names[0]).toMatch(/sunset resort/);  // 240
      expect(names[1]).toMatch(/orchard inn/);    // 300
   expect(names[2]).toMatch(/bay hotel/);      // 600
 });
  });
});
