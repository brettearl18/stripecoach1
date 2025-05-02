import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import ProgramsLayout from '../layout';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

describe('ProgramsLayout', () => {
  const mockChildren = <div>Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation tabs', () => {
    (usePathname as jest.Mock).mockReturnValue('/coach/programs');
    render(<ProgramsLayout>{mockChildren}</ProgramsLayout>);

    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /active programs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /archived/i })).toBeInTheDocument();
  });

  it('highlights the active tab correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/coach/programs/templates');
    render(<ProgramsLayout>{mockChildren}</ProgramsLayout>);

    const templatesTab = screen.getByRole('link', { name: /templates/i });
    expect(templatesTab).toHaveClass('bg-gray-100');
  });

  it('renders children content', () => {
    (usePathname as jest.Mock).mockReturnValue('/coach/programs');
    render(<ProgramsLayout>{mockChildren}</ProgramsLayout>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct styling to inactive tabs', () => {
    (usePathname as jest.Mock).mockReturnValue('/coach/programs');
    render(<ProgramsLayout>{mockChildren}</ProgramsLayout>);

    const templatesTab = screen.getByRole('link', { name: /templates/i });
    expect(templatesTab).not.toHaveClass('bg-gray-100');
  });

  it('has proper ARIA attributes for accessibility', () => {
    (usePathname as jest.Mock).mockReturnValue('/coach/programs');
    render(<ProgramsLayout>{mockChildren}</ProgramsLayout>);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Programs navigation');
  });
}); 