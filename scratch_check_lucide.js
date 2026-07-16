import * as lucide from 'lucide-react';

const landingIcons = [
  'ArrowRight', 'Sparkles', 'Zap', 'Shield', 'Brain', 'Users', 'BarChart3',
  'Clock', 'ChevronDown', 'Mail', 'Star', 'TrendingUp', 'Activity', 'Eye',
  'Car', 'Trophy', 'AlertTriangle', 'CloudSun', 'MessageSquare', 'Cpu',
  'Layers', 'Globe', 'Lock', 'Gauge', 'Wifi', 'MapPin', 'PlayCircle'
];

const loginIcons = [
  'Zap', 'ArrowRight', 'Eye', 'EyeOff', 'Mail', 'Lock'
];

const registerIcons = [
  'Zap', 'ArrowRight', 'Eye', 'EyeOff', 'Mail', 'Lock', 'User', 'Building2', 'Check'
];

const dashboardIcons = [
  'Zap', 'LayoutDashboard', 'Users', 'Car', 'Trophy', 'AlertTriangle', 'BarChart3',
  'Settings', 'Bell', 'Search', 'Sparkles', 'ChevronDown', 'Menu', 'X', 'LogOut',
  'TrendingUp', 'TrendingDown', 'Activity', 'Eye', 'CloudSun', 'Clock', 'Shield',
  'Ticket', 'ArrowUpRight', 'ArrowDownRight', 'MessageSquare', 'MapPin', 'Cpu',
  'Megaphone', 'ChevronRight', 'RefreshCw', 'Sun', 'Moon', 'Droplets', 'Wind',
  'CalendarDays', 'CircleDot', 'Flame', 'Waves', 'HeartPulse', 'Siren', 'Radio',
  'PanelLeftClose', 'PanelLeft'
];

const allIcons = Array.from(new Set([...landingIcons, ...loginIcons, ...registerIcons, ...dashboardIcons]));

const missing = allIcons.filter(icon => !(icon in lucide));
console.log('Missing icons:', missing);
