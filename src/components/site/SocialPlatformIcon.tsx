export function SocialPlatformIcon({
  platform,
  className = "social-platform-icon",
}: {
  platform: string;
  className?: string;
}) {
  const key = platform.trim().toLowerCase();
  const common = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    className,
  };

  switch (key) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2Z" />
          <path d="M17.5 2.5h-11A4 4 0 0 0 2.5 6.5v11a4 4 0 0 0 4 4h11a4 4 0 0 0 4-4v-11a4 4 0 0 0-4-4Zm2.3 15a2.3 2.3 0 0 1-2.3 2.3h-11A2.3 2.3 0 0 1 4.2 17.5v-11A2.3 2.3 0 0 1 6.5 4.2h11A2.3 2.3 0 0 1 19.8 6.5v11Z" />
          <circle cx="17.2" cy="6.8" r="1.15" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8.3v3.2h2.8V22h3.4Z" />
        </svg>
      );
    case "x":
    case "twitter":
      return (
        <svg {...common}>
          <path d="M18.9 3H21l-6.5 7.4L22 21h-5.4l-4.2-5.5L7.5 21H3.4l6.9-7.9L2 3h5.5l3.8 5.1L18.9 3Zm-1.9 16.2h1.5L7.1 4.7H5.5l11.5 14.5Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M6.3 9.2H3.4V20.5h2.9V9.2ZM4.85 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20.6 12.4c0-2.7-1.5-4-3.5-4-1.2 0-2.1.5-2.5 1.2h-.1V9.2h-2.8c0 .7 0 11.3 0 11.3h2.9v-6.3c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.6v6.1h2.9v-6.3Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M19.2 8.3a5.6 5.6 0 0 1-3.4-1.1v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 2 2.7V2.5h2.7c.2 1.6 1.2 3 2.6 3.7.5.3.9.4 1.4.5v1.6h-.6Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2L10 15.2Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M10.6 13.4a3.6 3.6 0 0 1 0-5.1l1.8-1.8a3.6 3.6 0 1 1 5.1 5.1l-.9.9a.9.9 0 0 1-1.3-1.3l.9-.9a1.8 1.8 0 1 0-2.5-2.5l-1.8 1.8a1.8 1.8 0 0 0 0 2.5.9.9 0 1 1-1.3 1.3Zm2.8-2.8a.9.9 0 0 1 1.3 0 3.6 3.6 0 0 1 0 5.1l-1.8 1.8a3.6 3.6 0 1 1-5.1-5.1l.9-.9a.9.9 0 1 1 1.3 1.3l-.9.9a1.8 1.8 0 1 0 2.5 2.5l1.8-1.8a1.8 1.8 0 0 0 0-2.5.9.9 0 0 1 0-1.3Z" />
        </svg>
      );
  }
}
