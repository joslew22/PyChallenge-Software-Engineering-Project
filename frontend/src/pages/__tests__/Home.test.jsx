// src/pages/__tests__/Home.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard.jsx';

// Mock AuthContext to provide a logged-in user
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { uid: 'u1' } }),
}));

// Mock firebase and firestore helpers used by Dashboard
vi.mock('../../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(async () => ({
    docs: [
      { id: 'c1', data: () => ({ title: 'First Challenge', questions: [], createdBy: 'u1' }) },
    ],
  })),
  orderBy: vi.fn(),
  query: vi.fn(),
}));

// Basic tests for the Dashboard (Home) page
describe('Dashboard (Home) page', () => {
  test('renders welcome text', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome to PyChallenge/i)).toBeInTheDocument();
  });

  test('renders at least one challenge card when data exists', async () => {
    render(<Dashboard />);

    // Wait for the mock getDocs effect to complete and the challenge title to appear
    await waitFor(() => expect(screen.getByText(/First Challenge/i)).toBeInTheDocument());

    // The Play button should appear for that challenge
    expect(screen.getAllByText(/Play/i).length).toBeGreaterThanOrEqual(1);
  });
});
