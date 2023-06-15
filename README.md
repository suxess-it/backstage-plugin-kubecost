# Kubecost

Kubecost is a plugin to help engineers get information about cost of their deployment.

# Setup

# Kubecost installation:

In order to use this Plugin you neet to [install Kubecost](https://docs.kubecost.com/install-and-configure/install/getting-started)

You will need to activate [Annotation Emission](https://docs.kubecost.com/install-and-configure/advanced-configuration/annotations)

Optional: For Network Cost gathering you will need to [allocate network transfer](https://docs.kubecost.com/install-and-configure/advanced-configuration/network-costs-configuration) to pods.

# Plugin Installation:
Add the plugin to your frontend app:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @suxess-it/backstage-plugin-kubecost
```

# Configure Backstage 
Adapt `app-config.yaml`:

Kubecost requires configuration field: `kubecost` with valid `baseUrl` to kubecost API.
Optional: add shared namespaces -  of namespaces, which cost will be shared across client namespaces

```yaml
## ./app-config.yaml
kubecost:
  baseUrl: https//<base URL to Kubecost> 
  sharedNamespaces: <comma-separated list of namespaces>
```

# Import Plugin and embed in the entities page:
```typescript
// packages/app/src/components/catalog/EntityPage.tsx

import { 
  BackstagePluginKubecostPage,
  isKubecostAvailable
} from '@suxess-it/plugin-backstage-plugin-kubecost';

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
  KubecostCard,
  isKubecostAvailable
} from '@suxess-it/plugin-backstage-plugin-kubecost';

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

This annotation accepts any valid deploymentname on k8s Cluster.

# TODO
Still a lot of work to be done:
- add select for timeframe
- add annotation for namespaces
...
