import * as React from 'react'
import { useRef, useState, useEffect } from 'react'

import { setCookie } from '../utils/cookieHandler'

import txt from '../locale/locale'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

function PinEnter(props) {

  const inputRef = useRef()

  const [showErrorInfo, setShowErrorInfo] = useState(false)
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  function unlockGui() {
    setCookie('fpvcmMachineSecured', '1', 1)
    props.setSecured(true)
  }

  function checkPin(e, alertOnWrong = false) {
    if (e.target.value === props.config.accessPin) {
      setShowSuccessInfo(true)
      setTimeout(() => {
        unlockGui()
      }, 500)
    }
    else if (alertOnWrong) {
      inputRef.current.value = ''
      setShowErrorInfo(true)
    }
  }

  function pinInputKeyPress(e) {
    if (e.keyCode === 13) {
      checkPin(e, true)
    }
  }

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4}>
        <Grid xl={12} lg={12} md={12} sm={12} xs={12} className="fpvcm-pin-screen">
          <h4>{txt('pinEnterPrompt', props.config.lang)}</h4>
          <TextField
            id="outlined-number"
            tabIndex="0"
            label=""
            inputRef={inputRef} 
            onKeyDown={pinInputKeyPress}
            onChange={checkPin}
            type="password"
          />
          <br />
          <br />
          <Button variant="contained" size="large" onClick={(e) => checkPin(e, true)}>
            {txt('pinEnterLoginBtn', props.config.lang)}
          </Button>
          <Snackbar
            open={showErrorInfo}
            autoHideDuration={6000}
            onClose={() => setShowErrorInfo(false)}
          >
            <Alert variant="filled" severity="error">
              {txt('pinEnterInvalid', props.config.lang)}
            </Alert>
          </Snackbar>
          <Snackbar
            open={showSuccessInfo}
            autoHideDuration={6000}
            onClose={() => setShowSuccessInfo(false)}
          >
            <Alert variant="filled" severity="success">
              {txt('pinEnterOK', props.config.lang)}
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PinEnter;
