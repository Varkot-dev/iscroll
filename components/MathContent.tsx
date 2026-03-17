/**
 * MathContent
 *
 * Renders text with LaTeX math using KaTeX — fully offline, no CDN.
 * KaTeX JS + CSS are bundled inline so the WebView needs zero network access.
 *
 * Inline math:   $...$  or  \(...\)
 * Display math:  $$...$$  or  \[...\]  or  {\displaystyle ...}
 */

import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/colors';
import { KATEX_JS, KATEX_CSS } from '@/constants/katexBundle';

type Props = {
  content: string;
  fontSize?: number;
  color?: string;
  lineHeight?: number;
};

function normalizeLatex(text: string): string {
  return text
    .replace(/\{\s*\\displaystyle\s*([\s\S]*?)\}/g, (_, m) => `$$${m.trim()}$$`)
    .replace(/\{\s*\\textstyle\s*([\s\S]*?)\}/g, (_, m) => `$${m.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m.trim()}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m.trim()}$`);
}

function hasMath(text: string): boolean {
  return /\$|\\\(|\\\[|\{\\displaystyle|\{\\textstyle/.test(text);
}

// Escape content so it's safe to embed in a JS template literal
// Do NOT escape $ — those are our math delimiters
function jsEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`');
}

function buildHtml(content: string, textColor: string, accentColor: string, fontSize: number, lineHeight: number): string {
  const escaped = jsEscape(content);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>${KATEX_CSS}
* { box-sizing: border-box; }
body {
  background: transparent;
  color: ${textColor};
  font-size: ${fontSize}px;
  line-height: ${lineHeight / fontSize};
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0; padding: 0;
  word-wrap: break-word;
}
.katex { color: ${accentColor}; font-size: 1em; }
.katex-display { color: ${accentColor}; margin: 8px 0; overflow-x: auto; }
</style>
</head>
<body>
<div id="content"></div>
<script>${KATEX_JS}</script>
<script>
(function() {
  var raw = \`${escaped}\`;
  var el = document.getElementById('content');

  // Split on $$ (display math) then $ (inline math)
  var parts = raw.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$)/g);
  var html = parts.map(function(part) {
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      try {
        return katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
      } catch(e) { return part; }
    } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      try {
        return katex.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: false });
      } catch(e) { return part; }
    }
    return part.replace(/\n/g, '<br>');
  }).join('');

  el.innerHTML = html;

  // Tell React Native the rendered height
  setTimeout(function() {
    window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
  }, 50);
})();
</script>
</body>
</html>`;
}

export function MathContent({ content, fontSize = 16, color, lineHeight = 26 }: Props) {
  const textColor = color || Colors.textSecondary;
  const [height, setHeight] = useState(lineHeight * 5);

  if (!hasMath(content)) {
    return (
      <Text style={[styles.text, { fontSize, color: textColor, lineHeight }]}>
        {content}
      </Text>
    );
  }

  const normalized = normalizeLatex(content);
  const html = buildHtml(normalized, textColor, Colors.accent, fontSize, lineHeight);

  return (
    <View style={{ height }}>
      <WebView
        source={{ html }}
        scrollEnabled={false}
        style={styles.webView}
        onMessage={(e) => {
          const h = Number(e.nativeEvent.data);
          if (h > 0) setHeight(h);
        }}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
  },
  webView: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});
