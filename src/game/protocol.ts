export enum Command {
  ACCELERATE = 'accelerate',
  TURN_LEFT = 'left',
  TURN_RIGHT = 'right'
}

export enum CommandState {
  START,
  STOP
}

export const CLIENT_COMMAND = 'cmd'

export const CLIENT_REPORT = 'report'
export const CLIENT_STATUS = 'status'
