import React, { useState } from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
  Content,
  Page,
} from '@backstage/core-components';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { deploymentName } from '../useAppData';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Select } from '../Select';
import {useGetAnnotationDeploymentName} from "../../../customConfig";


type Metrics = {
  minutes?: string;
  cpuCost?: string;
  ramCost?: string;
  networkCost?: string;
  pvCost?: string;
  gpuCost?: string;
  totalCost?: string;
  deployment?: string;
  sharedCost?: string;
  totalEfficiency?: string;
  timeframe?: string;
};

type DenseTableProps = {
  metrics: Metrics[];
};

export const KubecostFetchComponent = () => {
  const { entity } = useEntity();
  const { fetch } = useApi(fetchApiRef);
  const deployName = deploymentName(entity);
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('kubecost.baseUrl');
  const sharedNamespaces = configApi.getOptionalString('kubecost.sharedNamespaces') ?? '';
  const timeframes = configApi.getOptionalString('kubecost.queryframes') ?? 'today,week,yesterday';
  const unitprefix = configApi.getOptionalString('kubecost.unitprefix') ?? '€';
  const fractionDigits = configApi.getOptionalNumber('kubecost.fractionDigits') ?? 4;
  const shareTenancyCosts = configApi.getOptionalBoolean('kubecost.shareTenancyCosts') ?? false;
  const aggregate = configApi.getOptionalBoolean('kubecost.aggregate') ?? false;
  const rawwindows = timeframes?.split(',')?.map(p => p.trim()) ?? [];
  const accu = "true,false" 
  const rawaccu = accu?.split(',')?.map(p => p.trim()) ?? [];

  const [selectedWindow, setselectedWindow] = useState<string>(
    rawwindows ? rawwindows[0] : '',
  );

  const [selectedAccu, setselectedAccu] = useState<string>(
    rawaccu ? rawaccu[0] : '',
  );

  function getMetrics(data: any): Metrics {
    const round = (num: number) => +(Math.round(num * 1000) / 1000).toFixed(fractionDigits);

    return {
      timeframe: `${data?.start ?? ''} to ${data?.end ?? ''}`,
      deployment: `${data?.properties.controller ?? ''}`,
      totalCost: `${unitprefix} ${round(data?.totalCost ?? 0)}`,
      cpuCost: `${unitprefix} ${round(data?.cpuCost ?? 0)}`,
      ramCost: `${unitprefix} ${round(data?.ramCost ?? 0)}`,
      networkCost: `${unitprefix} ${round(data?.networkCost ?? 0)}`,
      pvCost: `${unitprefix} ${round(data?.pvCost ?? 0)}`,
      gpuCost: `${unitprefix} ${round(data?.gpuCost ?? 0)}`,
      sharedCost: `${unitprefix} ${round(data?.sharedCost ?? 0)}`,
      minutes: (data?.minutes ?? 0),
      totalEfficiency: `${round((data?.totalEfficiency ?? 0)*100).toFixed(fractionDigits)} %`,
    };
  };

  const onSelectedWindowChange = (window: string) => {
    setselectedWindow(window);
  };
  const onSelectedAccuChange = (accu: string) => {
    setselectedAccu(accu);
  };

  const api = `${baseUrl}/model/allocation?` +
      `window=${selectedWindow}&` +
      `accumulate=${selectedAccu}&` +
      `idle=false&` +
      `shareIdle=false&` +
      `${aggregate? 'aggregate=controller&': ''  }` +
      `shareNamespaces=${sharedNamespaces}&` +
      `shareTenancyCosts=${shareTenancyCosts}&` +
      `filter=label%5B${useGetAnnotationDeploymentName()}%5D:"${deployName}"+controllerKind:deployment`;

  const { value = [], loading, error } = useAsync(async (): Promise<Metrics[]> => {
    const response = await fetch(api).then(res => res.json());
    const flatResponse = {
      data: response.data
          .filter((obj: null | Array<{ [key: string]: any }>) => obj !== null && obj !== undefined)
          .flatMap((obj: Array<{ [key: string]: any }>) => Object.entries(obj).map(([key, value]) => ({[key]: value})))
    };

  const metricsPromises: Promise<Metrics>[] = Object.entries(flatResponse?.data).map(async ([id, ref]) => {
    const nn = Object.keys(ref ?? {})[0];
    const typedRef = ref as { [key: string]: { id: string, name: string } };
    const val = typedRef?.[nn];
    return getMetrics(val);
  });
  const metrics = await Promise.all(metricsPromises);
  return metrics;
}, [api]);

  return (
    <Page themeId="tool">
      <Content noPadding>

          <Select
            value={selectedWindow}
            onChange={window => onSelectedWindowChange(window)}
            label="Data Selection Window "
            items={rawwindows.map(p => ({ label: p, value: p }))}
          />
          <Select
            value={selectedAccu}
            onChange={accu => onSelectedAccuChange(accu)}
            label="Accumulate Data"
            items={rawaccu.map(p => ({ label: p, value: p }))}
          />
          {loading ? <Progress /> : error ? <ResponseErrorPanel error={error} /> : <DenseTable metrics={value} />}

      </Content>
    </Page>
  );
};

export const DenseTable = ({ metrics }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Timeframe', field: 'timeframe' },
    { title: 'Deployment', field: 'deployment' },
    { title: 'Total Cost', field: 'total' },
    { title: 'CPU Cost', field: 'cpu' },
    { title: 'Memory Cost', field: 'ram' },
    { title: 'PV Cost', field: 'pv' },
    { title: 'Network Cost', field: 'network' },
    { title: 'GPU Cost', field: 'gpu' },
    { title: 'Shared Cost', field: 'shared' },
    { title: 'Runtime in Minutes', field: 'minutes' },
    { title: 'Efficiency', field: 'totalEfficiency' },
  ];

  const data = metrics.map(metric => ({
    timeframe: metric.timeframe,
    deployment: metric.deployment,
    shared: metric.sharedCost,
    minutes: metric.minutes,
    cpu: metric.cpuCost,
    ram: metric.ramCost,
    network: metric.networkCost,
    pv: metric.pvCost,
    gpu: metric.gpuCost,
    total: metric.totalCost,
    totalEfficiency: metric.totalEfficiency,
  }));

  return (
    <Table
      title='Cost by Deployment'
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
