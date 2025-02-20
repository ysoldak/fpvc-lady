import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'

import '../../App.scss'

import txt from '../../locale/locale'
import formatDateTime from '../../utils/formatDateTime'
import { exportData } from '../../utils/exportData'
import displayMatrix from '../../utils/hitMatrix'

import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SignLanguageIcon from '@mui/icons-material/SignLanguage'
import AvTimerIcon from '@mui/icons-material/AvTimer'
import TimerIcon from '@mui/icons-material/Timer'
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert'
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'

function MainTblStats(props) {

  const [lastAttackerId, setLastAttackerId] = useState(null)
  const [lastVictimId, setLastVictimrId] = useState(null)
  const [showMatrix, setShowMatrix] = useState(false)

  const hitTableRows = useMemo(
    () => displayMatrix(props.hits, props.msgs, true),
    [props.hits, props.msgs]
  )

  useEffect(() => {
    let lastHit = props.hits[props.hits.length-1]
    if (lastHit?.attackerId && lastHit?.victimId) {
      setLastAttackerId(lastHit.attackerId.toString(16).toUpperCase())
      setLastVictimrId(lastHit.victimId.toString(16).toUpperCase())
    }
  }, [props.hits])

  return (
    <div>
      <Box sx={{ p: 1 }}>
        <Container className="fpvcm-card-disp-stats-wrapper">
          {(!props.ladyUp && !props.loading) && (<span style={{color: "red", fontWeight: "bold"}}>{txt('ladyNotOn', props.lang)}</span>)}
          {props.ladyUp && (
            <div style={{position: 'relative'}}>
              <div className="fpvcm-stats-matrix-switch">
                Hit Matrix:&nbsp;
                <Switch
                  name="formatLogs"
                  variant="outlined"
                  checked={showMatrix && props.hits.length > 0}
                  disabled={props.hits.length < 1}
                  onClick={() => setShowMatrix(!showMatrix)}
                />
              </div>
              {!showMatrix && (
                <TableContainer component={Paper} style={{maxWidth: '100%'}}>
                  <Table size="small" className="fpvcm-table-bg" >
                    <TableHead>
                      <TableRow>
                        <TableCell className="fpvcm-table-header-cell">{txt('player', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('desc', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('hits', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('damage', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('lives', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('score', props.lang)}</TableCell>
                        <TableCell className="fpvcm-table-header-cell hide-narrow">{txt('updated', props.lang)}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {props.rows.map((row, i) => (
                        <TableRow
                          key={i}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          style={{color: 'white'}}
                        >
                          <TableCell component="th" scope="row" className="fpvcm-table-cell">
                            {row.name}&nbsp;<span className="fpvcm-label">({row.id})</span>
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.description}</TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">
                            <Chip
                              label={row.hits}
                              size="small"
                              style={{color: 'white'}}
                              color={lastAttackerId && lastAttackerId === row.id && row.hits > 0 ? "success" : "default"}
                            />
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">
                            <Chip
                              label={row.damage}
                              size="small"
                              style={{color: 'white'}}
                              color={lastVictimId && lastVictimId === row.id && row.damage > 0 ? "error" : "default"}
                            />
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.lives}</TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">{row.score}</TableCell>
                          <TableCell className="fpvcm-table-cell hide-narrow"><span className="fpvcm-text-muted">{formatDateTime(row.updated)}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>)
              }
              {(showMatrix && props.hits.length > 0) && (
                <TableContainer component={Paper} style={{maxWidth: '100%'}}>
                  <Table size="small" className="fpvcm-table-bg" >
                    <TableHead>
                      <TableRow>
                        <TableCell className="fpvcm-table-header-cell">{hitTableRows && hitTableRows[0].playersCol}</TableCell>
                        {(hitTableRows && hitTableRows[0]) && Object.keys(hitTableRows[0]).map((id) => {
                          return id !== 'playersCol' ? <TableCell key={id} align="center" className="fpvcm-table-header-cell">{hitTableRows[0][id]}</TableCell> : null
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hitTableRows && hitTableRows.slice(1).map((row, i) => {
                        return (
                          <TableRow
                            key={i}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            style={{color: 'white'}}
                          >
                            <TableCell component="th" scope="row" className="fpvcm-table-header-cell" align="right">{row.playersCol}</TableCell>
                            {Object.keys(row).map((id) => {
                              return id !== 'playersCol' ? <TableCell key={id} component="th" scope="row" align="center" className="fpvcm-table-cell">{row[id] || <span className="fpvcm-label">-</span>}</TableCell> : null
                            })}
                          </TableRow>)
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>)
              }
              <Typography display="block" style={{fontWeight: 'bold', paddingTop: '12px'}}>
                {txt('totalHits', props.lang)}: <span style={{color: 'white'}}>{props.rows.reduce((total, row) => total += parseInt(row.hits), 0)}</span><br />
              </Typography>
            </div>
          )}
        </Container>
      </Box>
      <Box sx={{ p: 1 }}>
        <Card variant="outlined" className="fpvcm-card-wrapper">
          <CardContent className="fpvcm-config fpvcm-disp-config" style={{position: 'relative'}}>
            <div style={{fontWeight: 'normal', position: 'absolute', paddingTop: '10px'}}>
              <Typography>
                {(props.ladyUp && !props.loading) && (<span>{txt('sessCurrent', props.lang)}:&nbsp;
                  <span className="fpvcm-label">{txt('sess_' + props.gameSession, props.lang)}</span></span>)}
              </Typography> 
            </div>
            <div style={{fontSize: '0.85em', position: 'absolute', right: '8px', top: '6px'}}>
              {props.config.ladySettingsSynced && (<>
                <TimerIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyDurationBattle + ' ' + txt('min', props.lang)}</span>
                &nbsp;&nbsp;
                <AvTimerIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyDurationCountdown + ' ' + txt('sec', props.lang)}</span>
                &nbsp;&nbsp;
                <CrisisAlertIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.hitPoints}</span>&nbsp;/&nbsp;<span style={{color: 'white'}}>{props.config.hitTargetPoints}</span>
                &nbsp;&nbsp;
                <AirplanemodeInactiveIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyScoreDamages}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                {txt('speak', props.lang)}:&nbsp;
                {props.config.ladySpeakLives && <FavoriteIcon fontSize="small" style={{position: 'relative', top: '4px', color: 'red'}} />}
                {!props.config.ladySpeakLives && <FavoriteBorderIcon fontSize="small" style={{position: 'relative', top: '4px', color: '#124012'}} />}
                &nbsp;<SignLanguageIcon fontSize="small" style={{position: 'relative', top: '4px', color: props.config.ladySpeakCheers ? 'yellow' : '#124012'}} />
              </>)}
            </div>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Card variant="outlined" className="fpvcm-card-wrapper">
          <CardContent className="fpvcm-config fpvcm-disp-config" style={{position: 'relative'}}>
            <div style={{fontWeight: 'normal', position: 'absolute', paddingTop: '10px'}}>
              <Typography>
                {(props.ladyUp && !props.loading) && (<span>{txt('sessCurrent', props.lang)}:&nbsp;
                  <span className="fpvcm-label">{txt('sess_' + props.gameSession, props.lang)}</span></span>)}
              </Typography> 
            </div>
            <div style={{fontSize: '0.85em', position: 'absolute', right: '8px', top: '6px'}}>
              {props.config.ladySettingsSynced && (<>
                <TimerIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyDurationBattle + ' ' + txt('min', props.lang)}</span>
                &nbsp;&nbsp;
                <AvTimerIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyDurationCountdown + ' ' + txt('sec', props.lang)}</span>
                &nbsp;&nbsp;
                <CrisisAlertIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.hitPoints + ' (' + props.config.hitTargetPoints + ')'}</span>
                &nbsp;&nbsp;
                <AirplanemodeInactiveIcon fontSize="small" style={{position: 'relative', top: '4px'}} />
                &nbsp;<span style={{color: 'white'}}>{props.config.ladyScoreDamages}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                Speak:&nbsp;
                {props.config.ladySpeakLives && <FavoriteIcon fontSize="small" style={{position: 'relative', top: '4px', color: 'red'}} />}
                {!props.config.ladySpeakLives && <FavoriteBorderIcon fontSize="small" style={{position: 'relative', top: '4px', color: '#124012'}} />}
                &nbsp;<SignLanguageIcon fontSize="small" style={{position: 'relative', top: '4px', color: props.config.ladySpeakCheers ? 'yellow' : '#124012'}} />
              </>)}
            </div>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={4} style={{marginLeft: '0px'}}>
          <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px', fontSize: '0.75em'}}>
            <Button variant="contained" size="small" onClick={() => exportData(false, true, props.lang, props.rows, props.msgs, props.hits, false)} className="fpvcm-export-btn"> 
              <FileDownloadIcon />
              {txt('exportStats', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default MainTblStats;
