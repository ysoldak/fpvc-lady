import * as React from 'react'
import { useState, useEffect } from 'react'

import '../../App.scss'

import txt from '../../locale/locale'
import { exportData } from '../../utils/exportData'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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

  useEffect(() => {
    let lastHit = props.hits[props.hits.length-1]
    if (lastHit.attackerId && lastHit.victimId) {
      setLastAttackerId(lastHit.attackerId.toString(16).toUpperCase())
      setLastVictimrId(lastHit.victimId.toString(16).toUpperCase())
    }
  }, [props.hits])

  return (
    <div>
      <Box sx={{ p: 1 }}>
        <Card variant="outlined" className="fpvcm-card-wrapper">
          <CardContent className="fpvcm-card fpvcm-disp-stats">
            {!props.ladyUp && (<span style={{color: "red", fontWeight: "bold"}}>{txt('ladyNotOn', props.lang)}</span>)}
            {props.ladyUp && (
              <>
                <TableContainer component={Paper} style={{maxWidth: 750}}>
                  <Table size="small" className="fpvcm-table-bg" >
                    <TableHead>
                      <TableRow>
                        <TableCell className="fpvcm-table-header-cell">{txt('player', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('desc', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('hits', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('damage', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell hide-narrow">{txt('lives', props.lang)}</TableCell>
                        <TableCell align="right" className="fpvcm-table-header-cell">{txt('score', props.lang)}</TableCell>
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
                            {row.playerName}&nbsp;<span className="fpvcm-label">({row.playerId})</span>
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.playerDesc}</TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">
                            {(lastAttackerId && lastAttackerId === row.playerId) && <Chip label={row.hits} size="small" color="success" />}
                            {(!lastAttackerId || lastAttackerId !== row.playerId) && row.hits}
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">
                            {(lastVictimId && lastVictimId === row.playerId) && <Chip label={row.damage} size="small" color="error" />}
                            {(!lastVictimId || lastVictimId !== row.playerId) && row.damage}
                          </TableCell>
                          <TableCell align="right" className="fpvcm-table-cell hide-narrow">{row.lives}</TableCell>
                          <TableCell align="right" className="fpvcm-table-cell">{row.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography display="block" style={{fontWeight: 'bold', paddingTop: '12px'}}>
                  {props.game?.roundStatus === 'on' && (<>{txt('roundPending', props.lang)}<br /></>)}
                  {txt('totalHits', props.lang)}: <span className="fpvcm-label">{props.rows.reduce((total, row) => total += parseInt(row.hits), 0)}</span><br />
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={4} style={{marginLeft: '0px'}}>
          <Grid xl={4} lg={4} md={4} sm={4} xs={4} style={{paddingTop: '22px'}}>
            <Button variant="contained" size="small" onClick={() => exportData(false, true, props.lang, props.rows, props.msgs)} style={{minWidth: '100%', overflow: 'hidden'}}> 
              {txt('exportStats', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default MainTblStats;
