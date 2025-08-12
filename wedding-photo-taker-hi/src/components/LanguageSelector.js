import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage } from './LanguageProvider';

const LanguageSelector = ({ variant = 'icon' }) => {
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    handleClose();
  };

  const availableLanguages = getAvailableLanguages();
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Change Language">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                backgroundColor: 'primary.50',
                color: 'primary.main'
              }
            }}
          >
            <Typography variant="body2" sx={{ mr: 0.5 }}>
              {currentLang?.flag}
            </Typography>
            <LanguageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {availableLanguages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              selected={language.code === currentLanguage}
            >
              <ListItemIcon>
                <Typography variant="body1">{language.flag}</Typography>
              </ListItemIcon>
              <ListItemText primary={language.name} />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box>
      <Tooltip title="Změnit jazyk / Change Language">
        <IconButton
          onClick={handleClick}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { 
              backgroundColor: 'primary.50',
              color: 'primary.main'
            }
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={language.code === currentLanguage}
          >
            <ListItemIcon>
              <Typography variant="h6">{language.flag}</Typography>
            </ListItemIcon>
            <ListItemText 
              primary={language.name}
              secondary={language.code === currentLanguage ? 'Current' : ''}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;