import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    exclude: [
      '**/node_modules/**',
      // исключаем компонентные тесты — они требуют templateUrl который Vitest не поддерживает
      '**/app.spec.ts',
      '**/login/login.spec.ts',
      '**/users-list/users-list.spec.ts',
      '**/add-user-dialog/add-user-dialog.spec.ts',
      '**/edit-user-dialog/edit-user-dialog.spec.ts',
      '**/app-header/app-header.spec.ts',
      '**/confirm-modal/confirm-modal.spec.ts',
      '**/users/services/users.spec.ts',
    ],
  },
});