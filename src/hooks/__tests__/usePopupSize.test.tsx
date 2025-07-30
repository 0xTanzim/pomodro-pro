import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePopupSize } from '../usePopupSize';

describe('usePopupSize', () => {
  it('returns default size when tasks are not active', () => {
    const { result } = renderHook(() =>
      usePopupSize({ isTasksActive: false })
    );

    expect(result.current).toEqual({ width: 520, height: 600 });
  });

  it('returns tasks size when tasks are active', () => {
    const { result } = renderHook(() =>
      usePopupSize({ isTasksActive: true })
    );

    expect(result.current).toEqual({ width: 520, height: 800 });
  });

  it('uses custom sizes when provided', () => {
    const customDefault = { width: 400, height: 500 };
    const customTasks = { width: 600, height: 900 };

    const { result } = renderHook(() =>
      usePopupSize({
        isTasksActive: false,
        defaultSize: customDefault,
        tasksSize: customTasks
      })
    );

    expect(result.current).toEqual(customDefault);
  });

  it('switches size when isTasksActive changes', () => {
    const { result, rerender } = renderHook(
      ({ isTasksActive }) => usePopupSize({ isTasksActive }),
      { initialProps: { isTasksActive: false } }
    );

    expect(result.current).toEqual({ width: 520, height: 600 });

    rerender({ isTasksActive: true });

    expect(result.current).toEqual({ width: 520, height: 800 });
  });
});
