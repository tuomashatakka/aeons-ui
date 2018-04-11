'use babel'

import { setProperty, setVariable, writeAttr, writeProp, writeLessStylesheet } from './utils'

/**
 * Package name
 * @type {string}
 */

export const packName      = 'phase-mod-ui'
export const baseStatusBarHeight = 2.5
export const baseTabHeight       = 2.5
export const baseFontSize        = 14
export const baseLayoutSize      = 16

const layoutDescriptor         = `${packName}.layout`
const displayDescriptor        = `${packName}.display`
const paletteDescriptor        = `${packName}.palette`
const layoutSizeKey            = `${layoutDescriptor}.size`
const layoutScaleKey           = `${layoutDescriptor}.scale`
const layoutTabHeightKey       = `${layoutDescriptor}.tabHeight`
const layoutStatusBarHeightKey = `${layoutDescriptor}.statusBarHeight`
const displayDockTabsKey       = `${displayDescriptor}.dockTabs`
const displayColoredTabsKey    = `${displayDescriptor}.coloredTabs`
const displayEnlargedHeadlines = `${displayDescriptor}.bigHeadings`
const displayOverrideBackground = `${displayDescriptor}.overrideEditorBackground`

export const layout = {
  size: layoutSizeKey,
  scale: layoutScaleKey,
  tabHeight: layoutTabHeightKey,
  statusBarHeight: layoutStatusBarHeightKey,
}

export const display = {
  dockTabs: displayDockTabsKey,
  coloredTabs: displayColoredTabsKey,
  enlargedHeadlines: displayEnlargedHeadlines,
  overrideEditorBackground: displayOverrideBackground,
}

export const palette = paletteDescriptor

/**
 * Scale the font size for the UI to a given value
 *
 * @method setFontSize
 *
 * @param  {number}    scl Scale factor in percents
 *                         (base for scaling is `baseFontSize`)
 */

export function setFontSize (scl) {
  writeProp('font-size', (scl / 100 * baseFontSize) + 'px', document.body)
}

/**
 * Scale the UI spacing according to the given value
 *
 * @method setLayoutSpacing
 *
 * @param  {number}    scl Scale factor in percents
 *                         (base for scaling is `baseLayoutSize`)
 */

export function setLayoutSpacing (scl) {
  let val = (scl / 100 * baseLayoutSize) + 'px'
  writeProp('font-size', val)
}

export function toggleDockTabs (state) {
  setProperty('visible', state, 'atom-dock .tab-bar')
}

export function toggleTabColors (state) {
  writeAttr('tab-coloring', state)
}

export function toggleEnlargedHeadlines (state) {
  writeAttr('enlarged-headlines', state)
}

export function overrideEditorBackground (state) {
  writeAttr('override-editor-background', state)
}

export function setTabHeight (scl) {
  let val = (scl * baseTabHeight) + 'rem'
  return setVariable('height', val, 'atom-workspace-axis.horizontal .tab-bar')
}

export function setStatusBarHeight (scl) {
  let val = (scl * baseStatusBarHeight) + 'rem'
  return setVariable('height', val, 'status-bar')
}

export function updatePalette (config) {
  let name = 'user.less'
  writeLessStylesheet(name, config)
}

export default module.exports
