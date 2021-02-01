import { shallowMount, Wrapper } from '@vue/test-utils';

import userImg from '@/components/userImg.vue';

let wrapper: Wrapper<userImg>;

describe('userImg', () => {
  test('With no address', () => {
    wrapper = shallowMount(userImg, {
      propsData: { wallet: "" }
    });
    expect(wrapper.find('.userImg').attributes().src).toBe("");
  });
  test('With correct address', () => {
    wrapper = shallowMount(userImg, {
      propsData: { wallet: "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0" }
    });
    expect(wrapper.find('.userImg').attributes().src).toContain("base64");
  });
});