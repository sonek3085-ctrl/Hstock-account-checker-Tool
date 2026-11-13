import React from 'react';
import { SocialPlatform } from '../types/status';

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="1.2" fill="currentColor" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.9.14V9.45a6.33 6.33 0 0 0-.9-.07 6.35 6.35 0 0 0-6.34 6.35 6.35 6.35 0 0 0 6.34 6.34 6.35 6.35 0 0 0 6.35-6.34V9.82a8.28 8.28 0 0 0 4.75 1.5V7.87a4.83 4.83 0 0 1-1-.49z" />
  </svg>
);

export const GmailIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.49l8.073-5.997C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
);

export const PlatformBadgeIcon: React.FC<{ platform: SocialPlatform; className?: string }> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  if (platform === 'gmail') {
    return (
      <span className="inline-flex items-center text-red-500 dark:text-red-400">
        <GmailIcon className={className} />
      </span>
    );
  }
  if (platform === 'instagram') {
    return (
      <span className="inline-flex items-center text-pink-600 dark:text-pink-400">
        <InstagramIcon className={className} />
      </span>
    );
  }
  if (platform === 'facebook') {
    return (
      <span className="inline-flex items-center text-blue-600 dark:text-blue-400">
        <FacebookIcon className={className} />
      </span>
    );
  }
  if (platform === 'tiktok') {
    return (
      <span className="inline-flex items-center text-cyan-600 dark:text-cyan-400">
        <TikTokIcon className={className} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-red-600 dark:text-red-400">
      <YouTubeIcon className={className} />
    </span>
  );
};
