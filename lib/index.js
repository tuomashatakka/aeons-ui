'use babel';

import { CompositeDisposable } from 'atom'
import { observeThemeView } from './settings-view'

const packName      = 'icaros-ui'

const baseFontSize  = 16

export default {

  activate() {

    this.subscriptions = new CompositeDisposable()

    let scaleKey = `${packName}.layout.scale`
    let { modal } = atom.workspace.panelContainers
    let panels = modal.getPanels()
    let sub = panel => this.subscriptions.add(observeModalVisibility(panel))
    let setFontSize = scl => writeProp('font-size', (scl / 100 * baseFontSize) + 'px')

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
 * Write a style property for the given element
 *
 * @method writeProp
 *
 * @param  {string}  key                                Name of the property
 * @param  {string}  [val=null]                         Property value, or null
 *                                                      to remove the proeprty
 * @param  {Element} [element=document.documentElement] Target element
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
 * @param  {string}    className                          Class to toggle
 * @param  {boolean}   [state=null]                       New toggle state
 * @param  {[type]}    [element=document.documentElement] Target element
 */

function toggleClass (className, state=null, element=document.documentElement) {
  element.classList.toggle(className, state)
}

/**
 * Start observing for visibility changes for the given modal panel
 *
 * @method observeModalVisibility
 *
 * @param  {Panel}                modal Atom panel
 * @return {Disposable}           Disposable for the onDidChangeVisible handler.
 *                                Void if binding fails
 */

function observeModalVisibility (modal) {
  try {
    let panel = modal.panel || modal
    return panel.onDidChangeVisible(state => toggleClass('modal-open', state))
  }
  catch(e) {
    if (atom.devMode)
      console.warn(e)
  }
}
