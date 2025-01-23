import * as React from 'react'

import '../../App.scss'

import txt from '../../locale/locale'
import { exportData } from '../../utils/exportData'
import formatDateTime from '../../utils/formatDateTime'
import lookupPlayer from '../../utils/lookupPlayer'
import displayMatrix from '../../utils/hitMatrix'

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
              <pre>
                * * * HIT MATRIX * * *
                <br />
                <br />
                {displayMatrix(props.hits, props.msgs)}
                <br />
                <br />
                * * * {txt('logHits', props.lang).toUpperCase()} * * *
                <br />
                <br />
                {props.hits?.map((hit, i) => {
                  return (
                    <span key={i}>
                      {formatDateTime(hit.timestamp)}:&nbsp;
                      {lookupPlayer(hit?.victimId, props.msgs)}&nbsp;({hit?.victimId?.toString(16).toUpperCase()})&nbsp;
                      {txt('logHitsInfo', props.lang)}&nbsp;
                      {lookupPlayer(hit?.attackerId, props.msgs)}&nbsp;({hit?.attackerId?.toString(16).toUpperCase()})&nbsp;
                      <br />
                    </span>)
                })}
              </pre>
            </div>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={4} style={{marginLeft: '0px'}}>
          <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
            <Button variant="contained" size="small" onClick={() => exportData(true, false, props.lang, props.rows, props.msgs, props.hits)} style={{minWidth: '100%', overflow: 'hidden'}}> 
              {txt('exportAll', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default MainTabHitLog;
