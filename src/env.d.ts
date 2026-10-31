/// <reference path="../.astro/types.d.ts" />

interface Window {
  // Defined inline in BaseLayout — pushes a conversion event to the GTM dataLayer
  wtTrack?: (event: string, params?: Record<string, unknown>) => void;
}
