import { useMemo } from 'react';

interface UsePopupSizeProps {
  isTasksActive: boolean;
  defaultSize?: { width: number; height: number };
  tasksSize?: { width: number; height: number };
}

export const usePopupSize = ({
  isTasksActive,
  defaultSize = { width: 520, height: 600 },
  tasksSize = { width: 520, height: 800 }
}: UsePopupSizeProps) => {
  const currentSize = useMemo(() => {
    return isTasksActive ? tasksSize : defaultSize;
  }, [isTasksActive, defaultSize, tasksSize]);

  return currentSize;
};
