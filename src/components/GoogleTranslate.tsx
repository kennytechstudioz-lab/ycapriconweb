"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    _gtInitQueue?: string[];
  }
}

const GT_STYLES = `
  /* Hide Google branding & top bar */
  .goog-te-banner-frame, .skiptranslate > font, .goog-te-gadget > span { display: none !important; }
  body { top: 0 !important; }

  /* Compact button-like container */
  .goog-te-gadget { margin: 0 !important; padding: 0 !important; font-size: 0 !important; line-height: 1 !important; }
  .goog-te-gadget-simple {
    display: inline-flex !important;
    align-items: center !important;
    background: #e4c126 !important;
    border: none !important;
    border-radius: 4px !important;
    padding: 5px 10px !important;
    cursor: pointer !important;
    height: auto !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }
  .goog-te-gadget-simple:hover {
    background: #f1cf34 !important;
  }

  /* Hide Google logo icon */
  .goog-te-gadget-simple img { display: none !important; }

  /* Language text */
  .goog-te-gadget-simple .goog-te-menu-value {
    font-size: 11px !important;
    font-weight: 800 !important;
    color: #171a0f !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
  }
  .goog-te-gadget-simple .goog-te-menu-value span { color: #171a0f !important; font-size: 11px !important; }
  .goog-te-gadget-simple .goog-te-menu-value span:last-child { color: #171a0f !important; font-size: 10px !important; }

  /* Drop menu */
  .goog-te-menu-frame {
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
    border-radius: 6px !important;
    max-width: calc(100vw - 20px) !important;
    overflow-x: auto !important;
    left: 10px !important;
    right: auto !important;
  }

  @media (max-width: 768px) {
    .goog-te-menu-frame {
      left: 10px !important;
      right: auto !important;
      width: calc(100vw - 20px) !important;
    }
  }
`;

export default function GoogleTranslate({ elementId = "google_translate_element" }: { elementId?: string }) {
  useEffect(() => {
    // Inject compact styles once
    if (!document.getElementById("gt-styles")) {
      const style = document.createElement("style");
      style.id = "gt-styles";
      style.textContent = GT_STYLES;
      document.head.appendChild(style);
    }

    const initEl = (id: string) => {
      try {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          id
        );
      } catch (_) {}
    };

    if (window.google?.translate?.TranslateElement) {
      initEl(elementId);
      return;
    }

    if (!window._gtInitQueue) window._gtInitQueue = [];
    if (!window._gtInitQueue.includes(elementId)) {
      window._gtInitQueue.push(elementId);
    }

    if (document.getElementById("gt-script")) return;

    window.googleTranslateElementInit = () => {
      (window._gtInitQueue || []).forEach(initEl);
      window._gtInitQueue = [];
    };

    const script = document.createElement("script");
    script.id = "gt-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }, [elementId]);

  return <div className="overflow-x-auto max-w-full"><div id={elementId} /></div>;
}
