import Axios from 'axios'
const apiUrl = process.env.REACT_APP_MOCK_API_URL

Axios.defaults.withCredentials = true;

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
}

const configService = {
  
  getConfig() {
    return Axios.get(apiUrl + "config", {}, config)
  },
  
  updateConfig(label, value) {
    let updateObj = {}
    updateObj[label] = value
    return Axios.patch(apiUrl + "config", JSON.stringify(updateObj), config)
  },

}

export default configService