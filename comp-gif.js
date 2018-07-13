const EventUtils = require('util-events')
cc.Class({
  name: 'CompGif',
  extends: cc.Component,
  properties: {
    atlas: {
      type: cc.SpriteAtlas,
      default: null
    },
    wrapMode: {
      type: cc.WrapMode,
      default: cc.WrapMode.Loop
    },
    playOnLoad: true,
    onAnimationEnd: {
      type: cc.Component.EventHandler,
      default: null
    },
    prefix: '',
    from: -1,
    to: -1,
    sample: 10,
    repeatCount: -1
  },
  onLoad () {
    this.init();
  },
  init () {
    this._frames = this.atlas.getSpriteFrames();
    this._createAtlas();
    this.addComponent(cc.Sprite);
    const anim = this.animation = this.addComponent(cc.Animation);
    const clip = this.clip = cc.AnimationClip.createWithSpriteFrames(this._getFrames(), this.sample);

    // animation clip name must be set before add to animation
    clip.name = 'comp-spriteframe-anim'
    clip.wrapMode = this.wrapMode;
    anim.addClip(clip);
    if (this.playOnLoad) {
      let state = anim.play(clip.name);
      state.repeatCount = this.repeatCount < 0 ? Infinity : this.repeatCount;
    }
    anim.on('lastframe', e => {
      EventUtils.callHandler(this.onLastFrame, [e, anim, this]);
    });
  },
  play (repeatCount = Infinity, wrapMode = cc.WrapMode.Loop) {
    const state = this.animation.play(this.clip.name);
    state.wrapMode = wrapMode;
    state.repeatCount = repeatCount;
  },
  _createAtlas () {
    this.atlas = new cc.SpriteAtlas();
    this._frames.forEach(f => this.atlas._spriteFrames[f._name] = f);
  },
  _getFrames () {
    if (this.from < 0 || this.to < 0) {
      return this._frames;
    }
    const frames = [];
    for(let i = this.from; i <= this.to; ++i) {
      let frame = this.atlas.getSpriteFrame(`${this.prefix}${i}`);
      if (frame) frames.push(frame);
    }
    return frames;
  }
});