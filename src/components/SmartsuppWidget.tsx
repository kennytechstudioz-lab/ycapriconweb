"use client";

import Script from "next/script";

export default function SmartsuppWidget() {
  return (
    <>
      <Script id="smartsupp-init" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = '78363e116197fa86461f4f6e1ad061432a389221';
          window.smartsupp||(function(d) {
            var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
            s=d.getElementsByTagName('script')[0];c=d.createElement('script');
            c.type='text/javascript';c.charset='utf-8';c.async=true;
            c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
          })(document);
        `}
      </Script>
    </>
  );
}
