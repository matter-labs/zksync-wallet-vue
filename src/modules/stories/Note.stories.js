/* eslint-disable quotes */
export default {
  title: "Note",
  argTypes: {
    defaultSlot: {
      control: "text",
      defaultValue: "This is a note",
      description: `HTML for the "default" slot`,
    },
  },
};

export const Note = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
    <zk-note>
      {{ $props.defaultSlot }}
    </zk-note>
  `,
});
