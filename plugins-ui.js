'use strict';

var createDatgui = require('dat-gui');

module.exports = function(game, opts) {
  return new PluginsUI(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-debug'],    // for appending to its gui, if available
  clientOnly: true
};

function PluginsUI(game, opts) {
  this.game = game;
  this.plugins = this.game.plugins;

  opts = opts || {};

  // option to blur self after input, to relinquish keyboard focus to game
  this.autoBlur = opts.autoBlur || false
  
  var guiOpts = opts.guiOpts || {}
  this.gui = opts.gui || (game.plugins && game.plugins.get('voxel-debug') ? game.plugins.get('voxel-debug').gui : new createDatgui.GUI(guiOpts));
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

    // if autoBlur is set, and gui has keyboard focus, blur self
    if (self.autoBlur && document){
      if (self.gui.domElement.contains(document.activeElement)) {
        document.activeElement.blur()
      }
    }

  };
}
