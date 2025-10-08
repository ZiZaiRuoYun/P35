import { defineStore } from 'pinia';

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useDocStore = defineStore('doc', {
  state: () => ({
    doc: {
      id: uid(),
      title: '新的稿件',
      sections: [
        {
          id: uid(),
          background: { kind: 'color', value: '#64ceffa9' },
          panel: { visible: true },
          blocks: [ { id: uid(), kind: 'text', html: '<p>👋 在这里输入正文…</p>', align: 'left' } ],
        },
      ],
    },
    selection: { type: 'section', id: '' },
    activeEditor: null,
  }),
  getters: {
    selectedSection(state){
      if (state.selection.type !== 'section') return undefined;
      return state.doc.sections.find(s => s.id === state.selection.id) ?? state.doc.sections[0];
    },
  },
  actions: {
    selectSection(id){ this.selection = { type: 'section', id }; },
    createSection(kind = 'color'){
      const bg = kind === 'color' ? { kind: 'color', value: '#64ceffa9' } :
                kind === 'image' ? { kind: 'image', url: 'https://img.pconline.com.cn/images/upload/upc/tx/wallpaper/1305/16/c4/20990657_1368686545122.jpg' } :
                kind === 'video' ? { kind: 'video', url: '', muted: true, loop: true } : { kind: 'none' };
      const sec = {
        id: uid(),
        background: bg,
        size: { minHeight: 300, padding: 24 },
        panel: { visible: true },
        blocks: [ { id: uid(), kind: 'text', html: '<p>新 Section 文本</p>', align: 'left' } ] };
      this.doc.sections.push(sec);
      this.selectSection(sec.id);
    },
    updateBackground(patch){
      const sec = this.selectedSection;
      if (!sec) return;
      sec.background = { ...sec.background, ...patch };
    },
    setBackgroundKind(kind){
      const sec = this.selectedSection; if (!sec) return;
      if (kind === sec.background?.kind) return;
      if (kind === 'color') sec.background = { kind: 'color', value: '#64ceffa9' };
      else if (kind === 'image') sec.background = { kind: 'image', url: 'https://img.pconline.com.cn/images/upload/upc/tx/wallpaper/1305/16/c4/20990657_1368686545122.jpg' };
      else if (kind === 'video') sec.background = { kind: 'video', url: '', muted: true, loop: true };
      else sec.background = { kind: 'none' };
    },
    addTextBlock(sectionId){
      const sec = sectionId ? this.doc.sections.find(s => s.id === sectionId) : this.selectedSection;
      if (!sec) return;
      const block = { id: uid(), kind: 'text', html: '<p>新的段落…</p>', align: 'left' };
      sec.blocks.push(block);
    },
    updateText(sectionId, blockId, html){
      const sec = this.doc.sections.find(s => s.id === sectionId); if(!sec) return;
      const blk = sec.blocks.find(b => b.id === blockId && b.kind === 'text'); if(!blk) return;
      blk.html = html;
    },
    updateSectionSize(patch){
      const sec = this.selectedSection; if(!sec) return;
      sec.size = { ...({ minHeight: 300, padding: 24 }), ...(sec.size || {}), ...patch };
    },
    setPanelVisible(v){
      const sec = this.selectedSection; if(!sec) return;
      sec.panel = { ...(sec.panel || { visible: true }), visible: !!v };
    },
    setActiveEditor(editor){
      this.activeEditor = editor || null;
    },
  },
});
