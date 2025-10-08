<template>
  <div class="p-4">
    <div v-for="s in store.doc.sections" :key="s.id">
      <SectionItem :section="s" />
    </div>
  </div>
</template>

<script setup>
import { useDocStore } from '../stores/doc';
import SectionItem from './SectionItem.vue';
const store = useDocStore();
</script>
