// # vim: set shiftwidth=2 tabstop=2 softtabstop=2 expandtab:
  
var datgui = require('dat-gui');

module.exports = function(game, opts) {
  return new PluginsUI(game, opts);
};

function PluginsUI(game, opts) {
  this.game = game;
  this.plugins = this.game.plugins;

  opts = opts || {};

  this.gui = opts.gui || new datgui.GUI();
  this.folder = this.gui.addFolder('plugins');

  this.pluginState = {};

  var list = this.plugins.listAll();

  for (var i = 0; i < list.length; ++i) {
    var name = list[i];

    this.pluginState[name] = this.plugins.isEnabled(name);

    this.folder.add(this.pluginState, name).onChange(setStateForPlugin(this, name));
  }
}

function setStateForPlugin(self, name) {
  return function(newState) {
    if (newState)
      self.plugins.enable(name);
    else
      self.plugins.disable(name);
  };
}
