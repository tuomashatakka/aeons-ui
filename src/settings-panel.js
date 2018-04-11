'use babel'
// @jsx etch.dom

import etch from 'etch'

const packName = 'icaros-ui'

let container, inputs

export default function createPackageDetailView () {

  container  = container || document.createElement('section')
  inputs = inputs || {
    scale: new RangeInput(`${packName}.layout.scale`),
    size:  new RangeInput(`${packName}.layout.size`)
  }
  for (let field in inputs) {
    let input = inputs[field]
    container.appendChild(input.element)
  }

  return container

}


class Field {

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
    this.refs.value.innerHTML = this.value
  }

  render () {
    let { title } = this.schema
    let { value } = this
    return ( <input name={title} value={value} /> )
  }

}


class RangeInput extends Field {

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
