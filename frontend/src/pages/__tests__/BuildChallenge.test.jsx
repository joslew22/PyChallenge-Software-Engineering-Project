// src/pages/__tests__/BuildChallenge.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BuildChallenge from '../BuildChallenge.jsx';

// Mock AuthContext so the page thinks a user exists
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Test User' } }),
}));

// BuildChallenge uses firestore only on submit; we don't want to call it in tests.
vi.mock('../../firebase', () => ({ db: {} }));

describe('BuildChallenge page', () => {
  test('renders form fields for title, description and questions', () => {
    render(<BuildChallenge />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();

    // There's at least one prompt input rendered for questions
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
  });

  test('typing in title input updates state', async () => {
    render(<BuildChallenge />);
    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/Title/i).querySelector('input') || screen.getByLabelText(/Title/i);

    // Type into the title input
    await user.type(titleInput, 'My Test Challenge');
    expect(titleInput).toHaveValue('My Test Challenge');
  });
});
