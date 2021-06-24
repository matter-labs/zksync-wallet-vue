<template>
  <div class="noteContainer">
    <div class="noteMain py-3 px-3 border border-light -dark rounded-md" :class="{ hasIcon: $slots.icon }">
      <div class="noteIcon pr-4">
        <slot name="icon" />
      </div>
      <div class="noteBody">
        <slot />
      </div>
    </div>
  </div>
</template>
