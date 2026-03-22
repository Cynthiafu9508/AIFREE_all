Page({
  data: {
    statusBarHeight: 0,
    scrollTo: '',
    messages: [
      { id: 1,  type: 'time',  text: '1月10日10:29' },
      { id: 2,  type: 'left',  text: '今天想听故事吗？我可以给你讲一个有趣的故事哦！' },
      { id: 3,  type: 'right', text: '我不想听故事，我想玩玩具。' },
      { id: 4,  type: 'right', text: '但是我的小飞侠找不到了。' },
      { id: 5,  type: 'left',  text: '哎呀，小飞侠是你最心爱的...' },
      { id: 6,  type: 'right', text: '贝贝鲨你能帮我找吗？' },
      { id: 7,  type: 'left',  text: '我也好想帮你找呀，我可以替你想想办法，比如它可能卡在沙发缝里，或者掉到床底下了。' },
      { id: 8,  type: 'time',  text: '12:29' },
      { id: 9,  type: 'left',  text: '今天想听故事吗？我可以给你讲一个有趣的故事哦！' },
      { id: 10, type: 'right', text: '我不想听故事，我想玩玩具。' },
      { id: 11, type: 'right', text: '但是我的小飞侠找不到了。' },
      { id: 12, type: 'left',  text: '哎呀，小飞侠是你最心爱的...' },
      { id: 13, type: 'right', text: '贝贝鲨你能帮我找吗？' },
      { id: 14, type: 'left',  text: '我也好想帮你找呀，我可以替你想想办法，比如它可能卡在沙发缝里，或者掉到床底下了。' },
    ]
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
  },

  onReady() {
    // 滚动到底部占位元素，比滚动到最后一条消息更稳定
    this.setData({ scrollTo: 'list-bottom' })
  },

  goBack() { wx.navigateBack() }
})
