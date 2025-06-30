import * as React from 'react'
import { useState, useEffect } from 'react'
import useWebSocket from "react-use-websocket"
import {v4 as uuidv4} from 'uuid'

import { ladyLocales } from './utils/settingsVals'

import logo from './img/FPV-Combat-Logo-light-grey.png'
import ladyBW from './img/lady_bw_base64.js'
import ladyLoading from './img/lady_loading_base64.js'
import './App.scss'

import Main from './component/Main/Main'
import Options from './component/Options'
import ConfirmModal from './component/ConfirmModal'
import HeaderMenu from './component/HeaderMenu'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'

const appVersion = process.env.REACT_APP_VERSION
const appVersionIsBeta = process.env.REACT_APP_VERSION_BETA === 'true'
const appRevision = process.env.REACT_APP_REVISION

const theme = createTheme({
  palette: {
    primary: {
      main: '#00b50f',
    }
  },
})

const wsUrl = () => {
  const hostAddr = window.location.host.split(':')
  const wsHost = hostAddr[0].toString()
  const wsPort = process.env.REACT_APP_WS_PORT.toString()
  return 'ws://' + wsHost + ':' + wsPort + '/ws'
}

const initSettings =  {
  lang: "en",
  hitAddressesRange: "A1-EF",
  hitTargetAddressesRange: "F1-FF",
  hitPoints: 5,
  hitTargetPoints: 3,
  useCustomLadyLocale: false,
  customLadyLocale: '',
  ladySettingsSynced: false,
  ladyLocale: "en",
  ladyLogSocket: "fpvc-lady.socket.log",
  ladyScoreHits: "",
  ladyScoreDamages: -1,
  ladySpeakCommand: "system",
  ladySpeakCheers: false,
  ladySpeakLives: false,
  ladyAutoStart: false,
  ladyDurationBattle: 4,
  ladyDurationCountdown: 10,
}

function App() {

  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [config, setConfig] = useState(initSettings)
  const [showConfig, setShowConfig] = useState(false)
  const [gameSession, setGameSession] = useState('regStarted')
  const [gameTimestamps, setGameTimestamps] = useState({})
  const [confirmModal, setConfirmModal] = useState({show: false, title: '', contents: '', callBack: null})
  const [msgs, setMsgs] = useState([])
  const [log, setLog] = useState([])
  const [hits, setHits] = useState([])
  const [showLady, setShowLady] = useState(false)
  const [ladyJustTriggered, setLadyJustTriggered] = useState(false)
  const [ladyClicks, setLadyClicks] = useState(0)
  const [ladyUp, setLadyUp] = useState(false)
  const [currentUuid, setCurrectUuid] = useState('')

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    wsUrl(),
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  const advanceSession = () => {
    const sessOrder = ["regStarted", "regEnded", "batStarted", "batEnded"]
    if (!gameSession || sessOrder.indexOf(gameSession) < 0 || sessOrder.indexOf(gameSession) + 1 === sessOrder.length) {
      return sessOrder[0]
    }
    return sessOrder[sessOrder.indexOf(gameSession) + 1]
  }

  const ladyConfigDict = (config) => {
    let retval = {}
    for (const [key, val] of Object.entries(config)) {
      retval['lady' + key[0].toUpperCase() + key.slice(1)] = val
    }
    return retval
  }

  const isCustomLadyLocale = (l) => {
    for (let ladyLocale in Object.keys(ladyLocales)) {
      if (ladyLocales[ladyLocale].value === l.toString()) {
        return false
      }
    }
    return true
  }

  useEffect(() => {
    if (lastMessage && lastMessage.data?.length > 0) {
      let JSONmsg = {}
      try {
        JSONmsg = JSON.parse(lastMessage?.data)
        if (JSONmsg?.payload?.players?.length > 0) {
          setMsgs([JSONmsg?.payload?.players, ...msgs])
          setHits(JSONmsg?.payload?.hits)          
          let tmpInsLog = []
          JSONmsg?.payload?.players?.forEach((pl) => {tmpInsLog.push(JSON.stringify(pl))})
          tmpInsLog.push(''.padStart(130, '-'))
          setLog([...tmpInsLog, ...log])
        }
        if (JSONmsg?.payload?.timestamps && Object.keys(JSONmsg.payload.timestamps).length > 0) {
          setGameTimestamps(JSONmsg.payload.timestamps)
          if (gameSession !== detectGameSession(JSONmsg?.payload?.timestamps)) {
            setGameSession(detectGameSession(JSONmsg?.payload?.timestamps))
          }
        }
        if (JSONmsg?.type?.toString() === 'config' && Object.keys(JSONmsg.payload).length > 0 && !config.ladySettingsSynced) {
          storeCurrentConfig({...ladyConfigDict(JSONmsg.payload)})
        }
      }
      catch (e) {
        console.error('Unable to parse JSON data coming from the server:', lastMessage?.data, e)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])

  useEffect(() => {
    if (!lastMessage) {
      sendMessage(JSON.stringify({
        uuid: currentUuid,
        type: "session",
        seq: "1",
        payload: null
      }))
      getCurrentConfig()
    }
    if (readyState === 0) {
      setLoading(true)
    }
    else if (readyState === 1) {
      setLoading(false)
      setLadyUp(true)
    }
    else {
      setLoading(false)
      setLadyUp(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState])

  useEffect(() => {
    if (!config.ladySettingsSynced) {
      setTimeout(() => {
        getCurrentConfig()
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    setLog(['SESSION CHANGE: ' + gameSession, ''.padStart(130, '-'), ...log])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSession])

  useEffect(() => {
    if (currentUuid === '') {
      setCurrectUuid(uuidv4())
    }
    setIsAdmin(window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('127.0.0.1') > -1)
    if (!config.ladySettingsSynced) {
      getCurrentConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!config.ladySettingsSynced) {
      setTimeout(() => {
        getCurrentConfig()
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  function sendNewSession(sess) {
    let now = new Date()
    let newGameTimestamps = {}
    if (!sess || sess === 'regStarted') {
      newGameTimestamps = {
        regStarted: "0001-01-01T00:00:00Z",
        regEnded: "0001-01-01T00:00:00Z",
        batStarted: "0001-01-01T00:00:00Z",
        batEnded: "0001-01-01T00:00:00Z",
      }
    }
    else {
      newGameTimestamps = {...gameTimestamps}
    }
    newGameTimestamps[sess || 'regStarted'] = now.toISOString()
    setGameTimestamps({...newGameTimestamps})
    let msg = {
      uuid: currentUuid,
      type: "session",
      seq: "1",
      payload: {
        timestamps: {...newGameTimestamps}
      }
    }
    sendMessage(JSON.stringify(msg))
  }

  function getCurrentConfig() {
    sendMessage(JSON.stringify({
      uuid: currentUuid,
      type: "config",
      seq: "1",
      payload: null
    }))
  }

  function sendConfig(insertVals = {}, refreshLadyConfig = false) {
    sendMessage(JSON.stringify({
      uuid: currentUuid,
      type: "config",
      seq: "1",
      payload: {
        locale: config.useCustomLadyLocale ? config.customLadyLocale: config.ladyLocale,
        logSocket: config.ladyLogSocket,
        scoreHits: config.hitAddressesRange + ':' + config.hitPoints + ',' + config.hitTargetAddressesRange + ':' + config.hitTargetPoints,
        scoreDamages: config.ladyScoreDamages,
        speakCommand: config.ladySpeakCommand,
        speakCheers: config.ladySpeakCheers,
        speakLives: config.ladySpeakLives,
        autoStart: config.ladyAutoStart,
        durationBattle: config.ladyDurationBattle,
        durationCountdown: config.ladyDurationCountdown,
        ...insertVals
      }
    }))
    if (refreshLadyConfig) {
      setConfig({...config, ladySettingsSynced: false})
      getCurrentConfig()
    }
  }

  function storeCurrentConfig(ladyConfig) {
    const scoreHits = ladyConfig.ladyScoreHits.split(',')
    setConfig({
      ...initSettings,
      ...config,
      ...ladyConfig,
      hitPoints: scoreHits[0].split(':')[1],
      hitTargetPoints: scoreHits[1].split(':')[1],
      hitAddressesRange: scoreHits[0].split(':')[0],
      hitTargetAddressesRange: scoreHits[1].split(':')[0],
      useCustomLadyLocale: isCustomLadyLocale(ladyConfig.ladyLocale),
      customLadyLocale: ladyConfig.ladyLocale.toString(),
      ladySettingsSynced: true
    })
  }

  function toggleSettings() {
    setShowConfig(!showConfig)
  }

  function clearLog() {
    setLog([])
  }

  function detectGameSession(sessTimeStamps) {
    const timeStampLegal = timeStamp => timeStamp.substring(0, 4) !== '0001' 
    const isRS = 'regStarted' in sessTimeStamps && timeStampLegal(sessTimeStamps.regStarted)
    const isRE = 'regEnded' in sessTimeStamps && timeStampLegal(sessTimeStamps.regEnded)
    const isBS = 'batStarted' in sessTimeStamps && timeStampLegal(sessTimeStamps.batStarted)
    const isBE = 'batEnded' in sessTimeStamps && timeStampLegal(sessTimeStamps.batEnded)
    if (isRE && isBS && isBE) {
      return "batEnded"
    }
    if (isRE && isBS) {
      return "batStarted"
    }
    if (isRE) {
      return "regEnded"
    }
    if (isRS) {
      return "regStarted"
    }
    return "regStarted"
  }

  function toggleLady() {
    let randomFactor = 1 - ((ladyClicks + 1) / 10)
    if (!showLady) {
      if (Math.random() > randomFactor || ladyClicks >= 5) {
        setShowLady(true)
        setLadyJustTriggered(true)
        setTimeout(() => {
          setLadyJustTriggered(false)
        }, 2000)
      }
      else {
        setLadyClicks(ladyClicks+1)
      }
    }
    else if (!ladyJustTriggered) {
      setLadyClicks(0)
      setShowLady(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="fpvcm">
        <CssBaseline />
        <header className="fpvcm-header">
          <div className="fpvcm-header_lady" onClick={() => toggleLady()}></div>
          <img src={logo} alt="FPVCombat" className="fpvcm-header_logo" style={{float: "left"}} />
          <div className="fpvcm-header_text">&nbsp;Manager</div>
          <HeaderMenu isAdmin={isAdmin} config={config} toggleSettings={toggleSettings} sendConfig={sendConfig} />
        </header>
        <ConfirmModal
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          lang={config.lang}
        />
        <Container maxWidth="false" className="fpvcm-container">
          {showLady
            ? <img src={ladyBW} alt="FPV Combat Lady" style={{marginTop: "70px", maxWidth: "80vw"}} onClick={() => toggleLady()} />
            :  showConfig
              ? (<Options
                  config={config}
                  setConfig={setConfig}
                  sendConfig={sendConfig}
                  ladyUp={ladyUp}
                  toggleSettings={toggleSettings}
                />)
              : (<Main
                  config={config}
                  ladyLoading={ladyLoading}
                  loading={loading}
                  advanceSession={advanceSession}
                  sendNewSession={sendNewSession}
                  setConfirmModal={setConfirmModal}
                  gameSession={gameSession}
                  clearLog={clearLog}
                  isAdmin={isAdmin}
                  ladyUp={ladyUp}
                  log={log}
                  msgs={msgs}
                  hits={hits}
                />)
          }
        </Container>
        <footer className="fpvcm-footer">
          FPV Combat Manager
          <span className="fpvcm-footer_version">&nbsp;v.{appVersion}&nbsp;{appVersionIsBeta ? (<>BETA&nbsp;</>) : ""}rev.{appRevision}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="https://www.fpv-combat.com" target="_blank" rel="noreferrer" className="fpvcm-footer_link">FPV-Combat.com</a>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;