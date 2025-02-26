import SettingsIcon from '@mui/icons-material/Settings'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

import IconCheers from '../component/svg/IconCheers.js'
import IconDeath from '../component/svg/IconDeath.js'
import IconMute from '../component/svg/IconMute.js'
import IconDadJokes from '../component/svg/IconDadJokes.js'

import txt from '../locale/locale'

function HeaderMenu(props) {

  return (
    <div className="fpvcm-top-settings">
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <IconCheers stroke={props.config.ladySpeakCheers ? 'yellow' : 'gray'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySpeakCheers ? 'yellow' : 'gray'}}>&nbsp;{txt('optionsShortLadySpeakCheers', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <FavoriteBorderIcon style={{color: props.config.ladySpeakLives ? 'red' : 'gray'}} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySpeakLives ? 'red' : 'gray'}}>&nbsp;{txt('optionsShortLadySpeakLives', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <IconDadJokes stroke={props.config.ladySpeakDadJokes? 'yellow' : 'gray'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySpeakDadJokes ? 'yellow' : 'gray'}}>&nbsp;{txt('optionsShortLadySpeakDadJokes', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <IconDeath stroke={props.config.ladySpeakDeaths ? 'red' : 'gray'} />
          <span className="fpvcm-top-settings_label hide-narrow" style={{color: props.config.ladySpeakDeaths ? 'red' : 'gray'}}>&nbsp;{txt('optionsShortLadySpeakDeaths', props.config.lang)}</span>
        </div>
      }
      {props.isAdmin && 
        <div className="fpvcm-top-settings_element" onClick={props.toggleSettings}>
          <IconMute stroke={props.config.ladySpeakMute ? 'cyan' : 'gray'} fill={props.config.ladySpeakMute ? 'cyan' : 'gray'} />
          <span className="fpvcm-top-settings_label hide-narrow"style={{color: props.config.ladySpeakMute ? 'cyan' : 'gray'}}>&nbsp;{txt('optionsShortLadySpeakMute', props.config.lang)}</span>
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