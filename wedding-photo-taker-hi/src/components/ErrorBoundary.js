import React, { Component } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline, Home, Refresh } from '@mui/icons-material';
import { logError } from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service
    logError('React Error Boundary caught an error', { 
      error: error.toString(),
      component: this.props.componentName || 'Unknown',
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Box 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: this.props.fullPage ? '100vh' : 'auto'
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 4 }, 
              maxWidth: 500, 
              width: '100%',
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'error.200'
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2
              }} 
            />
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'error.main',
                fontWeight: 600,
                mb: 2
              }}
            >
              Něco se pokazilo
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: 'text.secondary',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              {this.props.message || "Je nám líto, ale došlo k chybě při načítání této sekce."}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {this.props.showReset && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={this.handleReset}
                  startIcon={<Refresh />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Zkusit znovu
                </Button>
              )}
              
              <Button 
                variant="outlined"
                onClick={() => window.location.href = '/'}
                startIcon={<Home />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                Přejít domů
              </Button>
            </Box>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 4, 
                  textAlign: 'left',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Podrobnosti chyby (viditelné pouze ve vývoji):
                </Typography>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Box>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;