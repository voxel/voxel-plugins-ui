'use strict';

if (typeof window === 'undefined') return; // browser only

var datgui = require('dat-gui');

module.exports = function(game, opts) {
  return new PluginsUI(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-debug']    // for appending to its gui, if available
};

function PluginsUI(game, opts) {
  this.game = game;
  this.plugins = this.game.plugins;

  opts = opts || {};

  this.gui = opts.gui || (game.plugins && game.plugins.get('voxel-debug') ? game.plugins.get('voxel-debug').gui : new datgui.GUI());
  this.folder = this.gui.addFolder('plugins');

  this.pluginState = {};
  this.pluginItems = {};

  // add all existing plugins, already loaded
  var list = this.plugins.listAll();
  for (var i = 0; i < list.length; ++i) {
    this.addPlugin(list[i]);
  }

  // and listen for events for new plugins, which haven't loaded yet
  this.plugins.on('new plugin', function(name) {
    self.addPlugin(name);
  });

  // update GUI when plugin is enabled/disabled by something else
  var self = this;
  this.plugins.on('plugin enabled', function(name) {
    self.pluginState[name] = true;
    self.pluginItems[name].updateDisplay();
  });

  this.plugins.on('plugin disabled', function(name) {
    self.pluginState[name] = false;
    self.pluginItems[name].updateDisplay();
  });
}

// add plugin checkbox widget
PluginsUI.prototype.addPlugin = function (name) {
  this.pluginState[name] = this.plugins.isEnabled(name);
  this.pluginItems[name] = this.folder.add(this.pluginState, name);
  this.pluginItems[name].onChange(setStateForPlugin(this, name));
};

// set new plugin state when user toggles it in GUI
function setStateForPlugin(self, name) {
  return function(newState) {
    if (newState)
      self.plugins.enable(name);
    else
      self.plugins.disable(name);
  };
}
