
* ⚙ **Modular** (each part is independent and swappable)
* 🧼 **Maintainable** (easy to update and debug)
* 🧠 **Scalable** (can grow to large apps without becoming a mess)
* 🧪 **Testable** (individual parts can be unit-tested easily)
* 👨‍💻 **Professional-grade** (used in FANG & enterprise-level apps)

## 🔰 1. **Container + Presentational Components**

### 🔹 What it does

* **Container** handles logic, state, effects, API
* **Presentational** only renders UI with props

### 📁 Folder structure

```
/components
  /UserProfile
    UserProfile.tsx           ← Presentational (pure UI)
    UserProfileContainer.tsx  ← Container (logic)
```

### 🧠 Why

* Decouples view and logic
* Encourages reusability
* Great for testing and scaling

---

## 🔄 2. **Finite State Machine (FSM)**

### 🔹 What it does

Represents component state as **finite**, not multiple booleans.

```ts
type LoadState = 'idle' | 'loading' | 'success' | 'error';
const [state, setState] = useState<LoadState>('idle');
```

### ✅ Benefits

* Easier to reason about state transitions
* Cleaner and safer UI logic
* Avoids conflict like `isLoading && isError`

---

## 🧱 3. **SRP (Single Responsibility Principle)**

### 🔹 What it does

Each component/function/service/class has **only one reason to change**.

### 💡 Examples

* API logic is in `api/`
* Auth logic in `auth/`
* UI elements do only display

### ✅ Benefits

* Improves maintainability
* Reduces side effects and tight coupling

---

## 🧠 4. **Separation of Concerns (SoC)**

### 📁 Real-world folder breakdown

```
/src
  /api            ← External calls
  /components     ← UI pieces
  /containers     ← State logic
  /contexts       ← Global React Contexts
  /hooks          ← Reusable logic
  /types          ← TypeScript interfaces
  /utils          ← Helpers
```

> You can even go **feature-based** (`/features/weather`, `/features/user`) for big projects.

---

## 🎯 5. **Declarative Rendering**

### 🔹 What it means

React should **describe what UI should look like**, based on state — not how to mutate it.

```tsx
return (
  {status === 'loading' && <Spinner />}
  {status === 'error' && <ErrorMessage />}
  {status === 'success' && <UserProfile {...data} />}
)
```

### ✅ Benefits

* Predictable UI
* Eliminates manual DOM handling

---

## 🧠 6. **Command Pattern**

### 🔹 Use case

Encapsulate user actions (add, delete, update) as command objects.

```ts
interface Command {
  execute(): void;
  undo(): void;
}

class AddCityCommand implements Command {
  constructor(private city: string) {}
  execute() { /* add logic */ }
  undo() { /* remove logic */ }
}
```

✅ Enables undo/redo, queues, or command history.

---

## 🏭 7. **Factory Pattern**

### 🔹 Use case

Generate components or services dynamically based on type or condition.

```ts
function createCard(type: 'weather' | 'news') {
  switch (type) {
    case 'weather': return <WeatherCard />;
    case 'news': return <NewsCard />;
  }
}
```

✅ Useful for dynamic UIs or dependency injection.

---

## 👁 8. **Observer Pattern**

### 🔹 Use case

Let multiple components respond to changes in shared data (e.g., user auth, theme, notifications).

In React, you usually use **Context + Event Emitters** or even RxJS.

```ts
const AuthContext = createContext<AuthState>(defaultState);

// All subscribers get updates when state changes
```

✅ Ideal for global state sync, reactive systems

---

## 🔌 9. **Adapter Pattern**

### 🔹 Use case

Transform 3rd-party data to fit your internal models.

```ts
function adaptWeatherData(apiResponse: OpenWeatherResponse): WeatherData {
  return {
    temp: apiResponse.main.temp,
    city: apiResponse.name,
    ...
  };
}
```

✅ Keeps 3rd-party changes isolated
✅ Keeps internal models clean

---

## 🏗️ Putting It All Together (Visualized)

```
/features
  /weather
    WeatherCard.tsx              ← Presentational
    WeatherCardContainer.tsx     ← Container
    weatherSlice.ts              ← FSM + SRP
    WeatherCommand.ts            ← Command Pattern
    WeatherFactory.ts            ← Factory Pattern
    weatherAdapter.ts            ← Adapter
    useWeather.ts                ← Observer pattern (Context or RxJS)
```

---

## 🧠 Summary Table

| Pattern                  | Benefit                            | React Use Case Example                  |                 |
| ------------------------ | ---------------------------------- | --------------------------------------- | --------------- |
| Container/Presentational | Separation of logic and UI         | `UserProfileContainer` vs `UserProfile` |                 |
| FSM                      | Clean state transitions            | \`loadState = 'idle'                    | 'loading' ...\` |
| SRP                      | Maintainable functions/components  | One-responsibility files                |                 |
| SoC                      | Modular project structure          | Feature folders, separate API/utils     |                 |
| Declarative Rendering    | Clear, state-driven UI             | Conditional JSX blocks                  |                 |
| Command                  | Encapsulate user actions           | Add/Delete/Undo                         |                 |
| Factory                  | Dynamic component/service creation | `createWidget()`                        |                 |
| Observer                 | Reactive state updates             | Context, RxJS                           |                 |
| Adapter                  | Normalize external APIs            | `adaptWeatherData()`                    |                 |

---

--

Here’s a **curated list of additional design patterns** that you can use in **React apps, system design, and backend development**. Each is explained with:

* 💡 **What it is**
* 🧠 **Where it fits**
* ✅ **Why it matters**
* 📦 **React-specific use**

---

## 🧩 ADVANCED DESIGN PATTERNS TO MASTER

---

### 1. **HOC (Higher-Order Component) Pattern**

* **💡** Function that takes a component and returns a new enhanced component
* **🧠** For cross-cutting concerns like auth, logging, themes
* **✅** Reusable logic without polluting original component

```tsx
const withAuth = (Component) => (props) => {
  const auth = useAuth();
  return auth.isLoggedIn ? <Component {...props} /> : <Login />;
};
```

> 🪄 Similar to middleware in Express

---

### 2. **Render Props Pattern**

* **💡** Pass a function as a prop to dictate rendering
* **🧠** Useful for sharing stateful logic
* **✅** Flexible UI composition

```tsx
<Toggle render={({ on, toggle }) => <button onClick={toggle}>{on ? 'On' : 'Off'}</button>} />
```

> ⚠️ Used less now due to hooks, but still relevant for shared logic

---

### 3. **State Reducer Pattern**

* **💡** Externalize state transitions like Redux or `useReducer`
* **🧠** Useful for complex UI logic (e.g., form wizards, multi-step flows)
* **✅** Predictable state management

```ts
const reducer = (state, action) => { /* switch-case */ };
const [state, dispatch] = useReducer(reducer, initialState);
```

---

### 4. **Strategy Pattern**

* **💡** Define a family of interchangeable algorithms
* **🧠** Good for feature toggles, UI themes, business rules

```ts
interface PaymentStrategy {
  pay(amount: number): void;
}

class PayPal implements PaymentStrategy { pay() { ... } }
class Stripe implements PaymentStrategy { pay() { ... } }
```

> 💼 Think of `usePayment(strategyName)` → returns right strategy

---

### 5. **Composite Pattern**

* **💡** Treat groups of components like single components
* **🧠** Ideal for recursive UIs: comments, trees, menus, layouts

```tsx
const Menu = ({ items }) => items.map(item => (
  <li>{item.label}{item.children && <Menu items={item.children} />}</li>
));
```

---

### 6. **Proxy Pattern**

* **💡** Intercepts access to an object and adds behavior
* **🧠** Useful for caching, logging, or permission checks

```ts
const apiProxy = new Proxy(apiService, {
  get(target, prop) {
    console.log(`Calling ${String(prop)}`);
    return target[prop];
  }
});
```

> 🧠 Could wrap API calls with auth token or request throttle

---

### 7. **Decorator Pattern (React-specific & OOP)**

* **💡** Dynamically adds behavior to components or objects
* **🧠** In React, HOCs and hooks behave like decorators
* **✅** Clean injection of extra features

```tsx
function withLogging(Component) { return (props) => { console.log('Rendered'); return <Component {...props} /> }; }
```

---

### 8. **Module Pattern**

* **💡** Encapsulate code inside self-contained modules
* **🧠** Useful for plugins, utility libraries, shared logic

```ts
const AuthModule = (() => {
  let token = '';
  return {
    login: (t) => { token = t },
    getToken: () => token
  };
})();
```

> 🧪 Use for reusable business logic outside React lifecycle

---

### 9. **Template Method Pattern**

* **💡** Base class defines skeleton; subclasses override specific steps
* **🧠** Works in hooks or service classes

```ts
abstract class BaseForm {
  submit() {
    this.validate();
    this.send();
  }
  abstract validate(): void;
  abstract send(): void;
}
```

---

### 10. **Chain of Responsibility Pattern**

* **💡** Pass requests along a chain of handlers
* **🧠** Like Express middleware, form validations

```ts
const validator1 = (next) => (data) => { if (data.valid) next(data) };
const validator2 = (next) => (data) => { /* ... */ };
```

> ⚙ Useful in form pipelines, data processors

---

## 🧠 Summary Table of Additional Patterns

| Pattern                     | React Use Case                  | Real-world Analogy          |
| --------------------------- | ------------------------------- | --------------------------- |
| **HOC**                     | Auth, themes, logging           | Middleware wrapper          |
| **Render Props**            | Share logic with flexibility    | Scoped slot rendering       |
| **State Reducer**           | Complex states, wizards         | Redux-like transitions      |
| **Strategy**                | Payment, themes, filters        | Swap-in logic blocks        |
| **Composite**               | Trees, menus, nested structures | File system / Comments      |
| **Proxy**                   | API control, logging            | API throttle/wrappers       |
| **Decorator**               | Extend behavior dynamically     | Logging, analytics          |
| **Module**                  | Utility logic encapsulation     | Service object or singleton |
| **Template Method**         | Hook-based abstract logic       | Abstract class-based flows  |
| **Chain of Responsibility** | Form validation pipeline        | Express middleware          |

---

## 📘 Bonus Tips

### 📦 Group patterns into your architecture

| Layer         | Suggested Patterns                                |
| ------------- | ------------------------------------------------- |
| UI Layer      | Composite, HOC, Render Props, Declarative, FSM    |
| Data Layer    | Adapter, Proxy, Observer, Chain of Responsibility |
| Logic Layer   | Strategy, Template Method, Command, State Reducer |
| Utility Layer | Factory, Module, SRP, SoC                         |
