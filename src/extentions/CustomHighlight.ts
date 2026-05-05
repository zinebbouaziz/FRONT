import Highlight from '@tiptap/extension-highlight'

export const CustomHighlight = Highlight.extend({
  addAttributes() {
    return {
      color: {
        default: '#fef08a',
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => {
          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}`,
          }
        },
      },
    }
  },
})