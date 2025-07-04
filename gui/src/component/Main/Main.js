import * as React from 'react'

import '../../App.scss'

import txt from '../../locale/locale'

import Loading from '../Loading'
import MainTabScoreLog from './MainTabScoreLog'
import MainTabHitLog from './MainTabHitLog'
import MainTabStats from './MainTabStats'

import IconAdvance from '../svg/IconAdvance.js'
import IconRestart from '../svg/IconRestart.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

function Main(props) {

  const [tab, setTab] = React.useState(0)
  const [rows, setRows] = React.useState([])

  const switchTab = (evt, tab) => {
    setTab(tab)
  }

  function comparePoints(a, b) {
    if (parseInt(a.score) < parseInt(b.score)) { return 1 }
    if (parseInt(a.score) > parseInt(b.score)) { return -1 }
    return 0
  }

  function restartSession(confirmed=false) {
    if (!confirmed) {
      props.setConfirmModal({
        show: true,
        title: txt('sessRestart', props.config.lang),
        contents: txt('sessRestartSure', props.config.lang),
        callBack: () => restartSession(true)
      })
      return
    }
    props.sendNewSession(null)
  }

  React.useEffect(() => {
    if (props.msgs.length > 0) {
      let rows = props.msgs[0].map((msg) => {
        return ({
          id: msg.id.toString(16).toUpperCase(),
          name: msg.name,
          description: msg.description,
          hits: msg.hits,
          damage: msg.damage,
          lives: msg.lives,
          updated: msg.updated,
          score: msg.score
        })
      })
      setRows(rows.sort(comparePoints))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.msgs])

  return (
    <Box className="fpvcm-container_box">
      <br />
      <Grid container spacing={4}>
        <Grid xl={8} lg={10} md={12} sm={12} xs={12}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={switchTab} sx={{color: 'red'}}>
                <Tab label="Stats" id="fpvcmTab0"  />
                <Tab label={txt('logHits', props.config.lang)} id="fpvcmTab1" />
                <Tab label={txt('logScore', props.config.lang)} id="fpvcmTab2" />
                {props.loading && <Loading lang={props.config.lang} ladyLoading={props.ladyLoading} />}
              </Tabs>
            </Box>
            <div
              role="tabpanel"
              index={0}
              hidden={tab !== 0}
              id={`fpvcmTab${tab}`}
            >
              <MainTabStats
                ladyUp={props.ladyUp}
                lang={props.config.lang}
                rows={rows}
                msgs={props.msgs}
                hits={props.hits}
                gameSession={props.gameSession}
                loading={props.loading}
                config={props.config}
              />
            </div>
            <div
              role="tabpanel"
              index={1}
              hidden={tab !== 1}
              id={`fpvcmTab${tab}`}
            >
              <MainTabHitLog msgs={props.msgs} lang={props.config.lang} hits={props.hits} />
            </div>
            <div
              role="tabpanel"
              index={2}
              hidden={tab !== 2}
              id={`fpvcmTab${tab}`}
            >
              <MainTabScoreLog msgs={props.msgs} lang={props.config.lang} rows={rows} log={props.log} clearLog={props.clearLog} setConfirmModal={props.setConfirmModal} />
            </div>
          </Box>
        </Grid>
      </Grid>
      {(props.isAdmin && props.ladyUp) && (
        <Grid container spacing={4}>
          <Grid xl={9} lg={10} md={12} sm={12} xs={12} style={{textAlign: 'center', paddingTop: '22px', paddingLeft: '24px', maxWidth: '90%'}}>
            <ButtonGroup className="fpvcm-main-btn">
              <Button
                variant="contained"
                size="large"
                style={{width: '75%'}}
                onClick={() => {props.sendNewSession(props.advanceSession())}}
                disabled={props.gameSession === 'regEnded'}
              >
                <IconAdvance />&nbsp;&nbsp;
                {txt('sessGoTo_' + props.advanceSession(), props.config.lang)}
              </Button>
              <Button
                variant="contained"
                size="large"
                style={{width: '25%'}}
                onClick={() => {restartSession(false)}}
                disabled={props.gameSession === 'regEnded'}
              >
                <IconRestart />
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Main;