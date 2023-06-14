import React from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { deploymentName } from '../useAppData';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';

type Metrics = {
  cpuCost?: string;
  ramCost?: string;
  networkCost?: string;
  pvCost?: string;
  gpuCost?: string;
  totalCost?: string;
  totalEfficiency?: number;
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

  const round = (num: number) => +(Math.round(num * 100) / 100).toFixed(2);

  const getMetrics = (data: any): Metrics => {
    return {
      timeframe: `${data?.start ?? ''} to ${data?.end ?? ''}`,
      cpuCost: `€ ${round(data?.cpuCost ?? 0)}`,
      ramCost: `€ ${round(data?.ramCost ?? 0)}`,
      networkCost: `€ ${round(data?.networkCost ?? 0)}`,
      pvCost: `€ ${round(data?.pvCost ?? 0)}`,
      gpuCost: `€ ${round(data?.gpuCost ?? 0)}`,
      totalCost: `€ ${round(data?.totalCost ?? 0)}`,
      totalEfficiency: round(data?.totalEfficiency ?? 0),
    };
  };
  
  const getData = async (): Promise<Metrics[]> => {
    const api = `${baseUrl}/model/allocation?window=1w&accumulate=true&shareIdle=false&filter=label%5Bapp%5D:"${deployName}"+controllerKind:deployment`;
    const response = await fetch(api).then(res => res.json());
    const key = Object.keys(response?.data ?? {})[0];
    const data = response?.data?.[key]?.[Object.keys(response?.data?.[key] ?? {})[0]];
    return [getMetrics(data)];
  };
  const { value = [], loading, error } = useAsync(() => getData(), []);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  console.log(value);
  return <DenseTable metrics={value} />;
};

export const DenseTable = ({ metrics }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Timeframe', field: 'timeframe' },
    { title: 'CPU Cost', field: 'cpu' },
    { title: 'Memory Cost', field: 'ram' },
    { title: 'Network Cost', field: 'network' },
    { title: 'PV Cost', field: 'pv' },
    { title: 'GPU Cost', field: 'gpu' },
    { title: 'Total Cost', field: 'total' },
    { title: 'Efficiency', field: 'totalEfficiency' },
  ];

  const data = metrics.map(metric => ({
    timeframe: metric.timeframe,
    cpu: metric.cpuCost,
    ram: metric.ramCost,
    network: metric.networkCost,
    pv: metric.pvCost,
    gpu: metric.gpuCost,
    total: metric.totalCost,
    totalEfficiency: metric.totalEfficiency,
  }));
  console.log();

  return (
    <Table
      title="Deployment cost last week"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
