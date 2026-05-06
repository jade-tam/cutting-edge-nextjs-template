import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

describe('Dashboard shell page title copy', () => {
  it('should have concise breadcrumb labels in English', () => {
    expect(en.dashboardShell.pageTitle.createExampleEntity).toBe('Create');
    expect(en.dashboardShell.pageTitle.editExampleEntity).toBe('Edit');
  });

  it('should have concise breadcrumb labels in Vietnamese', () => {
    expect(vi.dashboardShell.pageTitle.createExampleEntity).toBe('Tạo mới');
    expect(vi.dashboardShell.pageTitle.editExampleEntity).toBe('Chỉnh sửa');
  });
});
