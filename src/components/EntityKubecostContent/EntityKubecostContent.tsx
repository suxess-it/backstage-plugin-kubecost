import React from 'react';
import { 
    Typography,
    Grid 
} from '@material-ui/core';
import {
  InfoCard,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { KubecostFetchComponent } from '../KubecostFetchComponent';

export const EntityKubecostContent = () => (


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
          </InfoCard>
        </Grid>
        <Grid item>
          <KubecostFetchComponent />
        </Grid>
      </Grid>
    </Content>
    

);
