import * as React from 'react'

import '../../App.scss'

import txt from '../../locale/locale'

import Loading from '../Loading'
import MainTabLog from './MainTabLog'
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
    score = 0
  ) {
    return {
      playerName,
      playerId,
      playerDesc,
      hits,
      damage,
      lives,
      score: props.config.useLocalScore ? ((hits * props.config.hitPoints) + (damage * props.config.damagePoints)) : score
    }
  }

  function comparePoints(a, b) {
    if (parseInt(a.score) < parseInt(b.score)) { return 1 }
    if (parseInt(a.score) > parseInt(b.score)) { return -1 }
    return 0
  }

  React.useEffect(() => {
    if (props.jsonMsgs.length > 0 && props.useJsonMsgs) {
      let rows = props.jsonMsgs[0].map((msg, i) => {
        return createData(msg.name, msg.id.toString(16).toUpperCase(), msg.description, msg.hits, msg.damage, msg.lives, msg.score)
      })
      setRows(rows.sort(comparePoints))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.jsonMsgs])

  React.useEffect(() => {
    if (props.msgs.length > 0 && !props.useJsonMsgs) {
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
      <Grid container spacing={4}>
        <Grid xl={7} lg={7} md={11} sm={11} xs={11}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={switchTab} sx={{color: 'red'}}>
                <Tab label="Stats" id="fpvcmTab0"  />
                <Tab label="Log" id="fpvcmTab1" />
                {props.loading && <Loading lang={props.config.lang} />}
              </Tabs>
            </Box>
            <div
              role="tabpanel"
              index={0}
              hidden={tab !== 0}
              id={`fpvcmTab${tab}`}
            >
              <MainTabStats ladyUp={props.ladyUp} lang={props.config.lang} rows={rows} />
            </div>   
            <div
              role="tabpanel"
              index={1}
              hidden={tab !== 1}
              id={`fpvcmTab${tab}`}
            >
              <MainTabLog msgs={props.msgs} useJsonMsgs={props.useJsonMsgs} lang={props.config.lang} rows={rows} jsonMsgs={props.jsonMsgs} />
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
