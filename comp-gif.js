const EventUtils = require('util-events')
cc.Class({
  name: 'Gif',
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
    onAnimateFinished: {
      type: cc.Component.EventHandler,
      default: null
    },
    prefix: '',
    from: -1,
    to: -1,
    frameSequence: '',
    sample: 10,
    repeatCount: -1
  },
  onLoad () {
    this.init();
  },
  init () {
    this._frames = this.atlas.getSpriteFrames();
    this._createAtlas();
    if (!this.getComponent(cc.Sprite)) this.addComponent(cc.Sprite);
    const anim = this.animation = this.addComponent(cc.Animation);
    const clip = this.clip = cc.AnimationClip.createWithSpriteFrames(this._getFrames(), this.sample);

    // animation clip name must be set before add to animation
    clip.name = 'comp-spriteframe-anim'
    anim.addClip(clip);
    if (this.playOnLoad) {
      this.play(this.repeatCount, this.wrapMode);
    }
  },
  showFrameAt (index) {
    const frame = this._frames[index];
    if (!frame) return false;
    const sprite = this.node.getComponent(cc.Sprite)
    sprite.spriteFrame = frame;
    return frame;
  },
  play (repeatCount = Infinity, wrapMode = cc.WrapMode.Loop, callback = null) {
    const state = this.animation.play(this.clip.name);
    state.wrapMode = wrapMode;
    state.repeatCount = this.repeatCount < 0 ? Infinity : repeatCount;
    this.animation.once('finished', callback || this._onAnimateFinished, this);
  },
  playp (repeatCount = 1) {
    return new Promise((resolve) => {
      this.play(repeatCount, cc.WrapMode.Normal, _ => {
        resolve();
      });
    })
  },
  _onAnimateFinished (e) {
    EventUtils.callHandler(this.onAnimateFinished, [e, this.animation, this]);
  },
  _createAtlas () {
    this.atlas = new cc.SpriteAtlas();
    this._frames.forEach(f => this.atlas._spriteFrames[f._name] = f);
  },
  _getFrames () {
    // frame sequence has higher priority thant from+to
    if (this.frameSequence) {
      let indices = this.frameSequence.split(',');
      return indices.map(i => this.atlas.getSpriteFrame(`${this.prefix}${i}`));
    }

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