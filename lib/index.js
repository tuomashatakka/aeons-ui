'use babel';

import { Disposable, CompositeDisposable } from 'atom'
import { observeThemeView } from './settings-view'

/**
 * Package name
 * @type {string}
 */

const packName      = 'icaros-ui'

/**
 * Base font size for the UI scaling
 * @type {number}
 */

const baseFontSize   = 11
const baseLayoutSize = 16

/**
 * Config descriptor for the UI scaling & sizing settings
 * @type {string}
 */

const layoutScaleKey = `${packName}.layout.scale`
const layoutSizeKey  = `${packName}.layout.size`


/**
 * Default Atom package lifecycle methods
 * @type {Object}
 */

export default {

  activate() {

    this.subscriptions = new CompositeDisposable()

    let { modal, left, right } = atom.workspace.panelContainers
    let panels = container => container.getPanels()
    let sub = panel => this.subscriptions.add(observeModalVisibility(panel))
    let recalculateIndexes = container => {
      let index = 0;
      let panels = Array.from(document.querySelectorAll(`atom-panel.${container}:not(.hidden)`))
      if (container === 'left')
        panels = panels.reverse()
      panels.forEach(o => (parseInt(getComputedStyle(o).width) > 0)
        ?  o.setAttribute('index', index++)
        :  o.removeAttribute('index'))
    }

    // Subscribe to modals' open handlers
    panels(modal).forEach(sub)
    recalculateIndexes('left')
    recalculateIndexes('right')


    // Watch for the changes in package config
    this.subscriptions.add(
      modal.onDidAddPanel(sub),
      left.onDidAddPanel(() => recalculateIndexes('left')),
      right.onDidAddPanel(() => recalculateIndexes('right')),
      atom.config.observe(layoutScaleKey, setLayoutSpacing),
      atom.config.observe(layoutSizeKey, setFontSize)
    )
    observeThemeView()

  },

  deactivate() {
    this.subscriptions.dispose() }

}

/**
 * Scale the font size for the UI to a given value
 *
 * @method setFontSize
 *
 * @param  {number}    scl Scale factor in percents
 *                         (base for scaling is `baseFontSize`)
 */

function setFontSize (scl) {
  writeProp('font-size', (scl / 100 * baseFontSize) + 'px')
}


/**
 * Scale the UI to a given value
 *
 * @method setFontSize
 *
 * @param  {number}    scl Scale factor in percents
 *                         (base for scaling is `baseFontSize`)
 */

function setFontSize (scl) {
  writeProp('font-size', (scl / 100 * baseFontSize) + 'px', document.body)
}

function setLayoutSpacing (scl) {
  writeProp('font-size', (scl / 100 * baseLayoutSize) + 'px')
}


/**
 * Write a style property for the given element
 *
 * @method writeProp
 *
 * @param  {string}  key      Name of the property
 * @param  {string}  val      Property value, or null to remove the property. Default null
 * @param  {Element} element  Target element. Default document.documentElement
 *
 */

function writeProp (key, val=null, element=document.documentElement) {
  element.style.setProperty(key, val)
}



/**
 * Set a value for an attribute of an element
 *
 * @method writeProp
 *
 * @param  {string}  key      Name of the property
 * @param  {string}  val      Property value, or null to remove the property. Default null
 * @param  {Element} element  Target element. Default document.documentElement
 *
 */

function writeAttr (key, val=null, element=document.documentElement) {
  element.setAttribute(key, val)
}


/**
 * Toggle class for element
 *
 * @method toggleClass
 *
 * @param  {string}    className  Class to toggle
 * @param  {boolean}   state      New toggle state. Default null
 * @param  {Element}   element    Target element. Default document.documentElement
 */

function toggleClass (className, state=null, element=document.documentElement) {
  element.classList.toggle(className, state)
}


/**
 * Start observing for visibility changes for the given modal panel
 *
 * @method observeModalVisibility
 *
 * @param  {Panel}      modal Atom panel
 * @return {Disposable}       Disposable for the onDidChangeVisible handler.
 *                            Void if binding fails
 */

function observeModalVisibility (modal) {

  let panel = modal.panel || modal || {}
  // toggleClass('modal-open', panel.visible || workspaceHasModalOpen())

  if (panel.onDidChangeVisible)
    return panel.onDidChangeVisible(state =>
      toggleClass('modal-open', state || workspaceHasModalOpen()))
  return new Disposable(() => {})
}

function workspaceHasModalOpen () {

  let modalPanels    = atom.workspace.panelContainers.modal.getPanels() || []
  let domModalPanels = Array.from(document.querySelectorAll('atom-panel.modal'))

  for (let panel of modalPanels) {
    if (panel.visible)
      return true
  }

  for (let panel of domModalPanels) {
    if (panel.style.display !== 'none')
      return true
  }

  return false
}
