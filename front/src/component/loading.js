import * as React from 'react'

import animation from '../img/loading.gif'

import txt from '../locale/locale.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'

function Loading(props) {

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4}>
        <Grid xl={12} lg={12} md={12} sm={12} xs={12} className="fpvcm-loading">
          <img src={animation} alt="Loading" style={{maxHeight: '45px'}} /><br />
          {txt('loading', props.lang)}...
        </Grid>
      </Grid>
    </Box>
  );
}

export default Loading;
