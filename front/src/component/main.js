import * as React from 'react'

import '../App.scss'

import txt from '../locale/locale.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Slider from '@mui/material/Slider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

function Main(props) {
  const [tab, setTab] = React.useState(0)

  const switchTab = (event, tab) => {
    setTab(tab);
  };

  function createData(
    playerName,
    playerId,
    hits,
    damage,
  ) {
    const score = ((hits * 5) - (damage * 1))
    return { playerName, playerId, hits, damage, score };
  }
  
  const rows = [
    createData('Zborek', 'C4', 10, 5, 45),
    createData('Bjoern', 'D2', 5, 5, 20),
    createData('Matteo', 'E1', 20, 5, 95),
    createData('Yurii', 'F9', 10, 5, 45),
  ];

  console.log(props)

  return (
    <Box className="fpvcm-container_box">
      <br />
      <Grid container spacing={4}>
        <Grid xl={2} lg={2} md={3} sm={3} xs={3} className="fpvcm-option-label">
          <span className="fpvcm-input-label">{txt('setRoundTime', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={8} sm={8} xs={8}>
          <Slider
            defaultValue={props.config.defaultRoundTime}
            min={120}
            max={600}
            step={null}
            marks={props.roundTimeMarks}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid xl={2} lg={2} md={3} sm={3} xs={3} className="fpvcm-option-label">
          <span className="fpvcm-input-label">{txt('setCountdown', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={8} sm={8} xs={8}>
          <Slider
            defaultValue={props.config.defaultCountDown}
            min={10}
            max={120}
            step={null}
            marks={props.countDownMarks}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid xl={7} lg={7} md={11} sm={11} xs={11}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={switchTab} sx={{color: 'red'}}>
                <Tab label="Stats" id="fpvcmTab0"  />
                <Tab label="Log" id="fpvcmTab1" />
              </Tabs>
            </Box>
              <div
                role="tabpanel"
                index={0}
                hidden={tab !== 0}
                id={`fpvcmTab${tab}`}
              >
                <Box sx={{ p: 1 }}>
                  <Card variant="outlined" className="fpvcm-card-wrapper">
                    <CardContent className="fpvcm-card fpvcm-disp-stats">
                      <TableContainer component={Paper} style={{maxWidth: 450}}>
                        <Table size="small" className="fpvcm-table-bg" >
                          <TableHead>
                            <TableRow>
                              <TableCell className="fpvcm-table-header-cell">Player</TableCell>
                              <TableCell align="right" className="fpvcm-table-header-cell">Hits</TableCell>
                              <TableCell align="right" className="fpvcm-table-header-cell">Damage</TableCell>
                              <TableCell align="right" className="fpvcm-table-header-cell">Score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => (
                              <TableRow
                                key={row.playerId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                style={{color: 'white'}}
                              >
                                <TableCell component="th" scope="row" style={{color: 'white'}}>
                                  {row.playerName}&nbsp;<span className="fpvcm-label">({row.playerId})</span>
                                </TableCell>
                                <TableCell align="right" style={{color: 'white'}}>{row.hits}</TableCell>
                                <TableCell align="right" style={{color: 'white'}}>{row.damage}</TableCell>
                                <TableCell align="right" style={{color: 'white'}}>{row.score}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography display="block">
                        Game time: 2:30<br />
                        Total hits: 13<br />
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </div>
              <div
                role="tabpanel"
                index={1}
                hidden={tab !== 1}
                id={`fpvcmTab${tab}`}
              >
                <Box sx={{ p: 1 }}>
                  <Card variant="outlined" className="fpvcm-card-wrapper">
                    <CardContent className="fpvcm-card fpvcm-disp-log">
                      <Typography display="block" style={{whiteSpace: "nowrap"}}>
                        2024/07/12 13:06:46.432333 DAMAG B2 50<br />
                        2024/07/12 13:06:46.499520 CLAIM D2 4<br />
                        2024/07/12 13:06:46.432333 DAMAG B2 50<br />
                        2024/07/12 13:06:46.499520 SOME ADDITIONAL AND VERY LONG MESSAGE HERE...<br />
                        2024/07/12 13:06:46.432333 DAMAG B2 50<br />
                        2024/07/12 13:06:46.499520 CLAIM D2 4<br />
                        2024/07/12 13:06:46.499520 SCORE D2<br />
                        2024/07/12 13:06:46.499520 SOME ADDITIONAL AND VERY LONG MESSAGE HERE...<br />
                        2024/07/12 13:06:46.499520 CLAIM D2 4<br />
                        2024/07/12 13:06:46.432333 DAMAG B2 50<br />
                        2024/07/12 13:06:46.499520 CLAIM D2 4<br />
                        2024/07/12 13:06:46.499520 SCORE D2<br />
                        2024/07/12 13:06:46.499520 SCORE D2<br />
                        2024/07/12 13:06:46.432333 DAMAG B2 50<br />
                        2024/07/12 13:06:46.499520 CLAIM D2 4<br />
                        2024/07/12 13:06:46.499520 SCORE D2<br />
                        2024/07/12 13:06:46.499520 SCORE D2<br />
                        2024/07/12 13:06:46.499520 SOME ADDITIONAL AND VERY LONG MESSAGE HERE...<br />
                        2024/07/12 10:49:51.614043 REGST A1 SKYBEE__<br />
                        2024/07/12 10:53:40.660985 REGST B1 FPV_COMBAT<br />
                        2024/07/12 10:54:18.748333 REGST D2 SKYBEE__<br />
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </div>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid xl={7} lg={7} md={12} sm={12} xs={12} style={{textAlign: 'center', paddingTop: '22px'}}>
          <Button variant="contained" size="large">
            {txt('startStop', props.config.lang)}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Main;
