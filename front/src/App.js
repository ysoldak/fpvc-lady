import * as React from 'react'
import { useState, useEffect } from 'react'

import { getCookie } from './utils/cookieHandler'

import logo from './img/FPV-Combat-Logo-light-grey.png'
import './App.scss'

import txt from './locale/locale'

import configService from './services/config'

import Main from './component/Main'
import Info from './component/Info'
import PinSetup from './component/PinSetup'
import PinEnter from './component/PinEnter'
import Loading from './component/Loading'

import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import SettingsIcon from '@mui/icons-material/Settings'

import { ThemeProvider, createTheme } from '@mui/material/styles'

const appVersion = process.env.REACT_APP_VERSION
const appVersionIsBeta = process.env.REACT_APP_VERSION_BETA
const appRevision = process.env.REACT_APP_REVISION

const machineSecured = getCookie('fpvcmMachineSecured')

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

function App() {
  const [loading, setLoading] = useState(false)
  const [secured, setSecured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showSetPin, setShowSetPin] = useState(false)
  const [showEnterPin, setShowEnterPin] = useState(false)
  const [config, setConfig] = useState({})

  useEffect(() => {
    readConfig()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (config.hasOwnProperty('accessPin') && (config.accessPin === null || config.accessPin === "")) {
      setShowSetPin(true)
    }
    else if (!secured && config.hasOwnProperty('accessPin') && config.accessPin && machineSecured !== '1') {
      setShowEnterPin(true)
    }
    else {
      setShowSetPin(false)
      setShowEnterPin(false)
    }
  }, [config, secured])

  function readConfig() {
    setLoading(true)
    setShowSetPin(false)
    setShowEnterPin(false)
    getConfig().then((res) => {
      setConfig(res)
      setLoading(false)
    }).catch((err) => { console.error('Error when reading config: ' + err) })
  }

  function saveNewConfig(label, value) {
    setLoading(true)
    updateConfig(label, value).then((res) => {
      setConfig(res)
      readConfig()
    }).catch((err) => { console.error('Error when saving config: ' + err) })
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
        <div className="fpvcm-settings-icon">
          <SettingsIcon onClick={toggleSettings} />
        </div>
      </header>
      <Container maxWidth="false" className="fpvcm-container">
        {loading
          ? (<Loading lang={config.lang} />)
          : showSetPin
            ? (<PinSetup config={config} saveNewConfig={saveNewConfig} />)
            : showEnterPin
              ? (<PinEnter config={config} setSecured={setSecured} />)
              : showConfig
                ? (<Info info="Options panel" />)
                : (<Main config={config} countDownMarks={countDownMarks(config.lang)} roundTimeMarks={roundTimeMarks} />)
        }
      </Container>
    </div>
    </ThemeProvider>
  );
}

export default App;
