/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Empêche le clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Contrôle les infos de referrer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les anciennes APIs navigateur non nécessaires
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS — force HTTPS (1 an, inclut sous-domaines)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts : self + Next.js inline (nonce requis pour strict mais simplifié ici)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles : self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images : self + Supabase storage + domaines autorisés
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.githubusercontent.com",
      // Connexions réseau (Supabase)
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
      // Fonts
      "font-src 'self'",
      // Frames interdits
      "frame-ancestors 'none'",
      // Formulaires uniquement vers self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
