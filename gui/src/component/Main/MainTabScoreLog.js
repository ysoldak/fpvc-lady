import * as React from 'react'
import { useState } from 'react'

import txt from '../../locale/locale'

import { exportData, formatLine } from '../../utils/exportData'

import '../../App.scss'

import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ClearIcon from '@mui/icons-material/Clear'

import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

function MainTabLog(props) {

  const [formatted, setFormatted] = useState(false)

  function formatLogLine(line) {
    try {
      return formatLine(JSON.parse(line))
    }
    catch {
      return line
    }
  }

  function clearLogs(confirmed=false) {
    if (!confirmed) {
      props.setConfirmModal({
        show: true,
        title: txt('clearLog', props.lang),
        contents: txt('clearLogSure', props.lang),
        callBack: () => clearLogs(true)
      })
      return
    }
    props.clearLog()
  }

  return (
    <div style={{position: 'relative'}}>
      <div className="fpvcm-log-format-switch">
      {txt('formatted', props.lang)}:&nbsp;
        <Switch
          name="formatLogs"
          variant="outlined"
          checked={formatted}
          onClick={() => setFormatted(!formatted)}
      />
      </div>
      <Box sx={{ p: 1 }}>
        <Card variant="outlined" className="fpvcm-card-wrapper">
          <CardContent className="fpvcm-card fpvcm-disp-log">
            <div display="block" style={{whiteSpace: "nowrap"}}>
              <pre>
                {props.log.map((logLine, i) => <span key={i}>{formatted ? formatLogLine(logLine) : logLine}<br /></span>)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={2} style={{marginLeft: '0px'}}>
          <Grid xl={4} lg={4} md={4} sm={4} xs={12} style={{paddingTop: '22px', fontSize: '0.75em'}}>
            <Button variant="contained" size="small" onClick={() => exportData(false, false, props.lang, props.rows, props.msgs, [], formatted)} className="fpvcm-export-btn"> 
              <FileDownloadIcon />
              {txt('exportLast', props.lang)}
            </Button>
          </Grid>
          <Grid xl={4} lg={4} md={4} sm={4} xs={12} style={{paddingTop: '22px', fontSize: '0.75em'}}>
            <Button variant="contained" size="small" onClick={() => exportData(true, false, props.lang, props.rows, props.msgs, [], formatted)} className="fpvcm-export-btn"> 
              <FileDownloadIcon />
              {txt('exportAll', props.lang)}
            </Button>
          </Grid>
          <Grid xl={4} lg={4} md={4} sm={4} xs={12} style={{paddingTop: '22px', fontSize: '0.75em'}}>
            <Button variant="contained" size="small" onClick={() => clearLogs(false)} className="fpvcm-export-btn"> 
              <ClearIcon />
              {txt('clearLog', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default MainTabLog;
