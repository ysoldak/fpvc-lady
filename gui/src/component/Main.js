import * as React from 'react'

import '../App.scss'

import txt from '../locale/locale'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
// import Slider from '@mui/material/Slider'
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
  const [rows, setRows] = React.useState([])
  const [game, setGame] = React.useState('stop')

  const switchTab = (event, tab) => {
    setTab(tab)
  }

  const gameToggle = () => (game === 'stop' ? 'start' : 'stop')

  function createData(
    playerName,
    playerId,
    playerDesc,
    hits,
    damage,
    lives
  ) {
    const score = ((hits * props.config.hitPoints) + (damage * props.config.damagePoints))
    return { playerName, playerId, playerDesc, hits, damage, lives, score }
  }

  function comparePoints(a, b) {
    if (parseInt(a.score) < parseInt(b.score)) { return 1 }
    if (parseInt(a.score) > parseInt(b.score)) { return -1 }
    return 0
  }

  function downloadData(full) {
    let filename = 'fpvcombat_session_' + new Date().toJSON().slice(0,19).replace('T', '__')
    filename += full ? '__all' : ''
    let type = 'text'
    let data = ''
    if (props.msgs.length > 0) {
      data = full ? props.msgs.join('\n\n') : props.msgs[0]
    }
    var file = new Blob([data], {type: type})
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      var a = document.createElement("a")
      var url = URL.createObjectURL(file)
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      setTimeout(function() {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 0) 
    }
  }

  React.useEffect(() => {
    if (props.msgs.length > 0) {
      let rows = props.msgs[0].split('\n').filter((e, i) => i > 1 && e.length > 0).map((msg, i) => {
        let line = msg.split(/\|\s*/).map(e => e.trim()).filter(e => e.length > 0)
        return createData(line[1], line[0], line[2], line[4], line[5], line[6])
      })
      setRows(rows.sort(comparePoints))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.msgs])

  return (
    <Box className="fpvcm-container_box">
      <br />
      {/*(props.isAdmin && props.ladyUp) && (
        <>
          <Grid container spacing={4}>
            <Grid xl={2} lg={2} md={3} sm={3} xs={3} className="fpvcm-option-label">
              <span className="fpvcm-input-label">{txt('setRoundTime', props.config.lang)}:</span>
            </Grid>
            <Grid xl={4} lg={4} md={8} sm={8} xs={8}>
              <Slider
                defaultValue={props.config.defaultRoundTime}
                onChange={(e) => props.updateGameConfig(e, 'roundTime')}
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
                onChange={(e) => props.updateGameConfig(e, 'countdown')}
                min={10}
                max={120}
                step={null}
                marks={props.countDownMarks}
              />
            </Grid>
          </Grid>
        </>
      )*/}
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
                      {!props.ladyUp && (<span style={{color: "red", fontWeight: "bold"}}>{txt('ladyNotOn', props.config.lang)}</span>)}
                      {props.ladyUp && (
                        <>
                          <TableContainer component={Paper} style={{maxWidth: 750}}>
                            <Table size="small" className="fpvcm-table-bg" >
                              <TableHead>
                                <TableRow>
                                  <TableCell className="fpvcm-table-header-cell">{txt('player', props.config.lang)}</TableCell>
                                  <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('desc', props.config.lang)}</TableCell>
                                  <TableCell align="right" className="fpvcm-table-header-cell">{txt('hits', props.config.lang)}</TableCell>
                                  <TableCell align="right" className="fpvcm-table-header-cell">{txt('damage', props.config.lang)}</TableCell>
                                  <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('lives', props.config.lang)}</TableCell>
                                  <TableCell align="right" className="fpvcm-table-header-cell">{txt('score', props.config.lang)}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {rows.map((row, i) => (
                                  <TableRow
                                    key={i}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    style={{color: 'white'}}
                                  >
                                    <TableCell component="th" scope="row" className="fpvcm-table-cell">
                                      {row.playerName}&nbsp;<span className="fpvcm-label">({row.playerId})</span>
                                    </TableCell>
                                    <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.playerDesc}</TableCell>
                                    <TableCell align="right" className="fpvcm-table-cell">{row.hits}</TableCell>
                                    <TableCell align="right" className="fpvcm-table-cell">{row.damage}</TableCell>
                                    <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.lives}</TableCell>
                                    <TableCell align="right" className="fpvcm-table-cell">{row.score}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <Typography display="block" style={{fontWeight: 'bold', paddingTop: '12px'}}>
                            {props.game?.roundStatus === 'on' && (<>{txt('roundPending', props.config.lang)}<br /></>)}
                            {/*props.game?.roundStatus === 'on' && (<>{txt('currentRoundTime', props.config.lang)}: <span className="fpvcm-label">2:42</span><br /></>)*/}
                            {/*props.game?.roundEndAt !== '0' && (<>{txt('remainingRoundTime', props.config.lang)}: <span className="fpvcm-label">2:18</span><br /></>)*/}
                            {txt('totalHits', props.config.lang)}: <span className="fpvcm-label">{rows.reduce((total, row) => total += parseInt(row.hits), 0)}</span><br />
                          </Typography>
                        </>
                      )}
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
                      <div display="block" style={{whiteSpace: "nowrap"}}>
                        {props.msgs.map((msg, i) => {
                          return (
                            <pre key={i}>{msg.split('\n').map((msgLine, li) => { 
                              return (<span key={li}>{msgLine}<br /></span>)})}
                              <br />
                            </pre>)
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ p: 1 }}>
                  <Grid container spacing={4} style={{marginLeft: '0px'}}>
                    <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
                      <Button variant="contained" size="small" onClick={() => downloadData(false)} style={{minWidth: '100%', overflow: 'hidden'}}> 
                        {txt('exportLast', props.config.lang)}
                      </Button>
                      </Grid>
                      <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
                      <Button variant="contained" size="small" onClick={() => downloadData(true)} style={{minWidth: '100%', overflow: 'hidden'}}> 
                        {txt('exportAll', props.config.lang)}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </div>
          </Box>
        </Grid>
      </Grid>
      {(props.isAdmin && props.ladyUp) && (
        <Grid container spacing={4}>
          <Grid xl={7} lg={7} md={12} sm={12} xs={12} style={{textAlign: 'center', paddingTop: '22px'}}>
            <Button variant="contained" size="large" onClick={() => {props.sendMessage(gameToggle()); setGame(gameToggle());}}>
              {txt(gameToggle(), props.config.lang)}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Main;
