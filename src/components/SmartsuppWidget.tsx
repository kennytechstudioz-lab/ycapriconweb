"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function SmartsuppWidget() {
  useEffect(() => {
    // Show chat when mounted if smartsupp is initialized
    if (typeof window !== "undefined" && typeof (window as any).smartsupp === "function") {
      (window as any).smartsupp("chat:show");
    }

    return () => {
      // Hide chat when component unmounts (e.g. navigating to admin)
      if (typeof window !== "undefined" && typeof (window as any).smartsupp === "function") {
        (window as any).smartsupp("chat:hide");
      }
    };
  }, []);

  return (
    <>
      <Script id="smartsupp-init" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = '9f1fc8e65f15e9654ab65975bda1cd576e608b0c';
          window.smartsupp||(function(d) {
            var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
            s=d.getElementsByTagName('script')[0];c=d.createElement('script');
            c.type='text/javascript';c.charset='utf-8';c.async=true;
            c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
          })(document);
        `}
      </Script>
      <noscript>
        Powered by{" "}
        <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
          Smartsupp
        </a>
      </noscript>
    </>
  );
}
