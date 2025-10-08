<template>
  <section
    :class="[
      'rounded-2xl overflow-hidden border mb-6 cursor-pointer',
      isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-gray-300',
      'relative'
    ]"
    @click="onSelect"
    :style="{ minHeight: (section?.size?.minHeight ?? 220) + 'px' }"
  >
    <!-- 背景层 -->
    <div class="absolute inset-0 z-0">
      <div v-if="section?.background?.kind === 'color'"
           :style="{ background: section?.background?.value }" class="w-full h-full"/>
      <img v-else-if="section?.background?.kind === 'image'"
           :src="section?.background?.url" class="w-full h-full object-cover" alt=""/>
      <video v-else-if="section?.background?.kind === 'video'"
             :src="section?.background?.url"
             :muted="section?.background?.muted ?? true"
             :loop="section?.background?.loop ?? true"
             autoplay playsinline class="w-full h-full object-cover"/>
    </div>

    <!-- 外层：控制 Section 的 padding -->
    <div class="relative" :style="{ padding: (section?.size?.padding ?? 24) + 'px' }">
      <!-- 文本面板：可显示/隐藏白色半透明背景 -->
      <div :class="panelCls">
        <div class="grid gap-4">
          <BlockRenderer
            v-for="blk in (section.blocks || [])"
            :key="blk.id"
            :section-id="section.id"
            :block="blk"
            @update-text="onUpdateText"
          />
          <div v-if="isSelected" class="pt-2">
            <button class="px-3 py-1 rounded bg-blue-600 text-white" @click.stop="addText">
              + 添加文本块
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useDocStore } from '../stores/doc';
import BlockRenderer from './blocks/BlockRenderer.vue';

const props = defineProps({ section: { type: Object, required: true } });
const store = useDocStore();
const isSelected = computed(() => store.selectedSection?.id === props.section.id);
const onSelect = () => store.selectSection(props.section.id);
const addText = () => store.addTextBlock(props.section.id);
const onUpdateText = ({ sectionId, blockId, html }) => store.updateText(sectionId, blockId, html);

//根据 panel.visible 切换卡片样式
const panelCls = computed(() => {
  const visible = props.section?.panel?.visible ?? true;
  return visible
    ? 'rounded-xl border border-black/10 bg-white/60 backdrop-blur p-4'
    : 'p-0 rounded-none border-0 bg-transparent backdrop-blur-0';
});
</script>
