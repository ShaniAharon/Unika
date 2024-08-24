import configProd from './prod.js'
import configDev from './dev.js'
import dotenv from 'dotenv'; //import the dotenv 

dotenv.config(); // add the config

export var config

if (process.env.NODE_ENV === 'production') {
  config = configProd
} else {
  config = configProd
}
config.isGuestMode = true
