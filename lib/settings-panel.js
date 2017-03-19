'use babel'
// @jsx etch.dom

import etch from 'etch'

const packName = 'icaros-ui'

let input

export default function createPackageDetailView () {

  input = input ||
          new RangeInput(`${packName}.layout.scale`)

  return input.element

}

class RangeInput {

  constructor (key) {

    this.key    = key
    this.schema = atom.config.getSchema(this.key)
    this.value  = atom.config.get(this.key) || this.schema.default

    etch.initialize(this)

  }

  onChange (value) {

    this.value = value

    atom.config.set(this.key, value)
    this.update()

  }

  update () {
    console.log("Updating this", this)
    this.refs.value.innerHTML = this.value
  }
  render () {

    let { title, minimum, maximum } = this.schema
    let { value } = this

    return (
      <label style={{display: 'flex'}} className='output-indicator-input'>
        <h3>{title}</h3>
        <span className='badge'>{minimum}</span>
        <output className='badge' ref='value'>{value}</output>
        <input
          type='range'
          id='icaros-ui.layout.scale'
          min={minimum}
          max={maximum}
          value={value}
          onChange={({ target }) => this.onChange(target.value)}
          onDblClick={() => this.onChange(100)}
          />
        <span className='badge'>{maximum}</span>
      </label>
    )
  }
}
