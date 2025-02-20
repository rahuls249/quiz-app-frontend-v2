'use client';
// React
import React, { useState } from 'react';

// Material-UI Components
import { handleLogout, selectUserDetails } from '@/store/globalSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { compose } from '@reduxjs/toolkit';
import { fold, fromNullable, getOrElse, map } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

const settings = ['Profile', 'Logout'];

/**
 * SettingMenu Component
 *
 * This component renders a menu for user settings. It includes an IconButton with an Avatar representing
 * the user. Clicking on the IconButton opens a Menu with various setting options. The component also
 * provides handlers for opening and closing the menu, as well as for handling specific settings.
 *
 * @returns {JSX.Element} The rendered SettingMenu component.
 */
function SettingMenu() {
  const dispatch = useAppDispatch();
  const userFullName =
    useAppSelector(selectUserDetails)?.name ?? 'Unknown User';
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  /**
   * handleOpenUserMenu Function
   *
   * Handles the opening of a user menu by setting the anchor element.
   *
   * @param {React.MouseEvent<HTMLElement>} event - The mouse event that triggered the opening of the menu.
   */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  /**
   * handleCloseUserMenu Function
   *
   * Handles the closing of a user menu by resetting the anchor element.
   */
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Handles settings based on the provided setting key.
   *
   * @param {string} settingKey - The key representing the setting to be handled.
   */
  const settingsHandler = (settingKey: string) => {
    //A map containing functions for handling specific settings.
    const settingsHandlerMap: Record<string, () => void> = {
      Logout: handleLogoutHelper,
    };
    pipe(
      fromNullable(settingsHandlerMap[settingKey]),
      fold(
        () => {
          handleCloseUserMenu();
        },
        (selectedFunction) => {
          selectedFunction();
          handleCloseUserMenu();
        }
      )
    );

    // Helper functions
    function handleLogoutHelper() {
      compose(dispatch, handleLogout)();
    }
  };
  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar {...stringAvatar(userFullName)} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((setting) => (
          <MenuItem
            key={setting}
            onClick={() => settingsHandler(setting)}
            disabled={setting === 'Profile'}
          >
            <Typography textAlign="center">{setting}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default SettingMenu;

// Helper functions
/**
 * stringToColor Function
 *
 * Generates a color code based on the input string.
 *
 * @param {string} string - The input string.
 * @returns {string} The generated color code in hexadecimal format.
 */
function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

/**
 * stringAvatar Function
 *
 * Generates an avatar configuration object based on a name string.
 *
 * @param {string} name - The name string.
 * @returns {Object} An object with properties for styling the avatar.
 *   @property {Object} sx - The style object with a background color based on the name.
 *   @property {string} children - The initials of the first and last names.
 */
function stringAvatar(name: string) {
  const [firstName = ' ', lastName = ' '] = name.split(' ');
  return pipe(
    firstName,
    fromNullable,
    map((first) => first?.toUpperCase()),
    (first) =>
      pipe(
        lastName,
        fromNullable,
        map((last) => last?.toUpperCase()),

        map((last) => ({
          sx: {
            bgcolor: stringToColor(name),
          },
          children: `${getOrElse(() => '')(first)[0]}${last[0]}`,
        }))
      ),
    getOrElse(() => ({
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `UU`,
    }))
  );
}
