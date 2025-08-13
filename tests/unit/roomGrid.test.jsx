// RoomGrid.test.jsx
import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
// Adjust this import path for your project (e.g., '../components/RoomGrid' or '@/components/RoomGrid')
import RoomGrid from '../../src/components/RoomGrid';

const makeRooms = () => ([
  {
    images: [{ high_resolution_url: 'https://img.test/high.jpg', url: 'https://img.test/low.jpg' }],
    roomDescription: 'Deluxe King',
    long_description: '<p>1 King Bed</p><p>409-sq-foot room with courtyard views</p><p>ignored</p>',
    roomAdditionalInfo: { breakfastInfo: 'hotel_detail_room_only' }, // => No breakfast
    free_cancellation: true, // => Free cancellation
    converted_price: 250,     // => 250 SGD
  },
  {
    images: [{ url: 'https://img.test/standard.jpg' }], // no high_resolution_url -> fallback to url
    // No roomDescription -> fallback title
    long_description: '<p>2 Twin Beds</p>', // only bed info, no size info
    roomAdditionalInfo: { breakfastInfo: 'breakfast_included' }, // => Breakfast included
    free_cancellation: false, // => No cancellation
    // No converted_price -> no 'SGD'
  },
  {
    images: [{ url: 'https://img.test/no-breakfast.jpg' }],
    roomDescription: 'Studio',
    long_description: '', // nothing to extract
    roomAdditionalInfo: {}, // breakfastInfo missing -> '—'
    free_cancellation: false,
    converted_price: 0, // falsy -> no 'SGD' (edge behavior)
  }
]);

describe('RoomGrid Unit', () => {
  test('shows loading state', () => {
    render(<RoomGrid rooms={[]} loading={true} onRoomClick={vi.fn()} />);
    expect(screen.getByText(/Loading room details/i)).toBeInTheDocument();
    expect(screen.queryByText(/No rooms available/i)).not.toBeInTheDocument();
  });

  test('shows empty state when no rooms and not loading', () => {
    render(<RoomGrid rooms={[]} loading={false} onRoomClick={vi.fn()} />);
    expect(screen.getByText(/No rooms available for selected filter/i)).toBeInTheDocument();
  });

  test('renders one card per room with correct titles (and placeholder fallback)', () => {
    const rooms = makeRooms().slice(0, 2);
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    // Two buttons => two cards
    const buttons = screen.getAllByRole('button', { name: /View Details/i });
    expect(buttons).toHaveLength(2);

    // Titles
    expect(screen.getByRole('heading', { name: 'Deluxe King' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Room Name Placeholder' })).toBeInTheDocument();
  });

  test('image source prefers high_resolution_url and falls back to url', () => {
    const rooms = makeRooms().slice(0, 2);
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    // Alt texts are "Room 0", "Room 1"
    const img0 = screen.getByAltText('Room 0');
    const img1 = screen.getByAltText('Room 1');

    expect(img0).toHaveAttribute('src', 'https://img.test/high.jpg');
    expect(img1).toHaveAttribute('src', 'https://img.test/standard.jpg');
  });

  test('extracts bed and size info from long_description', () => {
    const rooms = makeRooms().slice(0, 2);
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    // Card 0 (Deluxe King)
    const card0Heading = screen.getByRole('heading', { name: 'Deluxe King' });
    const card0 = card0Heading.closest('div'); // <div class="p-4"> wrapper
    expect(within(card0).getByText('1 King Bed')).toBeInTheDocument();
    expect(within(card0).getByText('409-sq-foot room with courtyard views')).toBeInTheDocument();

    // Card 1 (Placeholder title) has bed only, no size
    const card1Heading = screen.getByRole('heading', { name: 'Room Name Placeholder' });
    const card1 = card1Heading.closest('div');
    expect(within(card1).getByText('2 Twin Beds')).toBeInTheDocument();
    // No size text present
    expect(within(card1).queryByText(/sq-foot/i)).not.toBeInTheDocument();
  });

  test('maps breakfast text correctly across cases', () => {
    const rooms = makeRooms(); // 3 rooms: No breakfast, Breakfast included, —
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    // By order:
    const headings = screen.getAllByRole('heading');
    const [h0, h1, h2] = headings;

    const card0 = h0.closest('div');
    const card1 = h1.closest('div');
    const card2 = h2.closest('div');

    expect(within(card0).getByText('No breakfast')).toBeInTheDocument();
    expect(within(card1).getByText('Breakfast included')).toBeInTheDocument();
    expect(within(card2).getByText('—')).toBeInTheDocument();
  });

  test('shows correct cancellation text', () => {
    const rooms = makeRooms().slice(0, 2); // first true, second false
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    const [h0, h1] = screen.getAllByRole('heading');

    const card0 = h0.closest('div');
    const card1 = h1.closest('div');

    expect(within(card0).getByText('Free cancellation')).toBeInTheDocument();
    expect(within(card1).getByText('No cancellation')).toBeInTheDocument();
  });

  test('renders price with currency only when converted_price is truthy', () => {
    const rooms = makeRooms(); // includes a room with 250, one with undefined, one with 0
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={vi.fn()} />);

    // Card 0 => 250 SGD
    const card0 = screen.getByRole('heading', { name: 'Deluxe King' }).closest('div');
    expect(within(card0).getByText(/Price:/i)).toBeInTheDocument();
    expect(within(card0).getByText(/250 SGD/i)).toBeInTheDocument();

    // Card 1 => undefined price -> no 'SGD'
    const card1 = screen.getByRole('heading', { name: 'Room Name Placeholder' }).closest('div');
    expect(within(card1).getByText(/Price:/i)).toBeInTheDocument();
    expect(within(card1).queryByText(/SGD/i)).not.toBeInTheDocument();

    // Card 2 => 0 (falsy) -> no 'SGD' (edge behavior)
    const card2 = screen.getByRole('heading', { name: 'Studio' }).closest('div');
    expect(within(card2).getByText(/Price:/i)).toBeInTheDocument();
    // Depending on your preference you may assert '0' is present:
    expect(within(card2).getByText(/0\b/)).toBeInTheDocument();
    expect(within(card2).queryByText(/SGD/i)).not.toBeInTheDocument();
  });

  test('calls onRoomClick with the correct room when clicking "View Details"', () => {
    const rooms = makeRooms().slice(0, 2);
    const onRoomClick = vi.fn();
    render(<RoomGrid rooms={rooms} loading={false} onRoomClick={onRoomClick} />);

    const buttons = screen.getAllByRole('button', { name: /View Details/i });
    fireEvent.click(buttons[0]);

    expect(onRoomClick).toHaveBeenCalledTimes(1);
    expect(onRoomClick).toHaveBeenCalledWith(rooms[0]);
  });
});
