<template>
  <div class="p-4 space-y-4">
    <h3 class="text-lg font-semibold">属性面板 · Inspector</h3>
    <div v-if="sec">
      <label class="block text-sm text-gray-600 mb-1">背景类型</label>
      <div class="flex gap-2">
        <button class="px-3 py-1 rounded border" :class="btnCls('none')" @click="setKind('none')">无</button>
        <button class="px-3 py-1 rounded border" :class="btnCls('color')" @click="setKind('color')">纯色</button>
        <button class="px-3 py-1 rounded border" :class="btnCls('image')" @click="setKind('image')">图片</button>
        <button class="px-3 py-1 rounded border" :class="btnCls('video')" @click="setKind('video')">视频</button>
      </div>

      <div class="mt-6 space-y-3">
        <div class="text-sm font-medium">大小</div>
        <div class="space-y-2">
          <label class="block text-xs text-gray-600">Section 高度（px）</label>
          <input type="range" min="160" max="800" step="20" v-model.number="heightPx" class="w-full"/>
          <div class="text-xs text-gray-500">{{ heightPx }} px</div>
        </div>
        <div class="space-y-2">
          <label class="block text-xs text-gray-600">内边距 Padding（px）</label>
          <input type="range" min="8" max="64" step="4" v-model.number="paddingPx" class="w-full"/>
          <div class="text-xs text-gray-500">{{ paddingPx }} px</div>
        </div>

        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="panelVisible"> 显示文本面板背景
        </label>
      </div>

      <div v-if="sec?.background?.kind === 'color'" class="mt-6 space-y-2">
        <label class="block text-sm text-gray-600 mb-1">颜色</label>
        <input type="color" v-model="color" class="w-full h-10 rounded" />
        <div class="mt-2">
          <div class="text-sm text-gray-600">预览</div>
          <div class="h-24 rounded border" :style="{ background: color }"></div>
        </div>
      </div>

      <div v-else-if="sec?.background?.kind === 'image'" class="mt-6 space-y-2">
        <label class="block text-sm text-gray-600">图片 URL</label>
        <input v-model="imgUrl" class="w-full border rounded px-2 py-1" placeholder="https://..." />
        <div class="mt-2">
          <div class="text-sm text-gray-600">预览</div>
          <div class="h-28 rounded border overflow-hidden relative" style="background-size:10px 10px;background-image:linear-gradient(45deg,#f5f5f5 25%,transparent 25%),linear-gradient(-45deg,#f5f5f5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f5f5f5 75%),linear-gradient(-45deg,transparent 75%,#f5f5f5 75%);background-position:0 0,0 5px,5px -5px,-5px 0;">
            <img v-if="imgUrl && !hasImgError" :src="imgUrl" class="w-full h-full object-cover" @error="onImgError"/>
            <div v-else class="absolute inset-0 grid place-items-center text-xs text-gray-500">请输入有效图片 URL</div>
          </div>
        </div>
      </div>

      <div v-else-if="sec?.background?.kind === 'video'" class="mt-6 space-y-2">
        <label class="block text-sm text-gray-600">视频 URL</label>
        <input v-model="videoUrl" class="w-full border rounded px-2 py-1" placeholder="https://...mp4" />
        <label class="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" v-model="videoLoop"> 循环播放</label>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700 ml-4"><input type="checkbox" v-model="videoMuted"> 静音</label>
        <div class="mt-2">
          <div class="text-sm text-gray-600">预览</div>
          <div class="h-28 rounded border overflow-hidden">
            <video v-if="videoUrl" :src="videoUrl" class="w-full h-full object-cover" muted playsinline :loop="videoLoop" autoplay></video>
            <div v-else class="h-full grid place-items-center text-xs text-gray-500">请输入视频 URL</div>
          </div>
        </div>
      </div>

      <div class="space-y-2 border-t pt-4">
        <div class="text-sm font-medium">文本</div>
        <div class="flex flex-wrap gap-2">
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="cmd('toggleBold')">B</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="cmd('toggleItalic')">/</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="cmd('toggleBulletList')">• List</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="align('left')">居左</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="align('center')">居中</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="align('right')">居右</button>
          <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="setLink">链接</button>
        </div>
        <div class="text-xs text-gray-500">提示：先点击左侧文本框以获取焦点，再使用这里的格式按钮。</div>

        <!-- 文本分组里新增 字号控制 -->
        <div class="mt-3 space-y-1">
          <label class="block text-xs text-gray-600">字体大小（px）</label>
          <input
            type="range" min="12" max="48" step="1"
            :disabled="!hasEditor"
            :value="fontPx"
            @input="applyFont(($event.target).value)"
            class="w-full" />
          <div class="flex items-center gap-3">
            <input
              type="number" min="12" max="72" step="1"
              class="w-20 border rounded px-2 py-1"
              :disabled="!hasEditor"
              :value="fontPx"
              @input="applyFont(($event.target).value)" />
            <span class="text-sm text-gray-600">{{ fontPx }} px</span>
            <button class="px-2 py-1 border rounded" :disabled="!hasEditor" @click="resetFont">重置</button>
          </div>
        </div>

      </div>

      <div class="pt-4 text-xs text-gray-500 border-t">小提示：iOS 上自动播放需要静音（muted）与 playsinline。</div>
    </div>
    <div v-else class="text-gray-500 text-sm">请先在左侧选择一个 Section。</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDocStore } from '../../stores/doc'

const store = useDocStore()
const sec = computed(() => store.selectedSection)

const setKind = (k) => store.setBackgroundKind(k)

// 大小
const heightPx = computed({
  get: () => sec.value?.size?.minHeight ?? 300,
  set: (v) => store.updateSectionSize({ minHeight: Number(v) })
})
const paddingPx = computed({
  get: () => sec.value?.size?.padding ?? 24,
  set: (v) => store.updateSectionSize({ padding: Number(v) })
})

// Inspector 开关 <-> store.panel.visible
const panelVisible = computed({
  get: () => !!(sec.value?.panel?.visible ?? true),
  set: (v) => store.setPanelVisible(v)
})

// 纯色
const color = computed({
  get: () => (sec.value?.background?.kind === 'color' ? sec.value.background.value : '#ffffff'),
  set: (v) => store.updateBackground({ value: v })
})

// 图片
const hasImgError = ref(false)
const imgUrl = computed({
  get: () => (sec.value?.background?.kind === 'image' ? sec.value.background.url : ''),
  set: (v) => { hasImgError.value = false; store.updateBackground({ url: v }) }
})

function onImgError() { hasImgError.value = true }
watch(sec, () => { hasImgError.value = false })

// 视频
const videoUrl = computed({
  get: () => (sec.value?.background?.kind === 'video' ? sec.value.background.url : ''),
  set: (v) => store.updateBackground({ url: v })
})
const videoLoop = computed({
  get: () => (sec.value?.background?.kind === 'video' ? !!sec.value.background.loop : true),
  set: (v) => store.updateBackground({ loop: v })
})
const videoMuted = computed({
  get: () => (sec.value?.background?.kind === 'video' ? !!sec.value.background.muted : true),
  set: (v) => store.updateBackground({ muted: v })
})

function btnCls(k) {
  return sec.value?.background?.kind === k
    ? 'bg-blue-600 text-white border-blue-600'
    : 'bg-white'
}

// 文本命令 —— 对当前 activeEditor 生效
const hasEditor = computed(() => !!store.activeEditor);
function cmd(name){
  const ed = store.activeEditor; if(!ed) return;
  const chain = ed.chain().focus();
  switch(name){
    case 'toggleBold': chain.toggleBold().run(); break;
    case 'toggleItalic': chain.toggleItalic().run(); break;
    case 'toggleBulletList': chain.toggleBulletList().run(); break;
  }
}
function align(pos){
  const ed = store.activeEditor; if(!ed) return;
  ed.chain().focus().setTextAlign(pos).run();
}
function setLink(){
  const ed = store.activeEditor; if(!ed) return;
  const prev = ed.getAttributes('link').href || '';
  const url = window.prompt('输入链接 URL：', prev || 'https://');
  if (url === null) return;
  if (url === '') ed.chain().focus().unsetLink().run();
  else ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

// 读取/设置当前文本的字号

// —— 关键：用一个 ref 存当前字号，并在 editor 事件里刷新它 ——
const fontPx = ref(16)

// 从编辑器读取当前选区的字号，刷新到 UI
function readFontFromEditor() {
  const ed = store.activeEditor
  if (!ed) return
  const cur = ed.getAttributes('textStyle')?.fontSize || ''
  const n = parseInt(String(cur).replace('px',''), 10)
  fontPx.value = Number.isFinite(n) ? n : 16
}

// activeEditor 变化时，绑定/解绑事件，并立即刷新一次
watch(() => store.activeEditor, (ed, prev) => {
  if (prev) {
    prev.off('selectionUpdate', readFontFromEditor)
    prev.off('transaction',     readFontFromEditor)
  }
  if (ed) {
    readFontFromEditor()
    ed.on('selectionUpdate', readFontFromEditor)
    ed.on('transaction',     readFontFromEditor)
  }
})

// 应用字号：若没选中文本，则选中当前段落范围后再设置
function applyFont(px) {
  const ed = store.activeEditor; if (!ed) return
  const v = Math.max(10, Math.min(200, Number(px) || 16))
  const { state } = ed
  const { empty } = state.selection

  let chain = ed.chain().focus()
  if (empty) {
    const $from = state.selection.$from
    chain = chain.setTextSelection({ from: $from.start(), to: $from.end() })
  }

  chain.extendMarkRange('textStyle')
       .setMark('textStyle', { fontSize: `${v}px` })   // v3：通用命令
       .run()

  fontPx.value = v  // 同步 UI
}

// 重置字号（同样处理“未选中”情况）
function resetFont() {
  const ed = store.activeEditor; if (!ed) return
  const { empty } = ed.state.selection
  let chain = ed.chain().focus()
  if (empty) {
    const $from = ed.state.selection.$from
    chain = chain.setTextSelection({ from: $from.start(), to: $from.end() })
  }
  chain.extendMarkRange('textStyle').unsetMark('textStyle').run()
  readFontFromEditor()
}

</script>
