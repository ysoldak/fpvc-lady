import * as React from 'react'

import '../../App.scss'

import txt from '../../locale/locale'
import { exportData } from '../../utils/exportData'
import formatDateTime from '../../utils/formatDateTime'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

function MainTabHitLog(props) {
  return (
    <div>
      <Box sx={{ p: 1 }}>
        <Card variant="outlined" className="fpvcm-card-wrapper">
          <CardContent className="fpvcm-card fpvcm-disp-log">
            <div display="block" style={{whiteSpace: "nowrap"}}>
              {props.hits?.map((hit, i) => {
                return (
                  <pre key={i}>
                    {hit?.victimId?.toString(16).toUpperCase()} {txt('logHitsInfo', props.lang)} {hit?.attackerId?.toString(16).toUpperCase()}, {formatDateTime(hit.timestamp)}<br />
                  </pre>)
              })}
            </div>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={4} style={{marginLeft: '0px'}}>
          <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
            <Button variant="contained" size="small" onClick={() => exportData(false, false, props.lang, props.rows, props.msgs)} style={{minWidth: '100%', overflow: 'hidden'}}> 
              {txt('exportLast', props.lang)}
            </Button>
          </Grid>
          <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
            <Button variant="contained" size="small" onClick={() => exportData(true, false, props.lang, props.rows, props.msgs)} style={{minWidth: '100%', overflow: 'hidden'}}> 
              {txt('exportAll', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default MainTabHitLog;
