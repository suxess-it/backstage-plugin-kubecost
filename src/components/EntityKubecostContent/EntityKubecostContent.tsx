import React from 'react';
import { 
    Typography,
    Grid, Link
} from '@material-ui/core';
import {
  InfoCard,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { KubecostFetchComponent } from '../KubecostFetchComponent';
import {configApiRef, useApi} from "@backstage/core-plugin-api";

export const EntityKubecostContent = () => {
    const configApi = useApi(configApiRef);
    const baseUrl = configApi.getString('kubecost.baseUrl');
    const showDashboardLink = configApi.getOptionalBoolean('kubecost.showDashboardLink') ?? false;
    return (
        <Content>
            <ContentHeader title="Kubecost Plugin">
                <SupportButton>A description of your plugin goes here.</SupportButton>
            </ContentHeader>
            <Grid container spacing={3} direction="column">
                <Grid item>
                    <InfoCard title="Plugin Information ">
                        <Typography variant="body1">
                            Get Insights about cost consumption for your component.
                        </Typography>
                        {showDashboardLink && (
                            <Typography variant="body2">
                                For additional insights about consumption for your component, please visit the <Link href={baseUrl} target="_blank">Kubecost dashboard</Link>.
                            </Typography>
                        )}
                    </InfoCard>
                </Grid>
                <Grid item>
                    <KubecostFetchComponent/>
                </Grid>
            </Grid>
        </Content>
    )
}

