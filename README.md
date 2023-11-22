# Kubecost
## Introduction

Kubecost is a plugin to help engineers get information about cost usage/prediction of their deployment.

# Setup

## Kubecost Installation:

In order to use this Backstage Plugin you have to [install Kubecost](https://docs.kubecost.com/install-and-configure/install/getting-started)

- Activate [Annotation Emission](https://docs.kubecost.com/install-and-configure/advanced-configuration/annotations)
- Add Cost Model [Cloud](https://docs.kubecost.com/install-and-configure/install/cloud-integration) or [onPremises](https://docs.kubecost.com/install-and-configure/install/provider-installations/air-gapped#how-do-i-configure-prices-for-my-on-premise-assets)

Optional: For Network Cost gathering you will need to [Network Traffic Cost Allocation network transfer](https://docs.kubecost.com/using-kubecost/navigating-the-kubecost-ui/cost-allocation/network-allocation) to pods.

## Plugin Installation:
Add the plugin to your frontend app:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @suxess-it/backstage-plugin-kubecost
```

# Configure Backstage 
Adapt `app-config.yaml`:

Kubecost requires configuration field: `kubecost` with valid `baseUrl` to kubecost API.

Optional Settings:
- `sharedNamespaces` // add shared namespaces, from  which cost will be shared across client namespaces
- `queryframes` // add Duration of time over which to query. Accepts words like today, week, month, yesterday, lastweek, lastmonth; durations like 30m, 12h, 7d ... {more details from official API Reference}(https://docs.kubecost.com/apis/apis-overview/allocation)
- `unitprefix` // add Currency. Accepts $, €, ...

```yaml
## ./app-config.yaml
kubecost:
  baseUrl: https://<base URL to Kubecost> 
  sharedNamespaces: <comma-separated list of namespaces>
  queryframes: <comma-separated list of queries>(e.g. week,yesterday,month,today,lastweek)
  unitprefix: '<unit>' (e.g. $, €(=default) )
```

# Import Plugin and embed in the entities page:
```typescript
// packages/app/src/components/catalog/EntityPage.tsx

import { 
  BackstagePluginKubecostPage,
  isKubecostAvailable
} from '@suxess-it/backstage-plugin-kubecost';

// ...

// add this section to the place where the serviceEntityPage gets defined
// const serviceEntityPage = (
// ...
    <EntityLayout.Route if={isKubecostAvailable} path="/kubecost" title="Kubecost">
      <BackstagePluginKubecostPage/>
    </EntityLayout.Route>
```

# Display cost information on a component page
Adding the `EntityKubecostCard` component to an entity's page will display usage to cost of last week.
```typescript
// packages/app/src/components/catalog/EntityPage.tsx

import { 
  EntityKubecostCard,
  isKubecostAvailable
} from '@suxess-it/backstage-plugin-kubecost';

// ...

// add this section to the place where the overviewContent gets defined
// const overviewContent = (
// ... 
    <EntitySwitch>
      <EntitySwitch.Case if={isKubecostAvailable}>
        <EntityKubecostCard />
      </EntitySwitch.Case>
    </EntitySwitch>
```
# Configuration
Kubecost Plugin are correlated to Backstage entities using an annotation added in the entity's `catalog-info.yaml` file:

```yml
annotations:
  kubecost.com/deployment-name: '"my-kubernetes-deployment-name"'
```

Please add Label `app:<my-kubernetes-deployment-name>` to deployment, then this annotation accepts any valid deploymentname on your k8s Cluster.

![Screenshot](./docs/screenshot.png)

# TODO
Still a lot of work to be done:
- add additional annotation for namespaces
...
