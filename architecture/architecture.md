# Microfrontend Architecture Design

## Overview

This document outlines the architecture of a microfrontend application built using the single-spa framework. The application follows a modular architecture where multiple Angular-based microfrontends are composed together through a central root configuration.

## System Architecture

![Microfrontend Architecture](https://i.imgur.com/TT7oW47.png)

### Core Components

1. **Root Configuration (@moby/root-config)**
   - Central orchestrator that manages the microfrontends
   - Handles routing and application lifecycle
   - Implements single-spa-layout for arranging microfrontends

2. **Microfrontends**
   - **NavBar**: Navigation component built with Angular
   - **Form**: Form-handling microfrontend built with Angular
   - **List**: Data display microfrontend built with Angular
   - **Shared**: Common utilities and services shared across microfrontends

### Technology Stack

- **Framework**: single-spa for microfrontend orchestration
- **UI Frameworks**: Angular (v16) for individual microfrontends
- **Module Federation**: Webpack 5 module federation for sharing code and dependencies
- **Build System**: Webpack, Angular CLI with custom webpack configurations
- **Languages**: TypeScript for type-safe development
- **State Management**: RxJS for reactive state management
- **Development Tools**: ESLint, Prettier, Husky (git hooks), Jest

## Detailed Architecture

### 1. Root Configuration Layer

The root configuration serves as the shell application that:
- Bootstraps the entire application
- Registers all microfrontends
- Defines the layout and routing structure
- Handles cross-application communication
- Manages shared dependencies

```typescript
// Root configuration bootstrapping
import { registerApplication, start } from "single-spa";
import { constructApplications, constructRoutes, constructLayoutEngine } from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return moduleMap[name]();  // Dynamic import of microfrontends
  },
});

applications.forEach(registerApplication);
start();
```

### 2. Routing Layer

The application implements HTML-based declarative routing using single-spa-layout:

```html
<single-spa-router>
  <main>
    <redirect from="/" to="/form"></redirect>
    <application name="@app/navBar"></application>
    <route path="/form">
      <application name="@app/form"></application>
    </route>
    <route path="/list">
      <application name="@app/list"></application>
    </route>
  </main>
</single-spa-router>
```

### 3. Microfrontend Layer

Each microfrontend follows a similar structure:

- **Independent Angular Applications**: Each microfrontend is a complete Angular application
- **Single-Spa Integration**: Uses single-spa-angular to adapt to the single-spa lifecycle
- **Module Federation**: Exposes components through Webpack 5 Module Federation
- **Custom Webpack Configuration**: Enhanced Angular builds with custom Webpack configurations

### 4. Shared Services Layer

The shared package provides:
- Common utilities and services
- Shared models and interfaces
- Cross-microfrontend communication mechanisms
- Common styling and UI components

## Communication Patterns

### 1. Direct Communication

Microfrontends can directly communicate through the shared module using RxJS:

```typescript
// In shared module
export class EventBusService {
  private eventBus = new Subject<Event>();
  
  emit(event: Event) {
    this.eventBus.next(event);
  }
  
  on<T>(eventType: string): Observable<T> {
    return this.eventBus.pipe(
      filter(e => e.type === eventType),
      map(e => e.payload as T)
    );
  }
}
```

### 2. Props Passing

The root configuration can pass props to microfrontends:

```typescript
registerApplication({
  name: "@app/form",
  app: () => import("form/module"),
  activeWhen: ["/form"],
  customProps: { initialData: {...} }
});
```

### 3. URL Routing

Applications can communicate through URL parameters and path changes.

## Deployment Architecture

Each microfrontend can be:
- Developed independently
- Tested independently
- Built independently
- Deployed independently

The deployment workflow involves:
1. Building each microfrontend separately
2. Publishing the built assets to a common CDN or separate hosts
3. Deploying the root configuration that references these deployed microfrontends

## Development Workflow

1. **Local Development**
   - Run microfrontends in standalone mode for isolated development
   - Run the entire application with proxied microfrontends for integration testing

2. **Shared Development**
   - Use the shared module for cross-cutting concerns
   - Enforce common conventions through linting and formatting tools

3. **Testing Strategy**
   - Unit tests for individual components
   - Integration tests for microfrontend boundaries
   - End-to-end tests for full application flows

## Scalability Considerations

1. **Adding New Microfrontends**
   - Register in the root configuration
   - Add to the layout definition
   - Implement using the established patterns

2. **Performance Optimization**
   - Shared dependencies through Module Federation
   - Lazy loading of microfrontends
   - Optimized bundle sizes

## Future Enhancements

1. **Framework Agnostic**
   - Support for multiple frameworks (React, Vue) alongside Angular
   - Consistent styling across different framework implementations

2. **Advanced State Management**
   - Implementation of more sophisticated state management solutions
   - Better cross-microfrontend data persistence

3. **Advanced Routing**
   - Nested routing within microfrontends
   - More complex layout compositions

## Conclusion

This architecture provides a scalable, maintainable approach to building complex web applications using microfrontends. The single-spa framework, combined with Angular and Module Federation, enables teams to work independently while delivering a cohesive user experience. 