Game.Symbol = function (properties) {
  properties = properties || {};
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._char = properties.chr || ' ';
  this.attr._fg = properties.fg || "transparent";
  this.attr._bg = properties.bg || Game.UIMode.DEFAULT_COLOR_BG;
};

Game.Symbol.prototype.getChar = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function () {
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function () {
  return this.attr._bg;
};

Game.Symbol.prototype.draw = function (display,disp_x,disp_y,masked) {
  if(masked) {
    display.draw(disp_x,disp_y,[this.attr._char, 'z'], this.attr._fg);
  } else {
  display.draw(disp_x,disp_y,this.attr._char, this.attr._fg);
}
};

Game.Symbol.NULL_SYMBOL = new Game.Symbol();
Game.Symbol.AVATAR = new Game.Symbol({chr:'@',fg:'#dda'});
Game.Symbol.ENEMY = new Game.Symbol({chr:'q',fg:'#dda'});
