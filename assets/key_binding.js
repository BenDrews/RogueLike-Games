Game.KeyBinding = {
  _availableBindings: ['numpad','wasd'],
  _curBindingKey: '',
  _currentBindingLookup: {},

  setKeyBinding:function (bindingSetKey) {
    this._curBindingKey = bindingSetKey || 'numpad';
    this.calcBindingLookups();
  },
  getKeyBinding:function () {
    return this._curBindingKey;
  },
  swapToNextKeyBinding: function () {
    var nextBindingIndex = this._availableBindings.indexOf(this._curBindingKey);
    if (nextBindingIndex < 0) { return; } // can only swap to next if the current is in the 'available' list - prevents swapping away from special sets like 'persist'
    nextBindingIndex++;
    if (nextBindingIndex >= this._availableBindings.length) {
      nextBindingIndex = 0;
    }
    this.setKeyBinding(this._availableBindings[nextBindingIndex]);
    Game.Message.ageMessages();
    this.informPlayer();
  },
  informPlayer: function () {
    Game.Message.send('using '+this._curBindingKey+' key bindings');
    Game.renderDisplayMessage();
  },

  calcBindingLookups:function () {
    // console.log('calcBindingLookups for '+this._curBindingKey);
    this._currentBindingLookup = {
      keydown:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      },
      keypress:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      },
      keyup:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      }
    };
    for (var actionLookupKey in this.Action) {
      if (this.Action.hasOwnProperty(actionLookupKey)) {
        var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
        if (bindingInfo) {
          var metaKey = 'nometa';
          if (bindingInfo.inputMetaCtrl && bindingInfo.inputMetaShift) {
            metaKey = 'ctrlshift';
          } else if (bindingInfo.inputMetaShift) {
            metaKey = 'shift';
          } else if (bindingInfo.inputMetaCtrl) {
            metaKey = 'ctrl';
          }

          this._currentBindingLookup[bindingInfo.inputType][metaKey][bindingInfo.inputMatch] = {
            actionKey: actionLookupKey,
            boundLabel: bindingInfo.label,
            binding: bindingInfo,
            action: Game.KeyBinding.Action[actionLookupKey]
          };
        }
      }
    }
  },

  getInputBinding: function (inputType,inputData) {
    var metaKey = 'nometa';
    if (inputData.ctrlKey && inputData.shiftKey) {
      metaKey = 'ctrlshift';
    } else if (inputData.shiftKey) {
      metaKey = 'shift';
    } else if (inputData.ctrlKey) {
      metaKey = 'ctrl';
    }
    var bindingKey = inputData.keyCode;
    if (inputType === 'keypress') {
        bindingKey = String.fromCharCode(inputData.charCode);
    }
    console.log(inputType + " " + metaKey + " " + bindingKey);
    return this._currentBindingLookup[inputType][metaKey][bindingKey] || false;
  },

  getLabelForAction: function (actionLookupKey) {
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo.label;
    }
    return '';
  },

  Action: {
    PERSISTENCE      : {action_group:'meta'    ,guid:Game.util.uniqueId() ,ordering:2 ,short:'games'    ,long :'save or load or restart',
      all: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PERSISTENCE_SAVE : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.1 ,short:'save'     ,long :'save the current game',
      persist: {label:'s' ,inputMatch:ROT.VK_S ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PERSISTENCE_LOAD : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.2 ,short:'restore'  ,long :'restore from the saved game',
      persist: {label:'l' ,inputMatch:ROT.VK_L ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PERSISTENCE_NEW  : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.3 ,short:'new game' ,long :'start a new game',
      persist: {label:'n' ,inputMatch:ROT.VK_N ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },

    SET_MOVE_U    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight up',
      numpad: {label:'8' ,inputMatch:ROT.VK_UP ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'w' ,inputMatch:ROT.VK_W       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    SET_MOVE_L    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight left',
      numpad: {label:'4' ,inputMatch:ROT.VK_LEFT ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'a' ,inputMatch:ROT.VK_A       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    SET_MOVE_R    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight right',
      numpad: {label:'6' ,inputMatch:ROT.VK_RIGHT ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'d' ,inputMatch:ROT.VK_D       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    SET_MOVE_D    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight down',
      numpad: {label:'2' ,inputMatch:ROT.VK_DOWN ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'x' ,inputMatch:ROT.VK_S       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    UNSET_MOVE_U    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight up',
      numpad: {label:'8' ,inputMatch:ROT.VK_UP ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'w' ,inputMatch:ROT.VK_W       ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    UNSET_MOVE_L    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight left',
      numpad: {label:'4' ,inputMatch:ROT.VK_LEFT ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'a' ,inputMatch:ROT.VK_A       ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    UNSET_MOVE_R    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight right',
      numpad: {label:'6' ,inputMatch:ROT.VK_RIGHT ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'d' ,inputMatch:ROT.VK_D       ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    UNSET_MOVE_D    : {action_group:'movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight down',
      numpad: {label:'2' ,inputMatch:ROT.VK_DOWN ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      wasd  : {label:'x' ,inputMatch:ROT.VK_S       ,inputType:'keyup' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    //HELP action definition goes here
    CHANGE_BINDINGS : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'controls' ,long:'change which keys do which commands',
      all: {label:'\\'  ,inputMatch:ROT.VK_BACK_SLASH ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    CANCEL          : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'cancel'   ,long:'cancel/close the current action/screen',
      all: {label:'Esc' ,inputMatch:ROT.VK_ESCAPE     ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    }
  }
};
