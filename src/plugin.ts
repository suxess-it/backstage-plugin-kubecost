import { createPlugin, createRoutableExtension, createComponentExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const backstagePluginKubecostPlugin = createPlugin({
  id: 'backstage-plugin-kubecost',
  routes: {
    root: rootRouteRef,
  },
});

export const BackstagePluginKubecostPage = backstagePluginKubecostPlugin.provide(
  createRoutableExtension({
    name: 'BackstagePluginKubecostPage',
    component: () =>
      import('./components/EntityKubecostContent').then(m => m.EntityKubecostContent),
    mountPoint: rootRouteRef,
  }),
);

/** @public */
export const EntityKubecostCard = backstagePluginKubecostPlugin.provide(
  createComponentExtension({
    name: 'EntityKubecostCard',
    component: {
      lazy: () =>
        import('./components/KubecostCard').then(
          m => m.KubecostCard,
        ),
    },
  }),
);


