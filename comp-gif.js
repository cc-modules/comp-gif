const EventUtils = require('util-events')
const ConsoleLogger = require('util-console-logger');
cc.Class({
  name: 'Gif',
  extends: cc.Component,
  properties: {
    multiAtlas: false,
    atlas: {
      type: cc.SpriteAtlas,
      default: null
    },
    atlases: {
      type: [cc.SpriteAtlas],
      default: () => []
    },
    frames: {
      type: [cc.SpriteFrame],
      default: () => []
    },
    srcBlendFactor: {
      type: cc.macro ? cc.macro.BlendFactor : cc.BlendFunc.BlendFactor,
      default: cc.macro.BlendFactor ? cc.macro.BlendFactor.SRC_ALPHA : cc.BlendFunc.BlendFactor.SRC_ALPHA,
    },
    dstBlendFactor: {
      type: cc.macro ? cc.macro.BlendFactor : cc.BlendFunc.BlendFactor,
      default: cc.macro.BlendFactor ? cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA : cc.BlendFunc.BlendFactor.ONE_MINUS_SRC_ALPHA,
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
    paddingZero: true,
    prefix: '',
    suffix: '',
    from: -1,
    to: -1,
    frameSequence: '',
    sample: 10,
    repeatCount: -1
  },
  onLoad () {
    this.logger = new ConsoleLogger(this.name);
    this.init();
  },
  init () {
    const noFrames = !this.frames || !this.frames.length;
    const noAtlas = !this.atlas;
    if (noFrames && noAtlas && (this.multiAtlas && !this.atlases.length)) {
      this.logger.warn(`one of frames or atlas or atlases is required!`);
      return;
    }
    if (this.atlas) {
      this.logger.log(`using atlas`);
      this._frames = this.atlas.getSpriteFrames();
      if (!this._frames.length) {
        this.logger.log(`with frames`);
        this._frames = this.frames;
      }
      this._createAtlas();
    } else if (!this.multiAtlas) {
      this.logger.log(`using frames`);
      this._frames = this.frames;
    }

    let sprite = this.getComponent(cc.Sprite)
    if (!sprite) sprite = this.addComponent(cc.Sprite);
    sprite.srcBlendFactor = this.srcBlendFactor;
    sprite.dstBlendFactor = this.dstBlendFactor;
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
    const frame = (this.frames || this._frames)[this.frameIndex = index];
    if (!frame) return false;
    const sprite = this.node.getComponent(cc.Sprite)
    sprite.spriteFrame = frame;
    return frame;
  },
  showFrame (name) {
    const frame = (this.frames || this._frames).find(f => f._name === name);
    if (!frame) return false;
    this.frameName = name;
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
    if (this.onAnimateFinished) {
      EventUtils.callHandler(this.onAnimateFinished, [e, this.animation, this]);
    }
  },
  _createAtlas () {
    this.atlas = new cc.SpriteAtlas();
    this._frames.forEach(f => this.atlas._spriteFrames[f._name] = f);
  },
  _getFrames () {
    if (this.frames && this.frames.length) return this.frames;
    // frame sequence has higher priority thant from+to
    if (this.frameSequence) {
      let indices = this.frameSequence.split(',');
      return indices.map(i => this.atlas.getSpriteFrame(`${this.prefix}${i}${this.suffix}`));
    }

    if (!this.multiAtlas && (this.from < 0 || this.to < 0)) {
      return this._frames;
    }
    
    if (this.multiAtlas) {
      return this.atlases
        .reduce((all, atlas) => all.concat(atlas.getSpriteFrames()), [])
        .sort((a,b) => {
          a = a.name.replace(this.prefix, '').replace(this.suffix, '');
          b = b.name.replace(this.prefix, '').replace(this.suffix, '');
          const dist = this.to - this.from
          a = padZero(a, dist);
          b = padZero(b, dist);
          return a > b ? 1 : -1
        });
    } else {
      const frames = [];
      for(let i = this.from; i <= this.to; ++i) {
        const idx = this.paddingZero ? padZero(i, this.to - this.from) : i;
        const name = `${this.prefix}${idx}${this.suffix}`;
        let frame = this.atlas.getSpriteFrame(name);
        if (frame) frames.push(frame);
      }
      return frames;
    }
  }
});

function padZero (i, n) {
  let zeros = '';
  const len = String(n).length;
  const ilen = String(i).length;
  for (let i = 0; i < len; i++) zeros += '0';
  return `${zeros}${i}`.slice(Math.min(-ilen, -len));
}