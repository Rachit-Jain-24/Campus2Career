import posthog from 'posthog-js';

export function initPostHog() {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (ph) => {
        if (import.meta.env.DEV) ph.debug(false);
      }
    });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

export function resetPostHog() {
  if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.reset();
  }
}
