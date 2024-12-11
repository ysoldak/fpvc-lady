import Axios from 'axios'
const apiUrl = process.env.REACT_APP_MOCK_API_URL
const demoMode = process.env.REACT_APP_DEMO_MODE

Axios.defaults.withCredentials = true;

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
}

const gameService = {
  
  getGameStatus() {
    return Axios.get(apiUrl + (demoMode.toString() === '1' ? '' : "game"), {}, config)
  },
  
  setGameStatus(round_status, round_remaining_seconds, round_countdown_seconds) {
    let updateObj = {round_status, round_remaining_seconds, round_countdown_seconds}
    return Axios.patch(apiUrl + "game", JSON.stringify(updateObj), config)
  }

}

export default gameService