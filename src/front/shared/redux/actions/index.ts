import config from 'app-config'

import * as types from './types'

import modals from './modals'
import loader from './loader'
import notifications from './notifications'

import user from './user'
import history from './history'
import feed from './feed'
import core from './core'
import ui from './ui'
import filter from './filter'

import btc from './btc'
import ghost from './ghost'
import next from './next'
import btcmultisig from './btcmultisig'
import eth from './eth'
import token from './token'

import api from './api'
import pairs from './pairs'
import analytics from './analytics'

import pubsubRoom from './pubsubRoom'

import invoices from './invoices'
import comments from './comments'

import backupManager from './backupManager'

import multisigTx from './multisigTx'

const bnb = eth
const tokens = {}

Object.keys(config.erc20)
  .forEach(key => {
    tokens[key] = token
  })

export default {
  ...tokens,
  types,
  filter,
  modals,
  loader,
  notifications,
  user,
  history,
  core,
  ui,

  btc,
  btcmultisig,
  eth,
  bnb,
  ghost,
  next,

  token,
  feed,
  analytics,
  pubsubRoom,
  api,
  pairs,
  invoices,
  comments,

  // Local storage backups manager
  backupManager,

  multisigTx,
}
