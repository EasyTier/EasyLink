<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <RouterView />
        </n-modal-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
