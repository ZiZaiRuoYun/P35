// src/embed/exporters/htmlExporter.js
export function exportDocAsHtml(doc){
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // —— 迷你样式：脱离 Tailwind 也能保留外观（有/无面板两套） ——
  const css = `
  *{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto}
  .container{max-width:min(100vw - 2rem, 1600px);margin:0 auto;padding:16px}
  h1{font-size:22px;margin:8px 0 16px;font-weight:600}
  .sec{position:relative;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin:16px 0}
  .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}

  /* 有面板（半透明白底卡片） */
  .inner{position:relative;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.65);backdrop-filter:saturate(1.2) blur(6px);}
  .blk.text{padding:12px;border-radius:12px;border:1px solid #e5e7eb;background:rgba(255,255,255,.85);margin:6px 0}
  .blk.text p{margin:.5rem 0}
  .blk.text ul,.blk.text ol{padding-left:1.25rem}
  .blk.text blockquote{border-left:3px solid #e5e7eb;padding-left:.75rem;color:#6b7280;margin:.5rem 0}

  /* 无面板（纯内容，无背景，仅保留间距） */
  .content{position:relative}
  .blk-naked{margin:6px 0}
  .blk-naked p{margin:.5rem 0}
  .blk-naked ul,.blk-naked ol{padding-left:1.25rem}
  .blk-naked blockquote{border-left:3px solid #e5e7eb;padding-left:.75rem;color:#6b7280;margin:.5rem 0}
  `;

  const sectionsHtml = (doc.sections || []).map((s) => {
    // 背景层
    let bg = '';
    if (s?.background?.kind === 'color') {
      const color = s.background.value || '#fff';
      bg = `<div style="position:absolute;inset:0;background:${esc(color)}"></div>`;
    } else if (s?.background?.kind === 'image') {
      const url = s.background.url || '';
      bg = `<img class="bg" src="${esc(url)}" alt=""/>`;
    } else if (s?.background?.kind === 'video') {
      const url = s.background.url || '';
      const loop = s.background.loop ? 'loop' : '';
      const muted = s.background.muted ? 'muted' : '';
      bg = `<video class="bg" src="${esc(url)}" ${loop} ${muted} autoplay playsinline></video>`;
    }

    // 是否显示“文本面板背景”（半透明卡片）
    const showPanel = s?.panel?.visible !== false;

    // 文本块
    const body = (s.blocks || []).map(b => {
      if (b?.kind !== 'text') return '';
      if (showPanel) {
        // 有面板：保留卡片样式
        return `<div class="blk text">${b.html || ''}</div>`;
      }
      // 无面板：只保留基本间距，不加任何背景/边框
      return `<div class="blk-naked">${b.html || ''}</div>`;
    }).join('\n');

    // 大小与内边距（来自编辑器的 size 设置）
    const minH = Math.max(160, Number(s?.size?.minHeight ?? 300));
    const pad  = Math.max(0,   Number(s?.size?.padding   ?? 24));

    // 内层壳体：根据 showPanel 切换
    const innerOpen  = showPanel
      ? `<div class="inner" style="padding:${pad}px">`
      : `<div class="content" style="padding:${pad}px">`;
    const innerClose = `</div>`;

    return `
    <section class="sec" style="min-height:${minH}px">
      ${bg}
      ${innerOpen}
        ${body}
      ${innerClose}
    </section>`;
  }).join('\n');

  const html = `<!doctype html>
  <html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(doc.title || '未命名')}</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="container">
      <h1>${esc(doc.title || '未命名')}</h1>
      ${sectionsHtml}
    </main>
  </body>
  </html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${doc.title || 'article'}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
