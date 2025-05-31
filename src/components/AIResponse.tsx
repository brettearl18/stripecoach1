import React from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AIResponseProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  title?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const LoadingContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
});

export const AIResponse: React.FC<AIResponseProps> = ({
  content,
  isLoading,
  error,
  title,
}) => {
  if (isLoading) {
    return (
      <StyledCard>
        <CardContent>
          <LoadingContainer>
            <CircularProgress size={40} />
          </LoadingContainer>
        </CardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </StyledCard>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <StyledCard>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Typography variant="body1" component="div">
          {content}
        </Typography>
      </CardContent>
    </StyledCard>
  );
}; 