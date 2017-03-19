'use babel';

import { CompositeDisposable } from 'atom'

export default {

  activate() {

    this.subscriptions = new CompositeDisposable()
    let { modal } = atom.workspace.panelContainers
    let panels = modal.getPanels()
    let sub = panel => this.subscriptions.add(observeModalVisibility(panel))

    panels.forEach(sub)
    modal.onDidAddPanel(sub)

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
      'io-ui:toggle': () => this
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

};

function toggleClass (className, state=null, element=document.documentElement) {
  element.classList.toggle(className, state)
}

function observeModalVisibility (modal) {
  console.log("observeModalVisibility", modal)
  try {
    let { panel } = modal
    return (panel || modal).onDidChangeVisible(state => {
      console.log(modal)
      console.log(state)
      return toggleClass('modal-open', state)
    })
  }
  catch(e) {
    console.warn(e)
  }
}
