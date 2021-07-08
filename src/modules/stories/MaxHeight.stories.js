/* eslint-disable quotes */
export default {
  title: "Max Height",
  argTypes: {
    value: {
      control: "boolean",
      defaultValue: false,
      description: "v-model which toogles the block open or closed",
    },
  },
};

export const MaxHeight = (_, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `
    <zk-max-height v-bind="$props">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam nesciunt laudantium mollitia eaque laborum id? Atque minima excepturi blanditiis illum ipsam obcaecati labore, magni itaque exercitationem numquam officiis asperiores deleniti.</p>
    </zk-max-height>
  `,
});
