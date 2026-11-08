import confetti from 'canvas-confetti';

/**
 * Format an ISO date string to user-friendly morning football fixture time
 */
export function formatMatchTime(isoString) {
  if (!isoString) return 'Date TBD';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (err) {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "Tomorrow at 7:00 AM" or "Yesterday")
 */
export function formatRelativeMatchTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.round((date.setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));

  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(isoString));

  if (diffDays === 0) return `Today at ${timeString}`;
  if (diffDays === 1) return `Tomorrow at ${timeString}`;
  if (diffDays === -1) return `Yesterday at ${timeString}`;
  return formatMatchTime(isoString);
}

/**
 * Fire celebratory football confetti
 */
export function triggerMatchConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#eab308', '#ffffff']
    });
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Role badge styling
 */
export function getRoleBadgeClass(role) {
  switch (role) {
    case 'Forward':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Midfielder':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Center Back':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Goalkeeper':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Coach':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
