export default class Gif extends cc.Component {
  /**
   * 使用单个图集还是多图集
   */
  multiAtlas: boolean;

  /**
   * 单个图集
   */
  atlas: cc.SpriteAtlas | null;

  /**
   * 多图集
   */
  atlases: cc.SpriteAtlas[];

  /**
   * 帧数组
   */
  frames: cc.SpriteFrame;

  srcBlendFactor: number;

  dstBlendFactor: number;

  /**
   * 播放模式
   */
  wrapMode: cc.WrapMode;

  /**
   * 是否加载后就播放
   */
  playOnLoad: boolean;

  /**
   * 播放结束回调
   */
  onAnimateFinished: cc.Component.EventHandler | null;

  /**
   * 图集帧名序号是否在补0
   * @description
   *   10帧，paddingZero=true时，帧名字则为prefix01..prefix10
   *   paddingZero=false时，第一帧名字则为prefix1..prefix10
   */
  paddingZero: boolean;

  /**
   * 每帧名字前缀
   */
  prefix: string;

  /**
   * 每帧名字后缀
   */
  suffix: string;

  /**
   * 开始帧的索引
   */
  from: number;

   /**
   * 结束帧的索引
   */
  to: number;

  /**
   * 用图集中的指定帧作为动画帧，','分割
   */
  frameSequence: string;

  /**
   * 动画的帧速率
   */
  sample: number;

  /**
   * 播放次数
   */
  repeatCount: number;

  /**
   * 根据当前设置初始化帧数组
   *
   * @memberof Gif
   */
  init();

  /**
   * 显示某一帧
   *
   * @param {number} index
   * @returns {cc.SpriteFrame}
   * @memberof Gif
   */
  showFrameAt(index:number): cc.SpriteFrame;

  /**
   * 根据名字显示某一帧
   *
   * @param {string} name
   * @returns {cc.SpriteFrame}
   * @memberof Gif
   */
  showFrame(name:string): cc.SpriteFrame;

  /**
   * 播放序列帧动画
   *
   * @param {number} repeatCount 播放次数
   * @param {cc.WrapMode} wrapMode 动画使用的循环模式
   * @param {() => {}} callback 播放完毕回调
   * @memberof Gif
   */
  play(repeatCount:number, wrapMode:cc.WrapMode, callback: () => {}): void;

  /**
   * play的promise版
   *
   * @param {number} repeatCount 播放次数
   * @returns {Promise<any>}
   * @memberof Gif
   */
  playp(repeatCount:number): Promise<void>;
}
