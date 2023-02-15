<template>
  <div class="announcement">
    zkSync v1 is now zkSync Lite.
    <a href="https://blog.matter-labs.io/8b8964ba7c59" rel="noopener nofollow noreferrer" target="_blank">Learn more</a>
  </div>
</template>

<style lang="scss">
.announcement {
  z-index: 9;
  position: fixed;
  top: 0;
  background: linear-gradient(90deg, #8c8dfc 0%, #4e529a 100%);
  height: 32px;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 30px;
  text-align: center;
  letter-spacing: -0.015em;
  color: #ffffff;
  > a {
    color: #ffffff;
    text-decoration: underline;
  }
}
</style>
