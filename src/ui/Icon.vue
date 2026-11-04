<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    :class="$attrs.class" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path v-for="(d, i) in paths" :key="i" :d="d" :fill="filled ? 'currentColor' : 'none'" :stroke="filled ? 'none' : 'currentColor'" />
  </svg>
</template>

<script setup>
/* P2-9 图标体系：内联 SVG sprite（字符图标收敛，任务书 §5.4 组件统一）。
   24px 网格 / currentColor 继承文字色 / aria-hidden（语义由按钮文本或 aria-label 承担）。
   文本中描述按键的字符（如 toast 里「‹ › 逐组拆装」）不属于图标，保留原文。 */
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 12 },
});

const STROKE = {
  close: ['M6 6l12 12', 'M18 6L6 18'],
  'chevron-left': ['M14 6l-6 6 6 6'],
  'chevron-right': ['M10 6l6 6-6 6'],
  caret: ['M6 14l6-6 6 6'],
  plus: ['M12 5v14', 'M5 12h14'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 13v6H5V6h6'],
  download: ['M12 3v12', 'M8 11l4 4 4-4', 'M4 19h16'],
  upload: ['M12 21V9', 'M8 13l4-4 4 4', 'M4 5h16'],
  copy: ['M9 9h11v11H9z', 'M5 15V4h11'],
  import: ['M21 12H8', 'M12 8l-4 4 4 4', 'M3 5v14'],
  rotate: ['M20 12a8 8 0 1 1-2.34-5.66', 'M18 3v4h-4'],
  focus: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3'],
  undo: ['M8 7l-4 4 4 4', 'M4 11h11a5 5 0 0 1 5 5'],
  redo: ['M16 7l4 4-4 4', 'M20 11H9a5 5 0 0 0-5 5'],
  'star-o': ['M12 2l2.9 6.26 6.6.57-5 4.4 1.5 6.47L12 16.9 5.99 19.23l1.5-6.47-5-4.4 6.6-.57L12 2z'],
  'diamond-o': ['M12 2.5l7 9.5-7 9.5L5 12l7-9.5z'],
};
const FILL = {
  star: ['M12 2l2.9 6.26 6.6.57-5 4.4 1.5 6.47L12 16.9 5.99 19.23l1.5-6.47-5-4.4 6.6-.57L12 2z'],
  edit: ['M4 20l1-4L17 4l3 3L8 19l-4 1z'],
  diamond: ['M12 2.5l7 9.5-7 9.5L5 12l7-9.5z'],
  hammer: ['M13.5 3.5l7 7-2.5 2.5-2-2-8.5 8.5-3.5-3.5L12.5 7.5l-2-2 3-2z'],
};

const paths = computed(() => STROKE[props.name] || FILL[props.name] || []);
const filled = computed(() => !STROKE[props.name] && !!FILL[props.name]);
</script>
