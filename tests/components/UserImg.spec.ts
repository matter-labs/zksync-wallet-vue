import UserImg from "~/components/UserImg.vue";
import { shallowMount, Wrapper } from "@vue/test-utils";
import { Vue } from "vue-property-decorator";

let wrapper: Wrapper<Vue>;
describe("UserImg", (): void => {
  test("With no address", () => {
    wrapper = shallowMount(UserImg, {
      propsData: { wallet: "" },
    });
    expect(wrapper.find(".userImg").attributes().src).toBe("");
  });
  test("With correct address", () => {
    wrapper = shallowMount(UserImg, {
      propsData: { wallet: "0x2D9835a1C1662559975B00AEA00e326D1F9f13d0" },
    });
    expect(wrapper.find(".userImg").attributes().src).toContain("base64");
  });
});
