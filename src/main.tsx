import * as React from 'react'
import { render } from 'react-dom'


function init() {
  const App = require('./App').default;
  render(<App />, document.getElementById('app'))
}

init()