import * as React from 'react'

import '../../App.scss'

import txt from '../../locale/locale'

import Loading from '../Loading'
import MainTabScoreLog from './MainTabScoreLog'
import MainTabHitLog from './MainTabHitLog'
import MainTabStats from './MainTabStats'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

function Main(props) {
  const [tab, setTab] = React.useState(0)
  const [rows, setRows] = React.useState([])
  const [game, setGame] = React.useState('stop')

  const switchTab = (evt, tab) => {
    setTab(tab)
  }

  const gameToggle = () => (game === 'stop' ? 'start' : 'stop')

  function createData(
    playerName,
    playerId,
    playerDesc,
    hits,
    damage,
    lives,
    updated,
    score = 0
  ) {
    return {
      playerName,
      playerId,
      playerDesc,
      hits,
      damage,
      lives,
      updated,
      score: props.config.useLocalScore ? ((hits * props.config.hitPoints) + (damage * props.config.damagePoints)) : score
    }
  }

  function comparePoints(a, b) {
    if (parseInt(a.score) < parseInt(b.score)) { return 1 }
    if (parseInt(a.score) > parseInt(b.score)) { return -1 }
    return 0
  }

  React.useEffect(() => {
    if (props.msgs.length > 0) {
      let rows = props.msgs[0].map((msg, i) => {
        return createData(msg.name, msg.id.toString(16).toUpperCase(), msg.description, msg.hits, msg.damage, msg.lives, msg.updated, msg.score)
      })
      setRows(rows.sort(comparePoints))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.msgs])

  return (
    <Box className="fpvcm-container_box">
      <br />
      <Grid container spacing={4}>
        <Grid xl={7} lg={7} md={11} sm={11} xs={11}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={switchTab} sx={{color: 'red'}}>
                <Tab label="Stats" id="fpvcmTab0"  />
                <Tab label={txt('logScore', props.config.lang)} id="fpvcmTab1" />
                <Tab label={txt('logHits', props.config.lang)} id="fpvcmTab2" />
                {props.loading && <Loading lang={props.config.lang} />}
              </Tabs>
            </Box>
            <div
              role="tabpanel"
              index={0}
              hidden={tab !== 0}
              id={`fpvcmTab${tab}`}
            >
              <MainTabStats ladyUp={props.ladyUp} lang={props.config.lang} rows={rows} hits={props.hits} />
            </div>   
            <div
              role="tabpanel"
              index={1}
              hidden={tab !== 1}
              id={`fpvcmTab${tab}`}
            >
              <MainTabScoreLog msgs={props.msgs} lang={props.config.lang} rows={rows} log={props.log} />
            </div>
            <div
              role="tabpanel"
              index={2}
              hidden={tab !== 2}
              id={`fpvcmTab${tab}`}
            >
              <MainTabHitLog msgs={props.msgs} lang={props.config.lang} hits={props.hits} />
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
