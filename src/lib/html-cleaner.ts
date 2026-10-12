/**
 * Utility to strip unwanted UI buttons (like #rp, #st, replay, subtitles, player controls)
 * from user HTML so they never appear in exported videos or preview.
 */
export function cleanUnwantedButtons(html: string): string {
  if (!html) return '';

  const cleanStyleAndScript = `
<style id="htmlmotion-strip-controls">
  #rp, #st, button#rp, button#st,
  #replay, #restart, #subtitle, #subtitles,
  .controls, .player-controls, .video-controls, .control-bar, .controls-container,
  [data-control], [data-controls] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    height: 0 !important;
    width: 0 !important;
    position: absolute !important;
    left: -99999px !important;
    clip: rect(0, 0, 0, 0) !important;
  }
</style>
<script id="htmlmotion-strip-buttons">
  (function() {
    function removeControls() {
      // 1. Remove explicit IDs
      var rp = document.getElementById('rp');
      if (rp) rp.remove();
      var st = document.getElementById('st');
      if (st) st.remove();

      // 2. Remove by common IDs / attributes
      var unwanted = document.querySelectorAll('#rp, #st, button#rp, button#st, #replay, #restart, #subtitle, #subtitles, [data-control], [data-controls]');
      unwanted.forEach(function(el) { el.remove(); });

      // 3. Remove by text (e.g. 'আবার চালান', 'সাবটাইটেল অন/অফ', 'Replay')
      var allButtons = document.querySelectorAll('button, .btn, a.btn, [role="button"]');
      allButtons.forEach(function(btn) {
        var text = (btn.textContent || '').trim().toLowerCase();
        if (
          text.indexOf('আবার চালান') !== -1 ||
          text.indexOf('সাবটাইটেল') !== -1 ||
          text === 'replay' ||
          text === 'restart' ||
          text === 'subtitles' ||
          text === 'play / pause'
        ) {
          btn.remove();
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeControls);
    } else {
      removeControls();
    }
    window.addEventListener('load', removeControls);
    setInterval(removeControls, 100);
  })();
</script>
`;

  // Inject before </head> or </body> or append
  if (html.includes('</head>')) {
    return html.replace('</head>', `${cleanStyleAndScript}\n</head>`);
  } else if (html.includes('</body>')) {
    return html.replace('</body>', `${cleanStyleAndScript}\n</body>`);
  }
  return html + cleanStyleAndScript;
}
