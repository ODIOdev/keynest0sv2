/** Official Google “G” mark (brand colors from Google Identity guidelines). */
export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** Official Apple logo mark (from Apple Human Interface / Sign in with Apple). */
export function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
      fill="currentColor"
    >
      <path d="M16.7 12.58c.02 2.35 2.06 3.13 2.08 3.14-.02.05-.325 1.12-1.07 2.22-.645.95-1.315 1.9-2.37 1.92-1.035.02-1.37-.62-2.555-.62-1.19 0-1.56.6-2.54.64-1.02.03-1.8-1.03-2.45-1.98-1.34-1.94-2.36-5.48-0.99-7.43.68-.97 1.9-1.58 3.22-1.6 1.005-.02 1.955.68 2.555.68.6 0 1.725-.84 2.91-.715.495.02 1.885.2 2.775 1.51-.07.045-1.655.97-1.64 2.89zM14.76 6.22c.545-.66.91-1.58.81-2.5-.785.03-1.735.525-2.3 1.185-.505.58-.95 1.51-.83 2.4.88.07 1.775-.45 2.32-1.085z" />
    </svg>
  );
}
