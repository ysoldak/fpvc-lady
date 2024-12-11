import Axios from 'axios'
const apiUrl = process.env.REACT_APP_MOCK_API_URL
const demoMode = process.env.REACT_APP_DEMO_MODE

Axios.defaults.withCredentials = true;

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
}

const configService = {

  getConfig() {
    return Axios.get(apiUrl + (demoMode.toString() === '1' ? '' : "config"), {}, config)
  },
  
  updateConfig(label, value) {
    if (demoMode.toString() === '1') {
      return Axios.get(apiUrl + (demoMode.toString() === '1' ? '' : "config"), {}, config)
    }
    let updateObj = {}
    updateObj[label] = value
    return Axios.patch(apiUrl + "config", JSON.stringify(updateObj), config)
  },

}

export default configService