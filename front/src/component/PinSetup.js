import * as React from 'react'
import { useRef, useEffect } from 'react'

import txt from '../locale/locale.js'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import TextField from '@mui/material/TextField'

function PinSetup(props) {

  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4}>
        <Grid xl={12} lg={12} md={12} sm={12} xs={12} className="fpvcm-pin-screen">
          <h4>{txt('pinSetupSetNew', props.config.lang)}</h4>
          <small>{txt('pinSetupExplanation', props.config.lang)}</small>
          <br />
          <br />
          <TextField
            id="outlined-number"
            tabIndex="0"
            label=""
            inputRef={inputRef} 
            type="password"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <br />
          <br />
          <Button variant="contained" size="large">
            {txt('pinSetupSubmitBtn', props.config.lang)}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PinSetup;
