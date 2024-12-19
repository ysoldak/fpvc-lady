import * as React from 'react'
import { useState, useEffect } from 'react'

import { getCookie } from './utils/cookieHandler'

import logo from './img/FPV-Combat-Logo-light-grey.png'
import './App.scss'

import txt from './locale/locale'

import configService from './services/config'
import gameService from './services/game'

import Main from './component/Main'
import Options from './component/Options'
import PinSetup from './component/PinSetup'
import PinEnter from './component/PinEnter'
import Loading from './component/Loading'

import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import SettingsIcon from '@mui/icons-material/Settings'

import { ThemeProvider, createTheme } from '@mui/material/styles'

import useWebSocket, { ReadyState } from "react-use-websocket"

const appVersion = process.env.REACT_APP_VERSION
const appVersionIsBeta = process.env.REACT_APP_VERSION_BETA
const appRevision = process.env.REACT_APP_REVISION
const wsUrl = process.env.REACT_APP_MOCK_WS_URL

const machineSecured = getCookie('fpvcmMachineSecured')
const machineReadOnly = getCookie('fpvcmMachineReadOnly')
const uuidv4 = require("uuid").v4

const uuid = uuidv4()

const theme = createTheme({
  palette: {
    primary: {
      main: '#00b50f',
    }
  },
});

const roundTimeMarks = [
  { value: 120, label: '2' },
  { value: 180, label: '3' },
  { value: 240, label: '4' },
  { value: 300, label: '5' },
  { value: 360, label: '6' },
  { value: 420, label: '7' },
  { value: 480, label: '8' },
  { value: 540, label: '9' },
  { value: 600, label: '10' },
];

const countDownMarks = (lang) =>  [
  { value: 10, label: '10 ' + txt('sec', lang) },
  { value: 30, label: '30 ' + txt('sec', lang) },
  { value: 60, label: '1 ' + txt('min', lang) },
  { value: 120, label: '2 ' + txt('min', lang) },
];

async function getConfig(label) {
  var x = await configService.getConfig(label)
  return x.data
}

async function updateConfig(label, value) {
  var x = await configService.updateConfig(label, value)
  return x.data
}

async function getGameStatus() {
  var x = await gameService.getGameStatus()
  return x.data
}

async function setGameStatus(status, duration, countdown) {
  var x = await gameService.setGameStatus(status, duration, countdown)
  return x.data
}

function App() {
  const [loading, setLoading] = useState(false)
  const [secured, setSecured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showSetPin, setShowSetPin] = useState(false)
  const [showEnterPin, setShowEnterPin] = useState(false)
  const [gameConfig, setGameConfig] = useState({})
  const [ladyUp, setLadyUp] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [game, setGame] = useState({})
  const [config, setConfig] = useState({})
  const [msgs, setMsgs] = useState([])

  const WS_URL = wsUrl + "?uuid=" + uuid
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  useEffect(() => {
    console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: "subscribe"
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState])

  useEffect(() => {
    console.log(`Got a new message: `, lastJsonMessage)
    if (lastJsonMessage && lastJsonMessage[uuid]?.state?.table?.length > 0) {
      setMsgs([lastJsonMessage[uuid].state.table, ...msgs])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage])

  useEffect(() => {
    readConfig()
    readGame()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (readOnly || machineReadOnly === '1') {
      setShowSetPin(false)
      setShowEnterPin(false)
      if (machineReadOnly === '1') {
        setReadOnly(true)
      }
    }
    else if (config.hasOwnProperty('accessPin') && (config.accessPin === null || config.accessPin === "")) {
      setShowSetPin(true)
    }
    else if (!secured && config.hasOwnProperty('accessPin') && config.accessPin && machineSecured !== '1') {
      setShowEnterPin(true)
    }
    else {
      setShowSetPin(false)
      setShowEnterPin(false)
    }
  }, [config, secured, readOnly])

  function updateGameConfig(e, label) {
    let currentGameConfig = {...gameConfig}
    currentGameConfig[label] = e.target.value
    setGameConfig({...currentGameConfig})
  }

  function readConfig() {
    setLoading(true)
    setShowSetPin(false)
    setShowEnterPin(false)
    getConfig().then((res) => {
      setConfig(res)
      setLadyUp(true)
      setGameConfig({roundTime: res?.defaultRoundTime, countdown: res?.defaultCountDown})
    }).catch((err) => {
      setShowSetPin(false)
      setShowEnterPin(false)
      console.error('Error when reading config: ' + err)
    }).finally(() => {
      setLoading(false)
    })
  }

  function readGame() {
    getGameStatus().then((res) => {
      setGame({
        roundStatus: res?.round_status,
        roundRemainingSeconds: res?.round_remaining_seconds,
        roundEndAt: res?.round_end_at
      })
    })
  }

  function saveNewConfig(label, value) {
    setLoading(true)
    updateConfig(label, value).then((res) => {
      setConfig(res)
      readConfig()
    }).catch((err) => { console.error('Error when saving config: ' + err) }).finally(() => { setLoading(false) })
  }

  function saveGameStatus(status) {
    setLoading(true)
    setGameStatus(status, gameConfig.roundTime, gameConfig.countdown).then((res) => {
      readGame()
      readConfig()
    }).catch((err) => { console.error('Error when setting game status: ' + err) }).finally(() => { setLoading(false) })
  }

  function toggleSettings() {
    setShowConfig(!showConfig)
  }

  return (
    <ThemeProvider theme={theme}>
    <div className="fpvcm">
      <CssBaseline />
      <header className="fpvcm-header">
        <img src={logo} alt="FPVCombat" className="fpvcm-header_logo" style={{float: "left"}} />
        <div className="fpvcm-header_text">
          &nbsp;Manager
          <span className="fpvcm-header_version">&nbsp;v.{appVersion}&nbsp;{appVersionIsBeta ? (<>BETA&nbsp;</>) : ""}rev.{appRevision}</span>
        </div>
        {(!readOnly && ladyUp) && <div className="fpvcm-settings-icon">
          <SettingsIcon onClick={toggleSettings} />
        </div>}
      </header>
      <Container maxWidth="false" className="fpvcm-container">
        {loading
          ? (<Loading lang={config.lang} />)
          : showSetPin
            ? (<PinSetup config={config} saveNewConfig={saveNewConfig} />)
            : showEnterPin
              ? (<PinEnter config={config} setSecured={setSecured} setReadOnly={setReadOnly} />)
              : showConfig
                ? (<Options
                    config={config}
                    saveNewConfig={saveNewConfig}
                    roundTimeMarks={roundTimeMarks}
                    countDownMarks={countDownMarks}
                    toggleSettings={toggleSettings}
                  />)
                : (<Main
                    config={config}
                    countDownMarks={countDownMarks(config.lang)}
                    roundTimeMarks={roundTimeMarks}
                    readOnly={readOnly}
                    updateGameConfig={updateGameConfig}
                    saveGameStatus={saveGameStatus}
                    game={game}
                    ladyUp={ladyUp}
                    msgs={msgs}
                    uuid={uuid}
                  />)
        }
      </Container>
    </div>
    </ThemeProvider>
  );
}

export default App;