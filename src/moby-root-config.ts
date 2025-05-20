import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    const moduleMap = {
      //module federation
      "@app/list": () => import("list/module"),
      "@app/form": () => import("form/module"),
      "@app/navBar": () => import("navBar/module"),

      //non-module federation
      "@app/app1": () => System.import("http://localhost:4203/main.js"),
      "@app/app2": () => System.import("http://localhost:4204/main.js"),
    };
    return moduleMap[name]();
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();

start({
  urlRerouteOnly: true,
});
