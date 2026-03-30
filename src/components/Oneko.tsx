"use client";

import { useEffect } from "react";

/**
 * Oneko — the cute pixel cat that follows your cursor around the page.
 * Loads oneko.js from /public/oneko.js
 */
export default function Oneko() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/oneko.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      const neko = document.getElementById("oneko");
      if (neko) neko.remove();
    };
  }, []);

  return null;
}
