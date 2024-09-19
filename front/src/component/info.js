import * as React from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'

function Info(props) {

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4}>
        <Grid xl={12} lg={12} md={12} sm={12} xs={12} className="fpvcm-loading">
          {props.info}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Info;
