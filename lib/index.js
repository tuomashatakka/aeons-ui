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

const baseFontSize  = 16

/**
 * Config descriptor for the UI scaling setting
 * @type {string}
 */

const scaleKey      = `${packName}.layout.scale`


/**
 * Default Atom package lifecycle methods
 * @type {Object}
 */

export default {

  activate() {

    this.subscriptions = new CompositeDisposable()

    let { modal } = atom.workspace.panelContainers
    let panels = modal.getPanels()
    let sub = panel => this.subscriptions.add(observeModalVisibility(panel))

    // Subscribe to modals' open handlers
    panels.forEach(sub)
    modal.onDidAddPanel(sub)

    // Watch for the changes in package config
    atom.config.observe(scaleKey, setFontSize)
    observeThemeView()

  },

  deactivate() {
    this.subscriptions.dispose() }

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
  writeProp('font-size', (scl / 100 * baseFontSize) + 'px')
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
