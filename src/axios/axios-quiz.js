import axios from 'axios'

export default axios.create({
  baseURL: 'https://react-qiuz-8f35e.firebaseio.com/'
})