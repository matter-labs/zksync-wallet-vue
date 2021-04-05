<template>
  <div class="noteContainer">
    <div class="noteMain" :class="{ hasIcon: $slots.icon }">
      <div class="noteIcon _padding-right-1">
        <slot name="icon" />
      </div>
      <div class="noteBody">
        <slot />
      </div>
    </div>
  </div>
</template>
