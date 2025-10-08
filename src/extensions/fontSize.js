// src/extensions/fontSize.js
import { Extension } from '@tiptap/core'

/**
 * 给 textStyle mark 增加 fontSize 属性，并负责解析/渲染 style。
 * 使用方式：editor.chain().setMark('textStyle', { fontSize: '20px' }).run()
 */
const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],   // ← 把属性挂到 textStyle 上
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => {
              // 从内联样式读取
              const size = element.style?.fontSize
              return size || null
            },
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
})

export default FontSize
