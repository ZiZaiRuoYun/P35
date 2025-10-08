<template>
  <div class="h-full grid" style="grid-template-rows: auto 1fr;">
    <header class="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <h1 class="font-semibold">Newsworthy Editor</h1>
        <input v-model="title" class="px-2 py-1 border rounded text-sm w-60" placeholder="输入标题…" />
        <span class="flex-1"></span>
        <button class="px-3 py-1 rounded bg-blue-600 text-white" @click="addSection">+ 新增 Section</button>
        <button class="px-3 py-1 rounded border" @click="addText" :disabled="!selectedSection">+ 文本块</button>
        <button class="px-3 py-1 rounded border" @click="delSection" :disabled="!store.doc.sections.length">删除选中</button>
        <button class="px-3 py-1 rounded border" @click="onExport">导出 HTML</button>
        <!-- <button class="px-3 py-1 rounded border" @click="runTests">运行测试</button> -->
        <span class="text-xs" :class="testCls">{{ testMsg }}</span>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[min(100vw-2rem,1600px)] px-4 py-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_clamp(280px,26vw,420px)]">
      <div class="rounded-2xl bg-white border min-w-0"><EditorCanvas /></div>
      <aside class="rounded-2xl bg-white border min-w-0"><Inspector /></aside>
    </main>
  </div>
</template>

<script setup>
import EditorCanvas from './components/EditorCanvas.vue';
import Inspector from './components/Sidebar/SidebarInspector.vue';
import { storeToRefs } from 'pinia';
import { useDocStore } from './stores/doc';
import { exportDocAsHtml } from './embed/exporters/htmlExporter';
import { computed, ref } from 'vue';

const store = useDocStore();
const { doc, selectedSection } = storeToRefs(store);
const title = computed({ get: () => doc.value.title, set: (v) => (doc.value.title = v) });
const testMsg = ref('');
const testState = ref('idle'); // idle|pass|fail
const testCls = computed(() => testState.value === 'pass' ? 'text-green-600' : testState.value === 'fail' ? 'text-red-600' : 'text-gray-500');

function addSection(){ store.createSection('color'); }
function addText(){ store.addTextBlock(); }
function delSection(){ if(!selectedSection.value) return; const id = selectedSection.value.id; const idx = store.doc.sections.findIndex(s=>s.id===id); if(idx>=0) store.doc.sections.splice(idx,1); }
function onExport(){ exportDocAsHtml(doc.value); }

// // —— 轻量测试 ——
// function runTests(){
//   const results = [];
//   const backup = JSON.parse(JSON.stringify(doc.value));
//   try {
//     // T1: 清空 sections 不应抛错
//     store.doc.sections = []; store.selection = { type:'section', id:'' };
//     // 操作 Inspector 行为（无选中时调用 setBackgroundKind 应无效不报错）
//     store.setBackgroundKind('color');
//     results.push({ name:'T1 empty sections safe', pass:true });

//     // T2: 重新创建 + 文本编辑
//     store.createSection('image');
//     store.addTextBlock();
//     const s0 = store.doc.sections[0];
//     const b0 = s0.blocks[0];
//     store.updateText(s0.id, b0.id, '<p>ok</p>');
//     results.push({ name:'T2 create & edit', pass: s0.blocks[0].html.includes('ok') });
//   } catch(e){
//     console.error(e); results.push({ name:'Exception', pass:false, msg:String(e) });
//   } finally {
//     // 还原
//     store.doc = backup;
//   }
//   const fail = results.find(r=>!r.pass);
//   testState.value = fail ? 'fail' : 'pass';
//   testMsg.value = fail ? `❌ ${fail.name}` : `✅ ${results.length} tests passed`;
//   console.table(results);
// }
</script>

<style scoped>
:host { color-scheme: light dark; }
header, main { transition: background .2s ease; }
</style>
