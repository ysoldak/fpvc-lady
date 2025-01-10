import * as React from 'react'
import { useState, useEffect } from 'react'

import { getCookie } from './utils/cookieHandler'

import logo from './img/FPV-Combat-Logo-light-grey.png'
import ladyBW from './img/lady_bw.jpeg'
import './App.scss'

import txt from './locale/locale'

import Main from './component/Main'
import Options from './component/Options'
import Loading from './component/Loading'

import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import SettingsIcon from '@mui/icons-material/Settings'

import { ThemeProvider, createTheme } from '@mui/material/styles'

import useWebSocket from "react-use-websocket"

const appVersion = process.env.REACT_APP_VERSION
const appVersionIsBeta = process.env.REACT_APP_VERSION_BETA
const appRevision = process.env.REACT_APP_REVISION

const wsUrlDev = process.env.REACT_APP_MOCK_WS_URL
const wsUrl = "ws://" + window.location.host + "/ws"

const theme = createTheme({
  palette: {
    primary: {
      main: '#00b50f',
    }
  },
})

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
]

const countDownMarks = (lang) =>  [
  { value: 10, label: '10 ' + txt('sec', lang) },
  { value: 30, label: '30 ' + txt('sec', lang) },
  { value: 60, label: '1 ' + txt('min', lang) },
  { value: 120, label: '2 ' + txt('min', lang) },
]

const initSettings =  {
  "lang": "en",
  "defaultRoundTime": 240,
  "defaultCountDown": 30,
  "hitPoints": 5,
  "damagePoints": -1
}

function App() {

  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [config, setConfig] = useState(initSettings)
  const [showConfig, setShowConfig] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [poll, setPoll] = useState(null)
  const [showLady, setShowLady] = useState(false)
  const [ladyJustTriggered, setLadyJustTriggered] = useState(false)
  const [ladyClicks, setLadyClicks] = useState(0)
  const [ladyUp, setLadyUp] = useState(false)

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    wsUrlDev?.length > 0 ? wsUrlDev : wsUrl,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  useEffect(() => {
    if (lastMessage && lastMessage.data?.length > 0) {
      if (lastMessage.data !== msgs[0]) {
        setLadyUp(true)
        setMsgs([lastMessage.data, ...msgs])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])

  useEffect(() => {
    if (readyState === 0) {
      setLoading(true)
    }
    else if (readyState === 1) {
      setLoading(false)
      setLadyUp(true)
      if (!poll) {
        setPoll(setInterval(function () {
          sendMessage("table")
        }, 1500))
      }
    }
    else {
      clearInterval(poll)
      setLoading(false)
      setLadyUp(false)
      setPoll(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState])

  useEffect(() => {
    setIsAdmin(window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('127.0.0.1') > -1)
    let storedConfig = getCookie('fpvcm_config')
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSettings() {
    setShowConfig(!showConfig)
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
        <div className="fpvcm-header_text">
          &nbsp;Manager
          <span className="fpvcm-header_version">&nbsp;v.{appVersion}&nbsp;{appVersionIsBeta ? (<>BETA&nbsp;</>) : ""}rev.{appRevision}</span>
        </div>
        {isAdmin && <div className="fpvcm-settings-icon">
          <SettingsIcon onClick={toggleSettings} />
        </div>}
      </header>
      <Container maxWidth="false" className="fpvcm-container">
        {showLady
          ? <img src={ladyBW} alt="FPV Combat Lady" style={{marginTop: "70px", maxWidth: "80vw"}} onClick={() => toggleLady()} />
          :  showConfig
              ? (<Options
                  config={config}
                  setConfig={setConfig}
                  roundTimeMarks={roundTimeMarks}
                  countDownMarks={countDownMarks}
                  toggleSettings={toggleSettings}
                />)
              : (<Main
                  config={config}
                  loading={loading}
                  countDownMarks={countDownMarks(config.lang)}
                  roundTimeMarks={roundTimeMarks}
                  sendMessage={sendMessage}
                  isAdmin={isAdmin}
                  ladyUp={ladyUp}
                  msgs={msgs}
                />)
        }
      </Container>
    </div>
    </ThemeProvider>
  );
}

export default App;