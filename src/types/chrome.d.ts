declare namespace chrome {
  namespace runtime {
    function onInstalled: {
      addListener: (callback: () => void) => void;
    };
  }

  namespace alarms {
    function create: (name: string, alarmInfo: { delayInMinutes?: number }) => void;
  }

  namespace notifications {
    function create: (options: {
      type: string;
      iconUrl: string;
      title: string;
      message: string;
    }) => void;
  }

  namespace storage {
    namespace local {
      function get: (keys: string[]) => Promise<Record<string, unknown>>;
      function set: (items: Record<string, unknown>) => Promise<void>;
    }

    namespace sync {
      function get: (keys: string[]) => Promise<Record<string, unknown>>;
      function set: (items: Record<string, unknown>) => Promise<void>;
    }
  }
}

declare const chrome: typeof chrome;
