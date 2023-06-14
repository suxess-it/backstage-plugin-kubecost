import React from 'react';
import { 
  Grid,
  Card,
} from '@material-ui/core';
import {
  InfoCard,
} from '@backstage/core-components';

import { KubecostFetchComponent } from '../KubecostFetchComponent';

export const KubecostCard = () => (
  <Grid container spacing={3} direction="column">
    <Grid item>
      <InfoCard title="Cost Information">
        <Card>
          <KubecostFetchComponent />
        </Card>
      </InfoCard>
    </Grid>
  </Grid>
);

