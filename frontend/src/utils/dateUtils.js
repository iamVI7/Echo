import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'd MMMM yyyy');
};

export const formatShortDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const timeFromNow = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const timeUntil = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: false });
};

export const isUnlocked = (deliveryDate) => {
  return isPast(new Date(deliveryDate));
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const categoryColors = {
  Career: 'bg-blue-50 text-blue-700 border-blue-200',
  Health: 'bg-green-50 text-green-700 border-green-200',
  Learning: 'bg-purple-50 text-purple-700 border-purple-200',
  Project: 'bg-orange-50 text-orange-700 border-orange-200',
  Personal: 'bg-pink-50 text-pink-700 border-pink-200',
  Memory: 'bg-amber-50 text-amber-700 border-amber-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200'
};

export const computeStatus = (echo) => {
  if (echo.status === 'opened') return 'opened';
  if (isUnlocked(echo.deliveryDate)) return 'unlocked';
  return 'locked';
};