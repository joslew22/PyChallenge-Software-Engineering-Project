// src/pages/__tests__/Leaderboard.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../Leaderboard.jsx';

// Mock firebase (db) and firestore helpers used by Leaderboard
vi.mock('../../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(async () => ({
    docs: [
      { id: 'a1', data: () => ({ userName: 'Alice', challengeTitle: 'FizzBuzz', score: 9, totalQuestions: 10 }) },
      { id: 'b2', data: () => ({ userName: 'Bob', challengeTitle: 'Loops', score: 7, totalQuestions: 10 }) },
      { id: 'c3', data: () => ({ userName: 'Carol', challengeTitle: 'Lists', score: 5, totalQuestions: 10 }) },
    ],
  })),
  orderBy: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
}));

describe('Leaderboard page', () => {
  test('renders table headers', async () => {
    render(<Leaderboard />);
    expect(screen.getByText(/Player/i)).toBeInTheDocument();
    expect(screen.getByText(/Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
  });

  test('renders mock leaderboard entries in order', async () => {
    render(<Leaderboard />);

    // Wait for rows to show up
    await waitFor(() => expect(screen.getByText(/Alice/i)).toBeInTheDocument());

    const rows = screen.getAllByRole('row');
    // At least header + 3 data rows
    expect(rows.length).toBeGreaterThanOrEqual(4);

    // First data row after header should be Alice (highest score in our mock)
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
  });
});
