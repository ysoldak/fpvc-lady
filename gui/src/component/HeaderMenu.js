import { useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

import IconCheers from '../component/svg/IconCheers.js'
import IconDeath from '../component/svg/IconDeath.js'
import IconMute from '../component/svg/IconMute.js'
import IconDadJokes from '../component/svg/IconDadJokes.js'

import txt from '../locale/locale'

function HeaderMenu(props) {

  const [mockDadJokes, setMockDadJokes] = useState(false)
  const [mockDeaths, setMockDadDeaths] = useState(false)
  const [mockMute, setMockMUte] = useState(false)

  return (
    <div className="fpvcm-top-settings">
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={() => props.sendConfig({speakCheers: !props.config.ladySpeakCheers}, true)}>
          <IconCheers stroke={props.config.ladySettingsSynced ? props.config.ladySpeakCheers ? 'yellow' : 'gray' : '#333333'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakCheers ? 'yellow' : 'gray' : '#333333'}}>&nbsp;{txt('optionsShortLadySpeakCheers', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={() => props.sendConfig({speakLives: !props.config.ladySpeakLives}, true)}>
          <FavoriteBorderIcon style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakLives ? 'red' : 'gray' : '#333333'}} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakLives ? 'red' : 'gray' : '#333333'}}>&nbsp;{txt('optionsShortLadySpeakLives', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={() => setMockDadJokes(!mockDadJokes)}>
          <IconDadJokes stroke={props.config.ladySettingsSynced ? mockDadJokes ? 'yellow' : 'gray' : '#333333'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? mockDadJokes ? 'yellow' : 'gray' : '#333333'}}>&nbsp;{txt('optionsShortLadySpeakDadJokes', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={() => setMockDadDeaths(!mockDeaths)}>
          <IconDeath stroke={props.config.ladySettingsSynced ? mockDeaths ? 'darkred' : 'gray' : '#333333'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? mockDeaths ? 'darkred' : 'gray' : '#333333'}}>&nbsp;{txt('optionsShortLadySpeakDeaths', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={() => setMockMUte(!mockMute)}>
          <IconMute stroke={props.config.ladySettingsSynced ? mockMute ? 'cyan' : 'gray' : '#333333'} fill={props.config.ladySettingsSynced ? mockMute ? '#6ecc67' : 'gray' : '#333333'} />
          <span className="fpvcm-top-settings_label hide-narrow"style={{color: props.config.ladySettingsSynced ? mockMute ? '#6ecc67' : 'gray' : '#333333'}}>&nbsp;{txt('optionsShortLadySpeakMute', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <SettingsIcon /><span className="fpvcm-top-settings_label hide-narrow">&nbsp;{txt('options', props.config.lang)}</span>
        </div>
      }
    </div>
  );
}

export default HeaderMenu;