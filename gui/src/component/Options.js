import * as React from 'react'
import { useState } from 'react'

import { txt, langs } from '../locale/locale.js'

import { setCookie } from '../utils/cookieHandler'

import Box from '@mui/material/Box/index.js'
import Grid from '@mui/material/Unstable_Grid2/index.js'
import Select from '@mui/material/Select/index.js'
import Button from '@mui/material/Button/index.js'
import MenuItem from '@mui/material/MenuItem/index.js'
import TextField from '@mui/material/TextField/index.js'

function Options(props) {

  const [formConfig, setFormConfig] = useState(props.config)

  function handleChange(e) {
    let newFormConfig = {...formConfig}
    newFormConfig[e.target.name] = e.target.value
    setCookie('fpvcm_config', JSON.stringify(newFormConfig), 120)
    setFormConfig({...newFormConfig})
    props.setConfig({...newFormConfig})
  }

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={4} style={{marginTop: '12px'}}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLanguage', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={7} sm={7} xs={7}>
          <Select
            labelId="language-select-label"
            id="language-select"
            name="lang"
            value={formConfig.lang}
            onChange={handleChange}
            style={{minWidth: '50%'}}
          >
            {Object.keys(langs).map((lang) => <MenuItem value={lang} key={lang}>{langs[lang].name}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      {/*<Grid container spacing={4}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsDefaultRoundTime', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={7} sm={7} xs={7}>
          <Select
            labelId="roundtime-select-label"
            id="roundtime-select"
            name="defaultRoundTime"
            value={formConfig.defaultRoundTime}
            onChange={handleChange}
            style={{minWidth: '50%'}}
          >
            {props.roundTimeMarks.map((mark) => <MenuItem value={mark.value} key={mark.value}>{mark.label}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsDefaultCountdown', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={7} sm={7} xs={7}>
          <Select
            labelId="countdown-select-label"
            id="countdown-select"
            name="defaultCountDown"
            value={formConfig.defaultCountDown}
            onChange={handleChange}
            style={{minWidth: '50%'}}
          >
            {props.countDownMarks(props.config.lang).map((mark) => <MenuItem value={mark.value} key={mark.value}>{mark.label}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>*/}
      <Grid container spacing={4}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsHitPoints', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={6} sm={6} xs={6}>
          <TextField
            id="hitpoints-select"
            name="hitPoints"
            variant="outlined"
            type="number"
            value={formConfig.hitPoints}
            onChange={handleChange}
            style={{minWidth: '50%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsDamagePoints', props.config.lang)}:</span>
        </Grid>
        <Grid xl={4} lg={4} md={6} sm={6} xs={6}>
          <TextField
            id="hitpoints-select"
            name="damagePoints"
            variant="outlined"
            type="number"
            value={formConfig.damagePoints}
            onChange={handleChange}
            style={{minWidth: '50%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4} style={{marginTop: '36px'}}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5}>
          &nbsp;
        </Grid>
        <Grid xl={4} lg={4} md={6} sm={6} xs={6}>
          <Button variant="contained" size="medium" onClick={props.toggleSettings} style={{minWidth: '100%'}}> 
            {txt('optionsExit', props.config.lang)}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={4} style={{marginTop: '24px'}}>
        <Grid xl={3} lg={2} md={5} sm={5} xs={5}>
          &nbsp;
        </Grid>
        {/*<Grid xl={4} lg={4} md={6} sm={6} xs={6}>
          <Button variant="contained" color="secondary" size="small" style={{minWidth: '100%'}} disabled>
            {txt('optionsResetPin', props.config.lang)}
          </Button>
        </Grid>*/}
      </Grid>
    </Box>
  );
}

export default Options;
