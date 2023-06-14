import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { backstagePluginKubecostPlugin, BackstagePluginKubecostPage } from '../src/plugin';

createDevApp()
  .registerPlugin(backstagePluginKubecostPlugin)
  .addPage({
    element: <BackstagePluginKubecostPage />,
    title: 'Root Page',
    path: '/backstage-plugin-kubecost'
  })
  .render();
