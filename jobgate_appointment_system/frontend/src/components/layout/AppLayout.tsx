import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  CalendarToday,
  Event,
  School,
  Logout,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  Public,
  Home,
  Group,
  BarChart,
  EditCalendar,
  AddCircle,
  Schedule,
  Info,
  Settings,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/uiStore';
import { ROUTES } from '../../constants';
import { useState } from 'react';

const DRAWER_WIDTH = 240;

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [globalOpen, setGlobalOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate(ROUTES.LOGIN);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleGlobal = () => {
    setGlobalOpen(!globalOpen);
  };

  /* ----------------------------------------------------------
   * Main sidebar items (role-filtered)
   * ---------------------------------------------------------- */
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: ROUTES.DASHBOARD,
      roles: ['admin', 'university_staff', 'talent'],
    },
    {
      text: 'Calendar',
      icon: <CalendarToday />,
      path: ROUTES.CALENDAR,
      roles: ['admin', 'university_staff', 'talent'],
    },
    {
      text: 'Appointments',
      icon: <Event />,
      path: ROUTES.APPOINTMENTS,
      roles: ['admin', 'university_staff', 'talent'],
    },
    {
      text: 'Universities',
      icon: <School />,
      path: ROUTES.UNIVERSITIES,
      roles: ['admin', 'university_staff'],
    },
    {
      text: 'Admin Panel',
      icon: <AdminPanelSettings />,
      path: ROUTES.ADMIN,
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.user_type || '')
  );

  /* ----------------------------------------------------------
   * Global navigation pages – EVERY authenticated page in App.tsx
   * ---------------------------------------------------------- */
  const globalPages = [
    { text: 'Dashboard', path: ROUTES.DASHBOARD, icon: <Dashboard /> },
    { text: 'Calendar', path: ROUTES.CALENDAR, icon: <CalendarToday /> },
    { text: 'Appointments', path: ROUTES.APPOINTMENTS, icon: <Event /> },
    { text: 'Appointment Details', path: '/appointments/:id', icon: <Info /> },
    { text: 'Book Appointment', path: '/appointments/book', icon: <AddCircle /> },
    { text: 'Universities', path: ROUTES.UNIVERSITIES, icon: <School /> },
    { text: 'Manage Agendas', path: '/universities/agendas', icon: <EditCalendar /> },
    { text: 'Create Agenda', path: '/universities/agendas/create', icon: <AddCircle /> },
    { text: 'Agenda Details', path: '/universities/agendas/:id', icon: <Info /> },
    { text: 'Manage Slots', path: '/universities/slots', icon: <Schedule /> },
    { text: 'Admin Dashboard', path: '/admin', icon: <Home /> },
    { text: 'User Management', path: '/admin/users', icon: <Group /> },
    { text: 'University Management', path: '/admin/universities', icon: <School /> },
    { text: 'System Statistics', path: '/admin/statistics', icon: <BarChart /> },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          JobGate
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Global Navigation collapsible section */}
      <List>
        <ListItemButton onClick={toggleGlobal}>
          <ListItemIcon>
            <Public />
          </ListItemIcon>
          <ListItemText primary="Global Navigation" />
          {globalOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={globalOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {globalPages.map((page) => (
              <ListItemButton
                key={page.path}
                sx={{ pl: 4 }}
                selected={
                  page.path.includes(':')
                    ? location.pathname.startsWith(page.path.split(':')[0])
                    : location.pathname === page.path
                }
                onClick={() => navigate(page.path)}
              >
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={page.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            JobGate Appointment System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(ROUTES.PROFILE);
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(ROUTES.PREFERENCES);
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Preferences
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: sidebarOpen ? DRAWER_WIDTH : 0 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};