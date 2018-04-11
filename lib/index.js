'use babel';

import { Disposable, CompositeDisposable } from 'atom'
import { observeThemeView } from './settings-view'

/**
 * Package name
 * @type {string}
 */

const packName      = 'raven-ui'


const raise = (t, ...args) => {
  let prefix = `[ ${packName}:${t} ]`
  let json
  try {
    json = JSON.stringify(args, null, 2)
  }
  catch (e) {
    json = args.join('\n')
  }
  atom.notifications.add(t,
    "<pre>" + json + "</pre>")
  let exec = (console[t] ? console[t] : console.warn)
  exec(prefix, '\n', ...args)
}

/**
 * Base font size for the UI scaling
 * @type {number}
 */

const baseStatusBarHeight = 2.5
const baseTabHeight  = 2.5
const baseFontSize   = 14
const baseLayoutSize = 16

/**
 * Config descriptor for the UI scaling & sizing settings
 * @type {string}
 */

const layoutDescriptor = `${packName}.layout`
const layoutStatusBarHeightKey = `${layoutDescriptor}.statusBarHeight`
const layoutTabHeightKey = `${layoutDescriptor}.tabHeight`
const layoutScaleKey = `${layoutDescriptor}.scale`
const layoutSizeKey  = `${layoutDescriptor}.size`


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

    // Add collapse buttons to left and right panels
    // let panelToggleHandleSubscriptions =
    const addToggleHandleToPanel = (panel, item) => {

      item = item ? item.element || item : {}
      let panelElement = getGrandparent(item)

      if (!panel) {
        raise('error', "[ravenUI:err.toggleHandle.init]", { panel, item, self: this })
        return;
      }
      if (panel.toggleHandle) {
        panel.toggleHandle.remove()
        panel.toggleHandle = null
      }

      panel.toggleHandle = document.createElement('span')
      panel.toggleHandle.classList.add('rv-toggle-handle', 'btn', 'icon', 'icon-move-right')
      raise('warning', "panelElement", panelElement)
      if (!panelElement)
        panelElement = item
      if (!panelElement)
        return

      if (panelElement.appendChild)
        panelElement.appendChild(panel.toggleHandle)

      panel.isOpen = () => !panelElement.classList.contains('collapsed')
      panel.collapse = () => panelElement.classList.add('collapsed')
      panel.expand = () => panelElement.classList.remove('collapsed')
      panel.toggle = () => panel.isOpen() ? panel.collapse() : panel.expand()

      // panel.removeToggleListener = () => panel.toggleHandle.removeEventListener('click', toggle)
      panel.toggleHandle.addEventListener('click', panel.toggle)

    }

    forPanel(addToggleHandleToPanel)
    console.log(setStatusBarHeight)
    window.sb = setStatusBarHeight
    // Watch for the changes in package config
    this.subscriptions.add(
      // panelToggleHandleSubscriptions,
      onPanelOpen(addToggleHandleToPanel),
      modal.onDidAddPanel(sub),
      left.onDidAddPanel(() => recalculateIndexes('left')),
      right.onDidAddPanel(() => recalculateIndexes('right')),
      atom.config.observe(layoutStatusBarHeightKey, setStatusBarHeight),
      atom.config.observe(layoutTabHeightKey, setTabHeight),
      atom.config.observe(layoutScaleKey, setLayoutSpacing),
      atom.config.observe(layoutSizeKey, setFontSize),
    )
    // observeThemeView()

  },

  deactivate() {
    this.subscriptions.dispose()
  }

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
  writeProp('font-size', (scl / 100 * baseFontSize) + 'px', document.body)
}


function setVariable(key, val, root='body') {
  let el = document.querySelector(root)
  el.style.setProperty('--' + key, val)
}


function setTabHeight (scl) {
  let val = (scl * baseTabHeight) + 'rem'
  return setVariable('height', val, 'atom-workspace-axis.horizontal .tab-bar')
}


function setStatusBarHeight (scl) {
  let val = (scl * baseStatusBarHeight) + 'rem'
  return setVariable('height', val, 'status-bar')
}


/**
 * Scale the UI spacing according to the given value
 *
 * @method setLayoutSpacing
 *
 * @param  {number}    scl Scale factor in percents
 *                         (base for scaling is `baseLayoutSize`)
 */

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
  let domModalPanels = Array.from(document.querySelectorAll('.modal > atom-panel.modal'))

  for (let panel of modalPanels) {
    if (panel.visible)
      return panel
  }

  for (let panel of domModalPanels) {
    if (panel.style.display !== 'none')
      return panel
  }

  return false
}

function forPanel (mapFunction) {
  let { left, right }    = atom.workspace.panelContainers
  let panels = left.getPanels().concat(...right.getPanels())
  return panels.map(panel => mapFunction.call(panel, panel, panel.item))
}

function getGrandparent (item, attr='tagName', val='ATOM-PANEL') {
  while (item) {
    if (item[attr] === val)
      return item
    item = item.parentElement
  }
  return null
}

function onPanelOpen (fnc, positions=['left', 'right']) {
  let containers  = atom.workspace.panelContainers
  let subscriptions = new CompositeDisposable()
  for (let pos of positions) {
    let container = containers[pos]
    subscriptions.add(container.onDidAddPanel(panel => fnc.call(panel)))
  }
  return subscriptions
}
