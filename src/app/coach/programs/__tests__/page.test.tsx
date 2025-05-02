import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProgramsDashboard from '../page';
import { programTemplateService } from '@/lib/services/programTemplateService';
import { toast } from 'react-hot-toast';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the programTemplateService
jest.mock('@/lib/services/programTemplateService', () => ({
  programTemplateService: {
    listTemplates: jest.fn(),
    getStats: jest.fn()
  }
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('ProgramsDashboard', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue([]);
    (programTemplateService.getStats as jest.Mock).mockResolvedValue({
      totalTemplates: 0,
      activePrograms: 0,
      archivedPrograms: 0
    });
  });

  it('renders loading state initially', () => {
    render(<ProgramsDashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    const error = new Error('Failed to fetch templates');
    (programTemplateService.listTemplates as jest.Mock).mockRejectedValue(error);

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading programs/i)).toBeInTheDocument();
    });
  });

  it('displays program templates when loaded successfully', async () => {
    const mockTemplates = [
      { id: '1', name: 'Template 1', description: 'Description 1' },
      { id: '2', name: 'Template 2', description: 'Description 2' }
    ];

    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue(mockTemplates);

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
    });
  });

  it('navigates to create template page when create button is clicked', async () => {
    render(<ProgramsDashboard />);
    
    const createButton = screen.getByText(/create new template/i);
    fireEvent.click(createButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/coach/programs/templates/new');
  });

  it('handles error state and retry functionality', async () => {
    (programTemplateService.listTemplates as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load program statistics')).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(programTemplateService.listTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to correct routes when clicking cards', async () => {
    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue({
      templates: []
    });

    render(<ProgramsDashboard />);

    await waitFor(() => {
      const templateCard = screen.getByText('Program Templates');
      fireEvent.click(templateCard);
      expect(mockRouter.push).toHaveBeenCalledWith('/coach/programs/templates');
    });
  });

  it('handles navigation errors gracefully', async () => {
    mockRouter.push.mockRejectedValue(new Error('Navigation failed'));
    render(<ProgramsDashboard />);

    const createButton = screen.getByText(/create new template/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to navigate to the requested page');
    });
  });
}); 