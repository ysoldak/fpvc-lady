import * as React from 'react'

import animation from '../img/lady_loading.gif'

import txt from '../locale/locale'

function Loading(props) {

  return (
    <div style={{display: "flex", alignItems: "center", justifyContent: "center", position: "relative", right: "-20%"}}>
      <img src={animation} alt="Loading" style={{maxHeight: '45px', marginRight: '10px'}} />
      <span className="loading_info">{txt('loading', props.lang)}...</span>
    </div>
  );
}

export default Loading;
