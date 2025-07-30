declare namespace chrome {
  namespace storage {
    namespace local {
      function get(keys: string | string[] | object | null): Promise<{ [key: string]: any }>;
      function set(items: object): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
      function clear(): Promise<void>;
    }
    namespace sync {
      function get(keys: string | string[] | object | null): Promise<{ [key: string]: any }>;
      function set(items: object): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
      function clear(): Promise<void>;
    }
  }

  namespace alarms {
    function create(alarmInfo: {
      delayInMinutes?: number;
      periodInMinutes?: number;
      when?: number;
    }): Promise<void>;
    function getAlarm(name: string): Promise<chrome.alarms.Alarm | undefined>;
    function getAll(): Promise<chrome.alarms.Alarm[]>;
    function clear(name?: string): Promise<boolean>;
    function clearAll(): Promise<void>;
    const onAlarm: chrome.alarms.AlarmEvent;
  }

  namespace notifications {
    function create(notificationOptions: {
      type: string;
      iconUrl?: string;
      title: string;
      message: string;
    }): Promise<string>;
    function clear(notificationId: string): Promise<boolean>;
  }

  namespace runtime {
    function sendMessage(message: any): Promise<any>;
    function getURL(path: string): string;
    const onMessage: chrome.runtime.RuntimeMessageEvent;
  }

  namespace tabs {
    function create(createProperties: {
      url?: string;
      active?: boolean;
      index?: number;
    }): Promise<chrome.tabs.Tab>;
    function query(queryInfo: object): Promise<chrome.tabs.Tab[]>;
  }

  namespace action {
    function setBadgeText(details: { text: string }): Promise<void>;
    function setBadgeBackgroundColor(details: { color: string }): Promise<void>;
  }
}

declare namespace chrome.alarms {
  interface Alarm {
    name: string;
    scheduledTime: number;
    periodInMinutes?: number;
  }

  interface AlarmEvent {
    addListener(callback: (alarm: Alarm) => void): void;
    removeListener(callback: (alarm: Alarm) => void): void;
  }
}

declare namespace chrome.runtime {
  interface RuntimeMessageEvent {
    addListener(callback: (message: any, sender: any, sendResponse: any) => void): void;
    removeListener(callback: (message: any, sender: any, sendResponse: any) => void): void;
  }
}

declare namespace chrome.tabs {
  interface Tab {
    id?: number;
    index: number;
    windowId: number;
    highlighted: boolean;
    active: boolean;
    pinned: boolean;
    url?: string;
    title?: string;
    favIconUrl?: string;
    status?: string;
    incognito: boolean;
    width?: number;
    height?: number;
    sessionId?: string;
  }
}
