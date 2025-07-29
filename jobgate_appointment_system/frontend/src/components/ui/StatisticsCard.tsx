import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Info,
} from '@mui/icons-material';

interface StatisticsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  onClick?: () => void;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  progress,
  actions,
  onClick,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.min((progress.value / progress.max) * 100, 100);
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {icon && (
              <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
                {icon}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {actions && actions.length > 0 && (
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Main Value */}
        <Typography variant="h3" component="div" color={`${color}.main`} gutterBottom>
          {formatValue(value)}
        </Typography>

        {/* Trend */}
        {trend && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {trend.isPositive !== false ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend.isPositive !== false ? 'success.main' : 'error.main'}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}

        {/* Progress */}
        {progress && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {progress.label || 'Progress'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.value} / {progress.max}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgressPercentage()}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {getProgressPercentage().toFixed(1)}% complete
            </Typography>
          </Box>
        )}

        {/* Additional Info */}
        {!trend && !progress && subtitle && (
          <Box display="flex" alignItems="center" gap={1}>
            <Info fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Actions Menu */}
      {actions && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {actions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                action.onClick();
                handleMenuClose();
              }}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Card>
  );
};

// Specialized variants
export const AppointmentStatsCard: React.FC<{
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  onClick?: () => void;
}> = ({ total, completed, pending, cancelled, onClick }) => (
  <StatisticsCard
    title="Appointments"
    value={total}
    subtitle={`${completed} completed, ${pending} pending, ${cancelled} cancelled`}
    color="primary"
    progress={{
      value: completed,
      max: total,
      label: 'Completion Rate',
    }}
    onClick={onClick}
  />
);

export const CapacityStatsCard: React.FC<{
  used: number;
  total: number;
  onClick?: () => void;
}> = ({ used, total, onClick }) => (
  <StatisticsCard
    title="Capacity"
    value={`${used}/${total}`}
    color="info"
    progress={{
      value: used,
      max: total,
      label: 'Utilization',
    }}
    onClick={onClick}
  />
);

export const TrendStatsCard: React.FC<{
  title: string;
  value: number;
  trend: number;
  period: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  onClick?: () => void;
}> = ({ title, value, trend, period, color = 'primary', onClick }) => (
  <StatisticsCard
    title={title}
    value={value}
    color={color}
    trend={{
      value: trend,
      label: period,
      isPositive: trend >= 0,
    }}
    onClick={onClick}
  />
);

