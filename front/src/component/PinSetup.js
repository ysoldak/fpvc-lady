import * as React from 'react'
import { useRef, useState, useEffect } from 'react'

import txt from '../locale/locale'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

function PinSetup(props) {

  const inputRef = useRef()

  const [showErrorInfo, setShowErrorInfo] = useState(false)
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)

  const [newPin, setupNewPin] = useState(null)
  const [newPinEntered, setupNewPinEntered] = useState(false)
  const [newPinConfirm, setupNewPinConfirm] = useState(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  function pinInputChange(e) {
    if (newPinEntered) {
      setupNewPinConfirm(e.target.value)
    }
    else {
      setupNewPin(e.target.value)
    }
  }

  function pinInputKeyPress(e) {
    if (e.keyCode === 13) {
      saveNewPin()
    }
  }

  function saveNewPin() {
    if (!newPinEntered && newPin && newPin.length > 3) {
      setupNewPinEntered(true)
      inputRef.current.focus()
      inputRef.current.value = ''
    }
    else if (newPinEntered && newPin && newPin === newPinConfirm) {
      setShowSuccessInfo(true)
      setTimeout(() => {
        props.saveNewConfig('accessPin', newPin)
      }, 500)
    }
    else {
      setupNewPin(null)
      setupNewPinConfirm(null)
      setupNewPinEntered(false)
      inputRef.current.value = ''
      setShowErrorInfo(true)
    }
  }

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4}>
        <Grid xl={12} lg={12} md={12} sm={12} xs={12} className="fpvcm-pin-screen">
          <h4>{txt('pinSetupSetNew', props.config.lang)}</h4>
          <small>{txt(newPinEntered ? 'pinSetupConfirmPin' : 'pinSetupExplanation', props.config.lang)}</small>
          <br />
          <br />
          <TextField
            id="outlined-number"
            tabIndex="0"
            label=""
            inputRef={inputRef}
            onChange={pinInputChange}
            onKeyDown={pinInputKeyPress}
            type="password"
          />
          <br />
          <br />
          <Button variant="contained" size="large" onClick={saveNewPin}>
            {txt('pinSetupSubmitBtn', props.config.lang)}
          </Button>
          <Snackbar
            open={showErrorInfo}
            autoHideDuration={6000}
            onClose={() => setShowErrorInfo(false)}
          >
            <Alert variant="filled" severity="error">
              {txt('pinSetupNotMatch', props.config.lang)}
            </Alert>
          </Snackbar>
          <Snackbar
            open={showSuccessInfo}
            autoHideDuration={6000}
            onClose={() => setShowSuccessInfo(false)}
          >
            <Alert variant="filled" severity="success">
              {txt('pinSetupOK', props.config.lang)}
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PinSetup;
