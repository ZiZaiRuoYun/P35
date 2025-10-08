<template>
  <div class="editor">
    <EditorContent :editor="editor" class="rounded-xl border bg-white/70 backdrop-blur px-3 py-2" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style' // v3 必须具名导入
import { useDocStore } from '../../stores/doc'
import FontSize from '../../extensions/fontSize'

const props = defineProps({ sectionId: String, block: Object })
const emit = defineEmits(['update-text'])
const store = useDocStore()

const editor = new Editor({
  content: props.block?.html || '<p>👋 在这里输入正文…</p>',
  extensions: [
    StarterKit.configure({ link: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false }),
    TextStyle, // 启用 textStyle mark
    FontSize,
  ],
  onUpdate({ editor }) {
    emit('update-text', { sectionId: props.sectionId, blockId: props.block.id, html: editor.getHTML() })
  },
  onFocus() { store.setActiveEditor(editor) }, // 聚焦登记
})

onMounted(() => { store.setActiveEditor(editor) }) // 挂载时登记
onBeforeUnmount(() => {
  if (store.activeEditor === editor) store.setActiveEditor(null)
  editor.destroy()
})
</script>
