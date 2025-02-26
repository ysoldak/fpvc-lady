import * as React from 'react'
import { useState, useEffect } from 'react'

import { txt, langs } from '../locale/locale.js'
import { roundTimeMarks, countDownMarks, ladyLocales } from '../utils/settingsVals'

import Box from '@mui/material/Box/index.js'
import Grid from '@mui/material/Unstable_Grid2/index.js'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select/index.js'
import Button from '@mui/material/Button/index.js'
import MenuItem from '@mui/material/MenuItem/index.js'
import TextField from '@mui/material/TextField/index.js'

function Options(props) {

  const [formConfig, setFormConfig] = useState(props.config)
  const [typing, setTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)

  function handleChange(e) {
    let newFormConfig = {...formConfig}
    if (e.target.type && e.target.type?.toString() === 'checkbox') {
      newFormConfig[e.target.name] = e.target.checked
      if (e.target.name === 'useCustomLadyLocale') {
        newFormConfig.ladyLocale = e.target.checked ? '' : 'en'
        newFormConfig.customLadyLocale = e.target.checked ? '' : 'en'
      }
    }
    else {
      newFormConfig[e.target.name] = e.target.value
    }
    setFormConfig({...newFormConfig, ladySettingsSynced: false})
    if (e.target.type && e.target.type?.toString() === 'text') {
      setTyping(true)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
      setTypingTimeout(setTimeout(() => {
        props.setConfig({...newFormConfig, ladySettingsSynced: false})
        setTyping(false)
      }, 500))
    }
    else {
      props.setConfig({...newFormConfig, ladySettingsSynced: false})
    }
  }

  useEffect(() => {
    setFormConfig(props.config)
  }, [props.config])

  useEffect(() => {
    if (!typing && !props.config.ladySettingsSynced) {
      props.sendConfig()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formConfig, typing])

  return (
    <Box className="fpvcm-container_box">
      <Grid container spacing={2} style={{marginTop: '12px'}}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLanguage', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <Select
            name="lang"
            value={formConfig.lang}
            onChange={handleChange}
            style={{minWidth: '75%'}}
          >
            {Object.keys(langs).map((lang) => <MenuItem value={lang} key={lang}>{langs[lang].name}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadyLanguage', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <Select
            name="ladyLocale"
            value={formConfig.useCustomLadyLocale ? '' : props.config.ladyLocale}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp || formConfig.useCustomLadyLocale}
            style={{minWidth: '75%'}}
          >
            {ladyLocales.map((i) => <MenuItem value={i.value} key={i.label}>{i.label}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadyUseCustomLanguage', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6} style={{paddingTop: '12px', minHeight: '75px'}}>
          <Switch
            name="useCustomLadyLocale"
            variant="outlined"
            data={{toggle: true}}
            checked={formConfig.useCustomLadyLocale}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            onClick={handleChange}
          />
          {formConfig.useCustomLadyLocale && 
            <TextField
              name="customLadyLocale"
              variant="outlined"
              type="text"
              value={formConfig.customLadyLocale}
              onChange={handleChange}
              disabled={!props.config.ladySettingsSynced || !props.ladyUp}
              style={{minWidth: '50%'}}
            />
          }
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadyAutoStart', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6} style={{paddingTop: '12px', minHeight: '75px'}}>
          <Switch
            name="ladyAutoStart"
            variant="outlined"
            data={{toggle: true}}
            checked={formConfig.ladyAutoStart}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            onClick={handleChange}
            style={{minWidth: '50%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadySpeakCheers', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6} style={{paddingTop: '12px', minHeight: '75px'}}>
          <Switch
            name="ladySpeakCheers"
            variant="outlined"
            data={{toggle: true}}
            checked={formConfig.ladySpeakCheers}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            onClick={handleChange}
            style={{minWidth: '50%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadySpeakLives', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6} style={{paddingTop: '12px', minHeight: '75px'}}>
          <Switch
            name="ladySpeakLives"
            variant="outlined"
            data={{toggle: true}}
            checked={formConfig.ladySpeakLives}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            onClick={handleChange}
            style={{minWidth: '50%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsRoundTime', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <Select
            id="roundtime-select"
            name="ladyDurationBattle"
            value={formConfig.ladyDurationBattle}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          >
            {roundTimeMarks(props.config.lang).map((mark) => <MenuItem value={mark.value} key={mark.value}>{mark.label}</MenuItem>)}
          </Select>
        </Grid>
        <Grid xl={2} lg={2} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsCountdown', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <Select
            name="ladyDurationCountdown"
            value={formConfig.ladyDurationCountdown}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          >
            {countDownMarks(props.config.lang).map((mark) => <MenuItem value={mark.value} key={mark.value}>{mark.label}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsHitPoints', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="hitPoints"
            variant="outlined"
            type="number"
            value={formConfig.hitPoints}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
        <Grid xl={2} lg={2} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsHitTargetPoints', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="hitTargetPoints"
            variant="outlined"
            type="number"
            value={formConfig.hitTargetPoints}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsDamagePoints', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="ladyScoreDamages"
            variant="outlined"
            type="number"
            value={formConfig.ladyScoreDamages}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
        <Grid xl={2} lg={2} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsHitAddressesRange', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="hitAddressesRange"
            variant="outlined"
            type="text"
            value={formConfig.hitAddressesRange}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsHitTargetAddressesRange', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="hitTargetAddressesRange"
            variant="outlined"
            type="text"
            value={formConfig.hitTargetAddressesRange}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
        <Grid xl={2} lg={2} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadySpeakCommand', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="ladySpeakCommand"
            variant="outlined"
            type="text"
            placeholder="say -v Milena"
            value={formConfig.ladySpeakCommand}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xl={3} lg={3} md={5} sm={5} xs={5} className="fpvcm-option-label" style={{marginTop: '6px', textAlign: 'right'}}>
          <span className="fpvcm-input-label">{txt('optionsLadyLogSocket', props.config.lang)}:</span>
        </Grid>
        <Grid xl={3} lg={3} md={6} sm={6} xs={6}>
          <TextField
            name="ladyLogSocket"
            variant="outlined"
            type="text"
            placeholder="fpvc-lady.socket.log"
            value={formConfig.ladyLogSocket}
            onChange={handleChange}
            disabled={!props.config.ladySettingsSynced || !props.ladyUp}
            style={{minWidth: '75%'}}
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
      </Grid>
    </Box>
  );
}

export default Options;