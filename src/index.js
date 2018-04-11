'use babel';

import { CompositeDisposable } from 'atom'
import { observeModalVisibility, forPanel } from './utils'
import config from './config'

export default {

  config: require("./config.json"),

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable()

    atom.notifications.addSuccess('Activating phase MOD')
    let { modal, left, right } = atom.workspace.panelContainers

    let panels = container =>
      container.getPanels()

    let sub = panel =>
      this.subscriptions.add(observeModalVisibility(panel))

    let recalculateIndexes = container => {
      let index = 0;
      let panels = Array.from(document.querySelectorAll(`.${container} atom-panel:not(.hidden)`))
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

    let recalculateHorizontalIndexes = () => {
      recalculateIndexes('left')
      recalculateIndexes('right') }

    let observePanelVisibilityChanges = panel =>
      panel.onDidChangeVisible(recalculateHorizontalIndexes)

    forPanel(observePanelVisibilityChanges)

    console.info(config.palette, config.updatePalette)

    // Watch for the changes in package config
    this.subscriptions.add(
      modal.onDidAddPanel(sub),
      left.onDidAddPanel(() => recalculateIndexes('left')),
      right.onDidAddPanel(() => recalculateIndexes('right')),
      left.onDidRemovePanel(() => recalculateIndexes('left')),
      right.onDidRemovePanel(() => recalculateIndexes('right')),
      atom.config.observe(config.palette, config.updatePalette),
      atom.config.observe(config.layout.statusBarHeight, config.setStatusBarHeight),
      atom.config.observe(config.layout.tabHeight, config.setTabHeight),
      atom.config.observe(config.layout.scale, config.setLayoutSpacing),
      atom.config.observe(config.layout.size, config.setFontSize),
      atom.config.observe(config.display.dockTabs, config.toggleDockTabs),
      atom.config.observe(config.display.coloredTabs, config.toggleTabColors),
      atom.config.observe(config.display.enlargedHeadlines, config.toggleEnlargedHeadlines),
      atom.config.observe(config.display.overrideEditorBackground, config.overrideEditorBackground),
    )
    // observeThemeView()
  },

  deactivate() {
    atom.notifications.addError('Deactivating phase MOD')
    this.subscriptions.dispose()
  }

}
