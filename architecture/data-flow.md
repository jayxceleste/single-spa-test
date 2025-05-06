# Data Flow Architecture

## Overview

This document outlines the data flow patterns within the single-spa microfrontend application. Understanding how data moves between microfrontends is critical for creating a cohesive user experience while maintaining the independence of each microfrontend.

## Data Flow Patterns

### 1. Event Bus Communication

The primary method for cross-microfrontend communication is through a shared event bus service implemented with RxJS:

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│              │     │               │     │              │
│   NavBar MF  │◄───▶│   Event Bus   │◄───▶│   Form MF    │
│              │     │   (Shared)    │     │              │
└──────────────┘     └───────┬───────┘     └──────────────┘
                             │
                             │
                     ┌───────▼───────┐
                     │               │
                     │    List MF    │
                     │               │
                     └───────────────┘
```

#### Implementation

```typescript
// In shared module
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface Event {
  type: string;
  payload: any;
}

export class EventBusService {
  private eventBus = new Subject<Event>();
  
  public emit(event: Event): void {
    this.eventBus.next(event);
  }
  
  public on<T>(eventType: string): Observable<T> {
    return this.eventBus.pipe(
      filter(event => event.type === eventType),
      map(event => event.payload as T)
    );
  }
}
```

#### Usage Example

```typescript
// In Form MF
export class FormComponent {
  constructor(private eventBus: EventBusService) {}
  
  onSubmit(formData: any): void {
    this.eventBus.emit({
      type: 'FORM_SUBMITTED',
      payload: formData
    });
  }
}

// In List MF
export class ListComponent implements OnInit {
  constructor(private eventBus: EventBusService) {}
  
  ngOnInit(): void {
    this.eventBus.on<any>('FORM_SUBMITTED')
      .subscribe(formData => {
        // Process the form data
        this.updateList(formData);
      });
  }
}
```

### 2. Prop Drilling from Root Configuration

The root configuration can pass initial data and configuration to microfrontends:

```
┌────────────────────┐
│                    │
│  Root Config       │
│  (Container)       │
│                    │
└──┬───────────┬─────┘
   │           │
   ▼           ▼
┌──────┐    ┌──────┐
│ MF A │    │ MF B │
└──────┘    └──────┘
```

#### Implementation

```typescript
// In root-config.ts
registerApplication({
  name: '@app/form',
  app: () => import('form/module'),
  activeWhen: ['/form'],
  customProps: {
    initialData: { /* initial data */ },
    apiEndpoints: { /* API endpoints */ }
  }
});
```

#### Usage in Microfrontend

```typescript
// In Form MF
export function mount(props) {
  const { initialData, apiEndpoints } = props;
  // Use the props to initialize the application
}
```

### 3. URL-Based Communication

Microfrontends can communicate through URL parameters and path changes:

```
┌────────────────────────────────────────────┐
│                                            │
│              Browser URL                   │
│                                            │
└───┬────────────────┬────────────────┬──────┘
    │                │                │
    ▼                ▼                ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│         │     │         │     │         │
│ NavBar  │     │  Form   │     │  List   │
│   MF    │     │   MF    │     │   MF    │
│         │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘
```

#### Implementation

```typescript
// In NavBar MF
navigateToForm(params: any): void {
  const queryString = new URLSearchParams(params).toString();
  history.pushState(null, '', `/form?${queryString}`);
}

// In Form MF
ngOnInit(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    this.loadFormData(id);
  }
}
```

### 4. Shared State Management

For more complex applications, a shared state management solution can be implemented:

```
┌───────────────────────────────────┐
│                                   │
│        Shared State Store         │
│                                   │
└───┬───────────────┬───────────────┘
    │               │
┌───▼───┐       ┌───▼───┐
│       │       │       │
│ MF A  │       │ MF B  │
│       │       │       │
└───────┘       └───────┘
```

#### Implementation (RxJS State Store)

```typescript
// In shared module
export class StateStore<T> {
  private state: BehaviorSubject<T>;
  public state$: Observable<T>;
  
  constructor(initialState: T) {
    this.state = new BehaviorSubject<T>(initialState);
    this.state$ = this.state.asObservable();
  }
  
  public getState(): T {
    return this.state.getValue();
  }
  
  public setState(newState: Partial<T>): void {
    this.state.next({
      ...this.getState(),
      ...newState
    });
  }
}

// Usage example
export interface AppState {
  userData: any;
  formData: any;
  listItems: any[];
}

export const appStateStore = new StateStore<AppState>({
  userData: null,
  formData: null,
  listItems: []
});
```

## Data Persistence Strategies

### 1. Browser Storage

For client-side persistence between microfrontends:

```typescript
// Shared storage service
export class StorageService {
  saveData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  getData(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Server-Side State

For more persistent data that requires synchronization:

```typescript
// Shared API service
export class ApiService {
  constructor(private http: HttpClient) {}
  
  fetchData(endpoint: string): Observable<any> {
    return this.http.get(`/api/${endpoint}`);
  }
  
  saveData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`/api/${endpoint}`, data);
  }
}
```

## Handling Form Data

The application demonstrates a common data flow pattern where:

1. User fills out form in the Form MF
2. Form data is submitted and emitted through the event bus
3. List MF receives the data and updates its display

```
┌────────────┐    ┌────────────┐    ┌────────────┐
│            │    │            │    │            │
│   Form MF  │───▶│ Event Bus  │───▶│  List MF   │
│            │    │            │    │            │
└────────────┘    └────────────┘    └────────────┘
```

## Security Considerations

1. **Data Validation**: Each microfrontend should validate data it receives from other microfrontends
2. **Sensitive Information**: Avoid passing sensitive information through the event bus
3. **CSRF Protection**: Implement proper security measures for API calls

## Performance Optimization

1. **Data Caching**: Implement caching strategies to reduce redundant data fetching
2. **Selective Updates**: Only update the UI components affected by data changes
3. **Debouncing**: Implement debounce for frequent events to reduce processing overhead

## Conclusion

This data flow architecture provides a flexible yet cohesive approach to handling data in a microfrontend application. By leveraging RxJS and established patterns, the application maintains the independence of each microfrontend while ensuring a seamless user experience. 