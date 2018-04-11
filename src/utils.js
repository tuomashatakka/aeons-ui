'use babel'

import filesystem from 'fs'
import { Disposable, CompositeDisposable } from 'atom'
import { resolve } from 'path'
import { packName } from './config'


export function setVariable(key, val, root='body') {
  let tab = document.querySelectorAll(root)
  tab.forEach(el => el.style.setProperty('--' + key, val))
}

export function setProperty(key, val, root='body') {
  let els = document.querySelectorAll(root)
  els.forEach(el => el.setAttribute('data-' + key, val))
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

export function writeProp (key, val=null, element=document.documentElement) {
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

export function writeAttr (key, val=null, element=document.documentElement) {
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

export function toggleClass (className, state=null, element=document.documentElement) {
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

export function observeModalVisibility (modal) {

  let panel = modal.panel || modal || {}
  // toggleClass('modal-open', panel.visible || workspaceHasModalOpen())

  if (panel.onDidChangeVisible)
    return panel.onDidChangeVisible(state =>
      toggleClass('modal-open', state || workspaceHasModalOpen()))
  return new Disposable(() => {})
}

export function workspaceHasModalOpen () {

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

export function forPanel (mapFunction) {
  let { left, right }    = atom.workspace.panelContainers
  let panels = left.getPanels().concat(...right.getPanels())
  return panels.map(panel => mapFunction.call(panel, panel, panel.item))
}

export function getGrandparent (item, attr='tagName', val='ATOM-PANEL') {
  while (item) {
    if (item[attr] === val)
      return item
    item = item.parentElement
  }
  return null
}

export function onPanelOpen (fnc, positions=['left', 'right']) {
  let containers  = atom.workspace.panelContainers
  let subscriptions = new CompositeDisposable()
  for (let pos of positions) {
    let container = containers[pos]
    subscriptions.add(container.onDidAddPanel(panel => fnc.call(panel)))
  }
  return subscriptions
}



export function objectToLessVariables (obj) {

  function process () {
    if (this.toJSON)
      return this.toJSON()
    return this.toString()
  }

  return Object
    .keys(obj)
    .map(key => `@${key}:${Array(30-key.length).join(' ')}${process.call(obj[key])};`)
    .join('\n')

}



export function _writeLessStylesheet (fp, up, config={}) {

  try {
    let stream = objectToLessVariables(config)
    filesystem.writeFileSync(fp, stream + '\n', 'utf8')
    let { themes } = atom
    // themes.applyStylesheet('phase-mod-conf',
    themes.loadLessStylesheet( up )
    // )
    // themes.refreshLessCache()
  }

  catch(error) {
    console.warn(error) // eslint-disable-line
    try { atom.notifications.addError(error, { dismissable: true }) }
    catch (e) { }
  }
}


export function writeLessStylesheet (stylesheetName, config={}) {

  let pack = atom.packages.getLoadedPackage(packName)
  let { path, stylesheets } = pack
  let contents = objectToLessVariables(config)

  stylesheetName = resolve(path, 'styles', stylesheetName)
  console.info(stylesheetName, contents)
  filesystem.writeFileSync(stylesheetName, contents, 'utf8')
  stylesheets.forEach(stylesheet => {
    let sourcePath = stylesheet[0]

    try {
      let source = atom.themes.loadLessStylesheet(sourcePath)
      let params = { sourcePath, }
      let disposable = atom.styles.addStyleSheet(source, params )
      pack.onDidDeactivate(() => disposable.dispose())
    }
    catch(e) {
      if (atom.devMode)
        console.log("Error at reading the stylesheet in", sourcePath)
    }
  })
}
