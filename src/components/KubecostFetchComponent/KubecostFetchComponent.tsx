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


type Metrics = {
  minutes?: string;
  cpuCost?: string;
  ramCost?: string;
  networkCost?: string;
  pvCost?: string;
  gpuCost?: string;
  totalCost?: string;
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
  const sharedNamespaces = configApi.getString('kubecost.sharedNamespaces');
  const timeframes = configApi.getString('kubecost.timeframes');
  const rawwindows = timeframes?.split(',')?.map(p => p.trim()) ?? [];
  const accu = "false,true" 
  const rawaccu = accu?.split(',')?.map(p => p.trim()) ?? [];

  const [selectedWindow, setselectedWindow] = useState<string>(
    rawwindows ? rawwindows[0] : '',
  );

  const [selectedAccu, setselectedAccu] = useState<string>(
    rawaccu ? rawaccu[0] : '',
  );

  function getMetrics(data: any): Metrics {
    const round = (num: number) => +(Math.round(num * 1000) / 1000).toFixed(4);
    return {
      timeframe: `${data?.start ?? ''} to ${data?.end ?? ''}`,
      totalCost: `€ ${round(data?.totalCost ?? 0)}`,
      cpuCost: `€ ${round(data?.cpuCost ?? 0)}`,
      ramCost: `€ ${round(data?.ramCost ?? 0)}`,
      networkCost: `€ ${round(data?.networkCost ?? 0)}`,
      pvCost: `€ ${round(data?.pvCost ?? 0)}`,
      gpuCost: `€ ${round(data?.gpuCost ?? 0)}`,
      sharedCost: `€ ${round(data?.sharedCost ?? 0)}`,
      minutes: (data?.minutes ?? 0),
      totalEfficiency: `${(data?.totalEfficiency ?? 0)*100} %`,
    };
  };

  const onSelectedWindowChange = (window: string) => {
    setselectedWindow(window);
  };
  const onSelectedAccuChange = (accu: string) => {
    setselectedAccu(accu);
  };

  const api = `${baseUrl}/model/allocation?window=${selectedWindow}&accumulate=${selectedAccu}&idle=false&shareIdle=false&shareNamespaces=${sharedNamespaces}&filter=label%5Bapp%5D:"${deployName}"+controllerKind:deployment`;
  //const api = useMemo(() => `${baseUrl}/model/allocation?window=${selectedWindow}&accumulate=false&idle=false&shareIdle=false&shareNamespaces=${sharedNamespaces}&filter=label%5Bapp%5D:"${deployName}"+controllerKind:deployment`, [baseUrl, selectedWindow, sharedNamespaces, deployName]);


//const [metrics, setMetrics] = useState<Metrics[]>([]);
const { value = [], loading, error } = useAsync(async (): Promise<Metrics[]> => {
  const response = await fetch(api).then(res => res.json());
  const metricsPromises: Promise<Metrics>[] = Object.entries(response?.data).map(async ([id, ref]) => {
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
