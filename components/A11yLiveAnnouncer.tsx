'use client';

import React from 'react';

interface A11yLiveAnnouncerProps {
  message: string;
  assertive?: boolean;
}

export function A11yLiveAnnouncer({ message, assertive = false }: A11yLiveAnnouncerProps) {
  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
