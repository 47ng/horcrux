import dotenv from 'dotenv'
import checkEnv from '@47ng/check-env'

export default function configureEnvironment() {
  dotenv.config()
  checkEnv({
    required: [
      'HORCRUX_SERVER_ID',
      'HORCRUX_TOTP_KEY',
      'HORCRUX_SIG_PUBLIC',
      'HORCRUX_SIG_SECRET',
      'HORCRUX_SECRET_FRAGMENT'
    ]
  })
}
