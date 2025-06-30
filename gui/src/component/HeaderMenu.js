import { useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

import IconCheers from '../component/svg/IconCheers.js'
//import IconDeath from '../component/svg/IconDeath.js'
//import IconMute from '../component/svg/IconMute.js'
//import IconDadJokes from '../component/svg/IconDadJokes.js'

import txt from '../locale/locale'

function HeaderMenu(props) {

  const [mockDadJokes, setMockDadJokes] = useState(false)
  const [mockDeaths, setMockDadDeaths] = useState(false)
  const [mockMute, setMockMUte] = useState(false)

  function actions(action) {
    if (!props.isAdmin) {
      return
    }
    switch (action) {
      case 'cheers': props.sendConfig({speakCheers: !props.config.ladySpeakCheers}, true); break;
      case 'lives': props.sendConfig({speakLives: !props.config.ladySpeakLives}, true); break;
      case 'dadJokes': setMockDadJokes(!mockDadJokes); break;
      case 'deaths': setMockDadDeaths(!mockDeaths); break;
      case 'mute': setMockMUte(!mockMute); break;
      case 'settings': props.toggleSettings(); break;
      default: return;
    }
  }

  return (
    <div className="fpvcm-top-settings">
      <div className={"fpvcm-top-settings" + (props.isAdmin ? "_element" : "_readonly")} onClick={() => actions('cheers')}>
        <IconCheers stroke={props.config.ladySettingsSynced ? props.config.ladySpeakCheers ? 'yellow' : 'gray' : '#333333'} />
        <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakCheers ? 'yellow' : 'gray' : '#333333'}}>
          &nbsp;{txt('optionsShortLadySpeakCheers', props.config.lang)}
        </span>
      </div>
      <div className={"fpvcm-top-settings" + (props.isAdmin ? "_element" : "_readonly")} onClick={() => actions('lives')}>
        <FavoriteBorderIcon style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakLives ? 'red' : 'gray' : '#333333'}} />
        <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? props.config.ladySpeakLives ? 'red' : 'gray' : '#333333'}}>
          &nbsp;{txt('optionsShortLadySpeakLives', props.config.lang)}
        </span>
      </div>
      {/*
      <div className={"fpvcm-top-settings" + (props.isAdmin ? "_element" : "_readonly")} onClick={() => actions('dadJokes')}>
        <IconDadJokes stroke={props.config.ladySettingsSynced ? mockDadJokes ? 'yellow' : 'gray' : '#333333'} />
        <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? mockDadJokes ? 'yellow' : 'gray' : '#333333'}}>
          &nbsp;{txt('optionsShortLadySpeakDadJokes', props.config.lang)}
        </span>
      </div>
      <div className={"fpvcm-top-settings" + (props.isAdmin ? "_element" : "_readonly")} onClick={() => actions('deaths')}>
        <IconDeath stroke={props.config.ladySettingsSynced ? mockDeaths ? 'darkred' : 'gray' : '#333333'} />
        <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySettingsSynced ? mockDeaths ? 'darkred' : 'gray' : '#333333'}}>
          &nbsp;{txt('optionsShortLadySpeakDeaths', props.config.lang)}
        </span>
      </div>
      <div className={"fpvcm-top-settings" + (props.isAdmin ? "_element" : "_readonly")} onClick={() => actions('mute')}>
        <IconMute stroke={props.config.ladySettingsSynced ? mockMute ? '#00b50f' : 'gray' : '#333333'} fill={props.config.ladySettingsSynced ? mockMute ? '#00b50f' : 'gray' : '#333333'} />
        <span className="fpvcm-top-settings_label hide-narrow"style={{color: props.config.ladySettingsSynced ? mockMute ? '#00b50f' : 'gray' : '#333333'}}>
          &nbsp;{txt('optionsShortLadySpeakMute', props.config.lang)}
        </span>
      </div>
      */}
      {props.isAdmin &&
        <div className="fpvcm-top-settings_element" onClick={() => actions('settings')}>
          <SettingsIcon /><span className="fpvcm-top-settings_label hide-narrow">
            &nbsp;{txt('options', props.config.lang)}
          </span>
        </div>
      }
    </div>
  );
}

export default HeaderMenu;